import { useEffect, useState } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import { trpc } from '@/providers/trpc';

export default function StepGenerating() {
  const { state, dispatch } = useMakeover();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Analyzing your room...');

  // tRPC mutations/queries
  const generateMutation = trpc.ai.generate.useMutation();
  const paletteQuery = trpc.ai.getPalette.useQuery(
    { designStyle: state.designStyle || 'modern' },
    { enabled: false }
  );
  const furnitureQuery = trpc.ai.getFurniture.useQuery(
    { roomType: state.roomType || 'living-room' },
    { enabled: false }
  );
  const aiStatus = trpc.ai.status.useQuery();

  useEffect(() => {
    if (!state.roomType || !state.designStyle || state.isGenerating || state.generatedImage) return;

    dispatch({ type: 'SET_GENERATING', payload: true });

    const runGeneration = async () => {
      // Step 1: Show AI status
      const isMock = aiStatus.data?.isMock ?? true;

      setStatusText('Analyzing your room layout...');
      setProgress(10);
      await delay(600);

      // Step 2: Call backend AI API
      setStatusText(`Applying ${state.designStyle} style with ${isMock ? 'demo' : 'AI'}...`);
      setProgress(30);

      const result = await generateMutation.mutateAsync({
        roomType: state.roomType!,
        designStyle: state.designStyle!,
        uploadedImage: state.uploadedImage,
      });

      if (result.success && result.imageUrl) {
        dispatch({ type: 'SET_GENERATED_IMAGE', payload: result.imageUrl });
        setStatusText(isMock ? 'Design complete (demo mode)' : `Design complete (${result.provider})`);
      } else {
        // Fallback to uploaded image
        dispatch({ type: 'SET_GENERATED_IMAGE', payload: state.uploadedImage || '' });
        setStatusText('Using original image (fallback)');
      }
      setProgress(60);

      // Step 3: Fetch color palette from backend
      setStatusText('Extracting color palette...');
      setProgress(75);
      const palette = await paletteQuery.refetch().then((r) => r.data ?? []);
      await delay(400);

      // Step 4: Fetch furniture recommendations from backend
      setStatusText('Finding furniture recommendations...');
      setProgress(85);
      const furniture = await furnitureQuery.refetch().then((r) => r.data);
      await delay(400);

      // Step 5: Complete
      setProgress(100);
      setStatusText('Your dream room is ready!');
      await delay(500);

      // Convert furniture items to detected items format
      const detectedItems = (furniture?.items ?? []).map((item) => ({
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
          pinterestImage: result.imageUrl || state.uploadedImage || '',
        },
      });

      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'NEXT_STEP' });
    };

    runGeneration().catch(() => {
      // On error, still move forward with fallback
      dispatch({ type: 'SET_GENERATED_IMAGE', payload: state.uploadedImage || '' });
      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'NEXT_STEP' });
    });
  }, []);

  const isMock = aiStatus.data?.isMock ?? true;

  return (
    <div
      className="makeover-step"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 400,
            color: '#ffffff',
            marginBottom: '0.75rem',
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
            margin: 0,
          }}
        >
          {statusText}
        </p>
      </div>

      {/* Scanning preview of the uploaded photo */}
      {state.uploadedImage && (
        <div
          className="makeover-scan"
          style={{
            width: '100%',
            maxWidth: '520px',
            marginBottom: '2rem',
          }}
        >
          <img
            src={state.uploadedImage}
            alt="Analyzing room"
            style={{ width: '100%', display: 'block', borderRadius: '11px' }}
          />
        </div>
      )}

      {/* AI Provider badge */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: isMock ? '#888' : '#4CAF50',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '1.25rem',
          padding: '4px 12px',
          borderRadius: '12px',
          background: isMock ? 'rgba(255,255,255,0.04)' : 'rgba(76,175,80,0.1)',
          border: `1px solid ${isMock ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.3)'}`,
        }}
      >
        {isMock ? 'Demo Mode — Pre-generated images' : `AI Active — ${aiStatus.data?.provider || 'AI'}`}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
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
            background: 'linear-gradient(90deg, #f25b29, #ffa37a)',
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
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
