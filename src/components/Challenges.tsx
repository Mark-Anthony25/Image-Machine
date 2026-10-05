import { challenges } from '../content/challenges';
import type { ChallengeId } from '../content/challenges';
import { samples } from '../content/samples';
import { Icon } from './Icon';

export function Challenges({ onStart }: { onStart: (id: ChallengeId) => void }) {
  return (
    <div className="challenges-page">
      <div className="page-intro">
        <span className="eyebrow">Learn by trying</span>
        <h1>Four small discoveries.</h1>
        <p>No quiz. No score. Just an image, a question, and room to experiment.</p>
      </div>
      <div className="challenge-grid">
        {challenges.map((c) => (
          <article className="challenge-card" key={c.id}>
            <div className="challenge-image">
              <img
                src={samples.find((s) => s.id === c.sample)!.src}
                alt={`Sample for ${c.title}`}
              />
              <span>{c.number}</span>
            </div>
            <div className="challenge-body">
              <span className="eyebrow">{c.concept}</span>
              <h2>{c.title}</h2>
              <p>{c.goal}</p>
              <button
                className="secondary-button"
                onClick={() => onStart(c.id)}
                aria-label={`Try ${c.title}`}
              >
                <Icon name="pixel" size={18} /> Try this challenge
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="challenge-note">
        There can be more than one useful recipe. Compare what changes and decide what helps.
      </p>
    </div>
  );
}
