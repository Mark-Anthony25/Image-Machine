import { useState } from 'react';
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
  onReset: () => void;
}
export function StepList({ steps, selected, onAdd, onChange, onSelect, onReset }: Props) {
  const [dragged, setDragged] = useState<string | null>(null);
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
        <h2 id="recipe-heading">
          <span className="section-number">02</span> Your image recipe
        </h2>
        <button
          className="text-button"
          aria-label="Reset recipe"
          onClick={onReset}
          disabled={!steps.length}
        >
          <Icon name="reset" size={16} /> Reset
        </button>
      </div>
      <p className="recipe-intro">Add a step. See what changes.</p>
      <div className="recipe-start">
        <Icon name="pixel" size={18} />
        <span>Original image</span>
        <span className="small muted">INPUT</span>
      </div>
      <ol className="step-list">
        {steps.map((step, index) => {
          const definition = operationByType[step.type];
          const parameter = definition.parameter;
          return (
            <li
              key={step.id}
              data-step-type={step.type}
              className={`step ${selected === step.id ? 'active' : ''} ${step.enabled ? '' : 'disabled'}`}
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
                <span className="drag-handle" title="Drag to reorder">
                  <Icon name="drag" size={16} />
                </span>
                <button
                  className="step-title"
                  aria-label={`Inspect ${definition.beginnerName} step`}
                  onClick={() => onSelect(step.id)}
                >
                  <Icon name={operationIcons[step.type]} size={18} />
                  {definition.beginnerName}
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${definition.beginnerName}`}
                  onClick={() => onChange(steps.filter((s) => s.id !== step.id))}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
              {parameter && (
                <label className="parameter-label">
                  {parameter.label}
                  <output>
                    {step.value > 0 && step.type === 'brightness' ? '+' : ''}
                    {step.value}
                    {parameter.unit}
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
              <div className="step-bottom">
                <label className="enable-step">
                  <input
                    type="checkbox"
                    checked={step.enabled}
                    aria-label={`Enable ${definition.beginnerName}`}
                    onChange={(e) => update(step.id, { enabled: e.target.checked })}
                  />
                  {step.enabled ? 'On' : 'Off'}
                </label>
                <span className="step-position">Step {index + 1}</span>
                <div className="move-buttons">
                  <button
                    className="icon-button"
                    aria-label={`Move ${definition.beginnerName} up`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <Icon name="up" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Move ${definition.beginnerName} down`}
                    disabled={index === steps.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <Icon name="down" size={16} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {!steps.length && (
        <div className="empty-recipe">
          <span className="empty-path" aria-hidden="true">
            ↓
          </span>
          <p>
            What could your image become?
            <br />
            <span className="muted">Try removing the color first.</span>
          </p>
        </div>
      )}
      <div className="recipe-end">
        <span className="output-marker" />
        <span>Your result</span>
        <span className="small muted">OUTPUT</span>
      </div>
      <div className="add-steps">
        <h3>Add a processing step</h3>
        {operations.map((o) => (
          <button
            key={o.type}
            className="operation-button"
            aria-label={`Add ${o.beginnerName}`}
            disabled={steps.length >= 12}
            onClick={() => onAdd(o.type)}
          >
            <span className="operation-icon">
              <Icon name={operationIcons[o.type]} />
            </span>
            <span>
              {o.beginnerName}
              <small>{o.description}</small>
            </span>
            <Icon name="plus" size={18} />
          </button>
        ))}
        {steps.length >= 12 && (
          <p className="small">This recipe has 12 steps. Remove a step to add another.</p>
        )}
      </div>
    </aside>
  );
}
