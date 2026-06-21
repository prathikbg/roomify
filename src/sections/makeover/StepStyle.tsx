import { useMakeover } from '../../contexts/MakeoverContext';
import { designStyles, budgetLabels } from '../../data/makeoverData';
import type { DesignStyle, BudgetRange } from '../../types/makeover';

export default function StepStyle() {
  const { state, dispatch } = useMakeover();

  const handleStyleSelect = (style: DesignStyle) => {
    dispatch({ type: 'SET_DESIGN_STYLE', payload: style });
  };

  const handleBudgetSelect = (budget: BudgetRange) => {
    dispatch({ type: 'SET_BUDGET', payload: budget });
  };

  const canProceed = state.designStyle;

  return (
    <div className="makeover-step">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: '#f25b29',
            textTransform: 'uppercase',
          }}
        >
          Step 2 of 3
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 400,
            color: '#ffffff',
            marginTop: '1rem',
            lineHeight: 1.2,
          }}
        >
          Choose Your Design Style
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: '#b0b2b5',
            marginTop: '0.75rem',
            maxWidth: '480px',
            margin: '0.75rem auto 0',
            lineHeight: 1.6,
          }}
        >
          Select the style that matches your dream room aesthetic
        </p>
      </div>

      {/* Style Selection Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          maxWidth: '700px',
          margin: '0 auto 3rem',
        }}
      >
        {designStyles.map((style) => (
          <button
            key={style.value}
            onClick={() => handleStyleSelect(style.value)}
            style={{
              padding: '1.5rem 1.25rem',
              border: state.designStyle === style.value
                ? '1px solid #f25b29'
                : '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              background: state.designStyle === style.value
                ? 'rgba(242,91,41,0.1)'
                : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (state.designStyle !== style.value) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (state.designStyle !== style.value) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: state.designStyle === style.value ? 500 : 400,
                color: state.designStyle === style.value ? '#ffffff' : '#d0d0d0',
                marginBottom: '0.4rem',
              }}
            >
              {style.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#888',
                lineHeight: 1.4,
              }}
            >
              {style.description}
            </div>
          </button>
        ))}
      </div>

      {/* Budget Selection */}
      <div style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 400,
            color: '#b0b2b5',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Budget Range (Optional)
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          {Object.entries(budgetLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleBudgetSelect(key as BudgetRange)}
              style={{
                padding: '10px 20px',
                border: state.budgetRange === key
                  ? '1px solid #f25b29'
                  : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                background: state.budgetRange === key
                  ? 'rgba(242,91,41,0.1)'
                  : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: state.budgetRange === key ? '#ffffff' : '#b0b2b5',
              }}
              onMouseEnter={(e) => {
                if (state.budgetRange !== key) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (state.budgetRange !== key) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            padding: '14px 36px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            background: 'transparent',
            color: '#b0b2b5',
            transition: 'all 0.3s ease',
            marginRight: '1rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = '#b0b2b5';
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          disabled={!canProceed}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            padding: '14px 48px',
            borderRadius: '4px',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? '#f25b29' : 'rgba(255,255,255,0.08)',
            color: canProceed ? '#ffffff' : '#666',
            transition: 'all 0.3s ease',
          }}
        >
          Generate Makeover →
        </button>
      </div>
    </div>
  );
}
