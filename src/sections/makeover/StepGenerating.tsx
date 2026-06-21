import { useEffect, useState } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import {
  generateRoomMakeover,
  getAiStatus,
  getColorPalette,
  getFurnitureRecommendations,
} from '@/lib/aiClient';

export default function StepGenerating() {
  const { state, dispatch } = useMakeover();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Analyzing your room...');

  const aiStatus = getAiStatus();

  useEffect(() => {
    if (!state.roomType || !state.designStyle || state.isGenerating || state.generatedImage) return;

    dispatch({ type: 'SET_GENERATING', payload: true });

    const runGeneration = async () => {
      const isMock = aiStatus.isMock;

      setStatusText('Analyzing your room layout...');
      setProgress(10);
      await delay(600);

      setStatusText(`Applying ${state.designStyle} style with ${isMock ? 'demo' : 'AI'}...`);
      setProgress(30);

      let imageUrl = '';
      let provider = aiStatus.provider;
      try {
        const result = await generateRoomMakeover(state.roomType!, state.designStyle!);
        imageUrl = result.imageUrl;
        provider = result.provider;
        dispatch({ type: 'SET_GENERATED_IMAGE', payload: imageUrl });
        setStatusText(`Design complete (${provider})`);
      } catch {
        // Fallback to uploaded image
        imageUrl = state.uploadedImage || '';
        dispatch({ type: 'SET_GENERATED_IMAGE', payload: imageUrl });
        setStatusText('Using original image (fallback)');
      }
      setProgress(60);

      setStatusText('Extracting color palette...');
      setProgress(75);
      const palette = getColorPalette(state.designStyle!);
      await delay(400);

      setStatusText('Finding furniture recommendations...');
      setProgress(85);
      const furniture = getFurnitureRecommendations(state.roomType!);
      await delay(400);

      setProgress(100);
      setStatusText('Your dream room is ready!');
      await delay(500);

      const detectedItems = furniture.items.map((item) => ({
        name: item.name.split(' ').slice(-2).join(' '),
        matchedProduct: {
          name: item.name,
          price: item.price,
          affiliateLink: item.link,
        },
      }));

      dispatch({
        type: 'SET_RESULTS',
        payload: {
          detectedItems,
          colorPalette: palette,
          pinterestImage: imageUrl || state.uploadedImage || '',
        },
      });

      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'NEXT_STEP' });
    };

    runGeneration().catch(() => {
      dispatch({ type: 'SET_GENERATED_IMAGE', payload: state.uploadedImage || '' });
      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'NEXT_STEP' });
    });
  }, []);

  const isMock = aiStatus.isMock;

  return (
    <div
      className="makeover-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '64px',
          height: '64px',
          border: '2px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid #f25b29',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2.5rem',
        }}
      />

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: '#ffffff',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}
      >
        Designing Your Dream Room
      </h2>

      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: '#b0b2b5',
          marginBottom: '0.5rem',
        }}
      >
        {statusText}
      </p>

      {/* AI Provider badge */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: isMock ? '#888' : '#4CAF50',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '2rem',
          padding: '4px 12px',
          borderRadius: '12px',
          background: isMock ? 'rgba(255,255,255,0.04)' : 'rgba(76,175,80,0.1)',
          border: `1px solid ${isMock ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.3)'}`,
        }}
      >
        {isMock ? 'Demo Mode - Pre-generated images' : `AI Active - ${aiStatus.provider}`}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '3px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#f25b29',
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: '#666',
          marginTop: '0.75rem',
          letterSpacing: '0.05em',
        }}
      >
        {progress}%
      </span>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
