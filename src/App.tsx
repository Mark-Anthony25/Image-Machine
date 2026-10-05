import { useEffect, useRef, useState } from 'react';
import { samples } from './content/samples';
import { challenges, evaluateChallenge } from './content/challenges';
import type { ChallengeId } from './content/challenges';
import { operationByType } from './content/operations';
import { readImageFile, readImageUrl } from './lib/image-input';
import { usePipeline } from './hooks/usePipeline';
import type { OperationType, PixelImage, ProcessingStep } from './processing/types';
import type { PixelPosition } from './components/PixelCanvas';
import { ImageInput } from './components/ImageInput';
import { CameraDialog } from './components/CameraDialog';
import { StepList } from './components/StepList';
import { Comparison } from './components/Comparison';
import { PixelInspector } from './components/PixelInspector';
import { Explanation } from './components/Explanation';
import { Learn } from './components/Learn';
import { Challenges } from './components/Challenges';
import { Icon } from './components/Icon';
import './styles.css';

type View = 'Playground' | 'Learn' | 'Challenges' | 'About';
export default function App() {
  const [view, setView] = useState<View>('Playground');
  const [source, setSource] = useState<PixelImage | null>(null),
    [sourceName, setSourceName] = useState('Color study'),
    [sampleId, setSampleId] = useState('color-study');
  const [steps, setSteps] = useState<ProcessingStep[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [scope, setScope] = useState<'all' | 'step'>('all');
  const [pixel, setPixel] = useState<PixelPosition | null>(null),
    [camera, setCamera] = useState(false),
    [loading, setLoading] = useState(true),
    [inputError, setInputError] = useState('');
  const [challengeId, setChallengeId] = useState<ChallengeId | null>(null),
    [hint, setHint] = useState(false),
    [attempted, setAttempted] = useState(false);
  const inputRevision = useRef(0),
    pageHeading = useRef<HTMLHeadingElement>(null),
    previousView = useRef(view);
  const pipeline = usePipeline(source, steps);
  useEffect(() => {
    const revision = ++inputRevision.current;
    void readImageUrl(samples[0].src)
      .then((image) => {
        if (revision === inputRevision.current) {
          setSource(image);
          setLoading(false);
        }
      })
      .catch(() => {
        if (revision === inputRevision.current) {
          setInputError('We could not load the sample. Try uploading an image.');
          setLoading(false);
        }
      });
    return () => {
      ++inputRevision.current;
    };
  }, []);
  useEffect(() => {
    if (previousView.current !== view) {
      previousView.current = view;
      pageHeading.current?.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [view]);
  async function loadImage(
    promise: Promise<PixelImage>,
    name: string,
    id: string,
    keepChallenge = false,
  ) {
    const revision = ++inputRevision.current;
    setLoading(true);
    setInputError('');
    try {
      const image = await promise;
      if (revision !== inputRevision.current) return;
      setSource(image);
      setSourceName(name);
      setSampleId(id);
      setPixel(null);
      if (!keepChallenge) {
        setChallengeId(null);
        setHint(false);
        setAttempted(false);
      }
    } catch (error) {
      if (revision === inputRevision.current)
        setInputError(
          error instanceof Error ? error.message : 'We could not open that image. Try a sample.',
        );
    } finally {
      if (revision === inputRevision.current) setLoading(false);
    }
  }
  function loadSample(id: string, keepChallenge = false) {
    const sample = samples.find((s) => s.id === id)!;
    void loadImage(readImageUrl(sample.src), sample.name, id, keepChallenge);
  }
  function addStep(type: OperationType) {
    if (steps.length >= 12) return;
    const step: ProcessingStep = {
      id: crypto.randomUUID(),
      type,
      enabled: true,
      value: operationByType[type].parameter?.initial ?? 0,
    };
    setSteps([...steps, step]);
    setSelected(step.id);
    setAttempted(true);
  }
  function changeSteps(next: ProcessingStep[]) {
    setSteps(next);
    setAttempted(true);
    if (!next.some((s) => s.id === selected)) {
      setSelected(next.at(-1)?.id ?? null);
      setScope('all');
    }
  }
  function reset() {
    setSteps([]);
    setSelected(null);
    setScope('all');
    setPixel(null);
    setHint(false);
    setAttempted(false);
  }
  function startChallenge(id: ChallengeId) {
    const c = challenges.find((c) => c.id === id)!;
    reset();
    setChallengeId(id);
    setView('Playground');
    loadSample(c.sample, true);
  }
  const selectedIndex = steps.findIndex((s) => s.id === selected);
  const before =
    source &&
    (scope === 'step' && selectedIndex >= 0 ? (pipeline.frames[selectedIndex] ?? source) : source);
  const after =
    source &&
    (scope === 'step' && selectedIndex >= 0
      ? (pipeline.frames[selectedIndex + 1] ?? source)
      : (pipeline.frames.at(-1) ?? source));
  const explanationType = steps.find((s) => s.id === selected)?.type ?? null;
  const explanationInput =
    source && (selectedIndex >= 0 ? (pipeline.frames[selectedIndex] ?? source) : source);
  const challenge = challenges.find((c) => c.id === challengeId);
  const challengeFeedback =
    challenge &&
    after &&
    !pipeline.busy &&
    scope === 'all' &&
    evaluateChallenge(challenge.id, steps, after);
  const activeSteps = steps.filter((s) => s.enabled).length;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to playground
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => setView('Playground')}
            aria-label="Image Machine playground"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <i />
              <span />
            </span>
            <span>
              Image<span className="brand-machine">Machine</span>
            </span>
          </button>
          <nav aria-label="Main navigation">
            {(['Playground', 'Learn', 'Challenges', 'About'] as View[]).map((v) => (
              <button
                key={v}
                className={view === v ? 'current' : ''}
                aria-current={view === v ? 'page' : undefined}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </nav>
          <span className="header-note">
            <Icon name="lock" size={14} /> Made to explore. Private by design.
          </span>
        </div>
      </header>
      <main id="main" className="main-container">
        <h1 ref={pageHeading} tabIndex={-1} className="visually-hidden">
          Image Machine — {view}
        </h1>
        {view === 'Playground' ? (
          <>
            <div className="playground-intro">
              <div>
                <span className="eyebrow">An image-processing playground</span>
                <h1>See how computers transform images.</h1>
                <p>Put an image in. Change its pixels. Discover what happens.</p>
              </div>
              <span className="intro-note">No code. Just curiosity.</span>
            </div>
            <ImageInput
              sampleId={sampleId}
              onFile={(file) => void loadImage(readImageFile(file), file.name, '')}
              onSample={(id) => loadSample(id)}
              onCamera={() => setCamera(true)}
              loading={loading}
            />
            {(inputError || pipeline.error) && (
              <div role="alert" className="error-message">
                {inputError || pipeline.error}
                {pipeline.error ? (
                  <button className="text-button" onClick={pipeline.retry}>
                    Restart processor
                  </button>
                ) : (
                  <button className="text-button" onClick={() => setInputError('')}>
                    Dismiss
                  </button>
                )}
              </div>
            )}
            {source && !steps.length && (
              <div className="mobile-first-step">
                <span>See your first transformation.</span>
                <button
                  className="secondary-button"
                  onClick={() => addStep('grayscale')}
                  aria-label="Quick add Remove Color"
                >
                  <Icon name="color" size={17} /> Remove Color
                </button>
              </div>
            )}
            {challenge && (
              <section className="active-challenge" aria-label="Active challenge">
                <div>
                  <span className="eyebrow">Challenge {challenge.number}</span>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.goal}</p>
                  {hint && <p className="hint">{challenge.hint}</p>}
                  {challengeFeedback && (
                    <p className="challenge-feedback" data-testid="challenge-feedback">
                      <Icon name="book" size={18} />
                      {challenge.feedback}
                    </p>
                  )}
                </div>
                <div className="challenge-actions">
                  <button
                    className="text-button"
                    disabled={!attempted}
                    onClick={() => setHint(true)}
                  >
                    Give me a hint
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Exit challenge"
                    onClick={() => setChallengeId(null)}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              </section>
            )}
            <div className="workspace">
              <StepList
                steps={steps}
                selected={selected}
                onAdd={addStep}
                onChange={changeSteps}
                onSelect={(id) => {
                  setSelected(id);
                  setScope('step');
                }}
                onReset={reset}
              />
              <div className="workspace-main">
                {before && after ? (
                  <>
                    <Comparison
                      before={before}
                      after={after}
                      steps={steps}
                      selected={selected}
                      scope={scope}
                      onScope={setScope}
                      pixel={pixel}
                      onPixel={setPixel}
                      busy={pipeline.busy || loading}
                      sourceName={sourceName}
                    />
                    {activeSteps >= 2 && (
                      <div className="pipeline-discovery">
                        <Icon name="book" size={19} />
                        <div>
                          <strong>You built an image-processing pipeline.</strong>
                          <p>
                            Each step transforms the information passed to the next step. Try moving
                            a step to see why order matters.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="under-the-image">
                      <PixelInspector
                        before={before}
                        after={after}
                        pixel={pixel}
                        onPixel={setPixel}
                      />
                      <Explanation
                        key={selected ?? 'initial'}
                        type={explanationType}
                        enabled={steps.find((s) => s.id === selected)?.enabled ?? true}
                        before={explanationInput!}
                        pixel={pixel}
                      />
                    </div>
                  </>
                ) : (
                  <div className="loading-image" role="status">
                    {loading ? 'Getting your first image ready…' : 'Choose an image to begin.'}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : view === 'Learn' ? (
          <Learn source={source} onPlayground={() => setView('Playground')} />
        ) : view === 'Challenges' ? (
          <Challenges onStart={startChallenge} />
        ) : (
          <div className="about-page">
            <span className="eyebrow">About Image Machine</span>
            <h1>Understanding starts with seeing.</h1>
            <p className="about-lead">
              Image Machine is a small, open-source learning environment for a big idea: computers
              see images as numbers.
            </p>
            <section>
              <h2>See it → Try it → Understand it → Look inside</h2>
              <p>
                We start with the image, not the equation. Use five simple operations to discover
                pixels, intensity, smoothing, segmentation, and edges. When you meet these ideas
                later in Python or OpenCV, they’ll already feel familiar.
              </p>
            </section>
            <section>
              <h2>Your images stay on your device.</h2>
              <p>
                Processing happens in your browser. Image Machine does not upload images, record
                camera frames, track activity, or save your images. Refreshing the page clears your
                experiment. The website host may keep ordinary page-request logs; your image pixels
                are never part of those requests.
              </p>
            </section>
            <section>
              <h2>Small by design.</h2>
              <p>
                This is a place to understand image processing, not a photo editor or model trainer.
                The five operations help turn visual information into useful clues for computer
                vision.
              </p>
              <p>
                Large images are resized to a maximum of 960 pixels on the longest side. Files up to
                25 MB are accepted. Transparent images are placed on white; animated images use a
                decoded frame.
              </p>
            </section>
            <section>
              <h2>Original samples. Open source.</h2>
              <p>
                Our four sample images were created for teaching color, contrast, boundaries, and
                noise. Application code and samples are MIT licensed.
              </p>
              <a
                href="https://github.com/Mark-Anthony25/Image-Machine"
                target="_blank"
                rel="noreferrer"
              >
                View the source on GitHub
              </a>
            </section>
            <button className="primary-button" onClick={() => setView('Playground')}>
              Start experimenting
            </button>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">Image Machine</span>
          <span>See it. Try it. Understand it.</span>
        </div>
        <p>
          <Icon name="lock" size={14} /> Your images stay on your device. Processing happens in your
          browser.
        </p>
      </footer>
      {camera && (
        <CameraDialog
          onClose={() => setCamera(false)}
          onCapture={(image) => {
            ++inputRevision.current;
            setSource(image);
            setSourceName('Camera image');
            setSampleId('');
            setPixel(null);
            setChallengeId(null);
            setLoading(false);
            setInputError('');
          }}
        />
      )}
    </>
  );
}
