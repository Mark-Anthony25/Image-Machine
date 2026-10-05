import { useEffect, useRef, useState } from 'react';
import { operationByType, operations } from '../content/operations';
import type { OperationType, ProcessingStep } from '../processing/types';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export const operationIcons: Record<OperationType, IconName> = {
  grayscale: 'color',
  brightness: 'sun',
  blur: 'blur',
  threshold: 'threshold',
  edges: 'edges',
};
interface Props {
  steps: ProcessingStep[];
  selected: string | null;
  onAdd: (type: OperationType) => void;
  onChange: (steps: ProcessingStep[]) => void;
  onSelect: (id: string) => void;
  onCompare: (id: string) => void;
  onReset: () => void;
}
export function StepList({
  steps,
  selected,
  onAdd,
  onChange,
  onSelect,
  onCompare,
  onReset,
}: Props) {
  const [dragged, setDragged] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<string | null>(null);
  const picker = useRef<HTMLDetailsElement>(null),
    list = useRef<HTMLOListElement>(null),
    firstAction = useRef<HTMLButtonElement>(null);
  const previousLength = useRef(steps.length);
  useEffect(() => {
    if (steps.length !== previousLength.current) {
      const added = steps.length > previousLength.current;
      if (added || document.activeElement === document.body) {
        const target = steps.length
          ? list.current?.querySelector<HTMLButtonElement>('li:last-child .step-title')
          : firstAction.current;
        target?.focus({ preventScroll: true });
      }
    }
    previousLength.current = steps.length;
  }, [steps.length]);
  function add(type: OperationType) {
    setCollapsed(null);
    if (picker.current) picker.current.open = false;
    onAdd(type);
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= steps.length) return;
    const next = [...steps];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }
  function update(id: string, patch: Partial<ProcessingStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  return (
    <aside className="recipe" aria-labelledby="recipe-heading">
      <div className="section-heading">
        <h2 id="recipe-heading">Your steps</h2>
        {!!steps.length && (
          <button className="text-button" onClick={onReset}>
            <Icon name="reset" size={16} /> Start over
          </button>
        )}
      </div>
      {!steps.length && (
        <div className="first-step">
          <p>Start with a simple change.</p>
          <button
            ref={firstAction}
            className="primary-button"
            aria-label="Add Remove color"
            onClick={() => add('grayscale')}
          >
            <Icon name="color" size={18} /> Remove color
          </button>
        </div>
      )}
      <details className="step-picker" ref={picker}>
        <summary>Add a step</summary>
        <div className="add-steps">
          {operations.map((o) => (
            <button
              key={o.type}
              className="operation-button"
              aria-label={`Add ${o.beginnerName}`}
              disabled={steps.length >= 12}
              onClick={() => add(o.type)}
            >
              <span className="operation-icon">
                <Icon name={operationIcons[o.type]} />
              </span>
              <span>
                {o.beginnerName}
                <small>{o.description}</small>
              </span>
            </button>
          ))}
          {steps.length >= 12 && (
            <p className="small">You have 12 steps. Remove one to add another.</p>
          )}
        </div>
      </details>
      <ol className="step-list" ref={list}>
        {steps.map((step, index) => {
          const definition = operationByType[step.type],
            parameter = definition.parameter;
          const expanded = selected === step.id && collapsed !== step.id;
          return (
            <li
              key={step.id}
              data-step-type={step.type}
              className={`step ${expanded ? 'active' : ''} ${step.enabled ? '' : 'disabled'}`}
              draggable
              onDragStart={(e) => {
                setDragged(step.id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', step.id);
              }}
              onDragEnd={() => setDragged(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged)
                  move(
                    steps.findIndex((s) => s.id === dragged),
                    index,
                  );
                setDragged(null);
              }}
            >
              <div className="step-top">
                <span className="step-index" aria-hidden="true">
                  {index + 1}
                </span>
                <button
                  className="step-title"
                  aria-label={`Inspect ${definition.beginnerName} step`}
                  aria-expanded={expanded}
                  aria-controls={`controls-${step.id}`}
                  onClick={() => {
                    setCollapsed(expanded ? step.id : null);
                    onSelect(step.id);
                  }}
                >
                  {definition.beginnerName}
                  {!step.enabled && <small>Off</small>}
                  <Icon name={expanded ? 'up' : 'down'} size={15} />
                </button>
              </div>
              <div id={`controls-${step.id}`} hidden={!expanded}>
                {parameter && (
                  <label className="parameter-label">
                    {parameter.label}
                    <output>
                      {step.value > 0 && step.type === 'brightness' ? '+' : ''}
                      {step.value}
                    </output>
                    <input
                      type="range"
                      min={parameter.min}
                      max={parameter.max}
                      step={parameter.step}
                      value={step.value}
                      aria-label={parameter.label}
                      onChange={(e) => update(step.id, { value: Number(e.target.value) })}
                    />
                  </label>
                )}
                <details className="step-options">
                  <summary>Step options</summary>
                  <div className="step-options-body">
                    <label className="enable-step">
                      <input
                        type="checkbox"
                        checked={step.enabled}
                        aria-label={`Use this step: ${definition.beginnerName}`}
                        onChange={(e) => update(step.id, { enabled: e.target.checked })}
                      />
                      Use this step
                    </label>
                    <div className="move-buttons" aria-label="Change step order">
                      <button
                        className="secondary-button"
                        aria-label={`Move up: ${definition.beginnerName}`}
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        <Icon name="up" size={16} />
                        Move up
                      </button>
                      <button
                        className="secondary-button"
                        aria-label={`Move down: ${definition.beginnerName}`}
                        disabled={index === steps.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        <Icon name="down" size={16} />
                        Move down
                      </button>
                    </div>
                    <button className="text-button" onClick={() => onCompare(step.id)}>
                      Compare this step
                    </button>
                    <button
                      className="text-button remove-step"
                      aria-label={`Remove step: ${definition.beginnerName}`}
                      onClick={() => onChange(steps.filter((s) => s.id !== step.id))}
                    >
                      Remove step
                    </button>
                  </div>
                </details>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
