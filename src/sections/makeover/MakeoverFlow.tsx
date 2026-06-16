import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MakeoverProvider, useMakeover } from '../../contexts/MakeoverContext';
import type { DesignStyle } from '../../types/makeover';
import StepUpload from './StepUpload';
import StepStyle from './StepStyle';
import StepGenerating from './StepGenerating';
import StepResults from './StepResults';
import StepperBar from './StepperBar';

function MakeoverContent() {
  const navigate = useNavigate();
  const { state, dispatch } = useMakeover();

  // Check for pre-selected style from Featured Transformations
  useEffect(() => {
    const presetStyle = sessionStorage.getItem('makeoverPresetStyle');
    if (presetStyle) {
      const validStyles: DesignStyle[] = [
        'modern', 'scandinavian', 'japandi', 'luxury',
        'boho', 'industrial', 'traditional-indian', 'smart-home',
      ];
      if (validStyles.includes(presetStyle as DesignStyle)) {
        dispatch({ type: 'SET_DESIGN_STYLE', payload: presetStyle as DesignStyle });
      }
      sessionStorage.removeItem('makeoverPresetStyle');
    }
  }, [dispatch]);

  const handleClose = () => {
    navigate('/');
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepUpload />;
      case 2:
        return <StepStyle />;
      case 3:
        return <StepGenerating />;
      case 4:
        return <StepResults />;
      default:
        return <StepUpload />;
    }
  };

  return (
    <section
      id="makeover-flow"
      style={{
        position: 'relative',
        background: '#0d0d0d',
        padding: '80px 1.5rem',
        minHeight: '100vh',
      }}
    >
      {/* Close / Back to Home button */}
      <button
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '10px 18px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          color: '#b0b2b5',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(12px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.color = '#b0b2b5';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Close
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <StepperBar currentStep={state.currentStep} />

        {/* Preset style indicator */}
        {state.designStyle && state.currentStep === 1 && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              padding: '12px 20px',
              background: 'rgba(242,91,41,0.08)',
              border: '1px solid rgba(242,91,41,0.2)',
              borderRadius: '8px',
              maxWidth: '400px',
              margin: '0 auto 1.5rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#f25b29',
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {state.designStyle.charAt(0).toUpperCase() + state.designStyle.slice(1)}
              </span>{' '}
              style pre-selected from Featured Transformations
            </span>
          </div>
        )}
        {renderStep()}
      </div>
    </section>
  );
}

export default function MakeoverFlow() {
  return (
    <MakeoverProvider>
      <MakeoverContent />
    </MakeoverProvider>
  );
}
