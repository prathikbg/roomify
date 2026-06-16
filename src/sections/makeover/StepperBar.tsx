interface Step {
  label: string;
  hint: string;
}

const STEPS: Step[] = [
  { label: 'Upload', hint: 'Your room photo' },
  { label: 'Style', hint: 'Pick a design' },
  { label: 'Generate', hint: 'AI works its magic' },
  { label: 'Result', hint: 'Before & after' },
];

interface Props {
  currentStep: number; // 1..4
}

export default function StepperBar({ currentStep }: Props) {
  return (
    <div className="makeover-stepper" role="navigation" aria-label="Makeover progress">
      {STEPS.map((step, i) => {
        const idx = i + 1;
        const isActive = idx === currentStep;
        const isComplete = idx < currentStep;
        const state = isActive ? 'active' : isComplete ? 'complete' : 'upcoming';

        return (
          <div key={step.label} className={`makeover-stepper__item makeover-stepper__item--${state}`}>
            <div className="makeover-stepper__circle">
              {isComplete ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{idx}</span>
              )}
            </div>
            <div className="makeover-stepper__text">
              <span className="makeover-stepper__label">{step.label}</span>
              <span className="makeover-stepper__hint">{step.hint}</span>
            </div>
            {i < STEPS.length - 1 && <div className="makeover-stepper__connector" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
