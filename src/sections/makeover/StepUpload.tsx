import { useRef } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import { roomTypes } from '../../data/makeoverData';
import type { RoomType } from '../../types/makeover';

// Decorative background component using CSS-only illustrations
function UploadBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Large circle top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid rgba(242,91,41,0.08)',
        }}
      />
      {/* Medium circle top-left */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '-8%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      />
      {/* Small circle bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '2%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '1px solid rgba(242,91,41,0.06)',
        }}
      />
      {/* Decorative line top */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '80px',
          height: '1px',
          background: 'rgba(242,91,41,0.1)',
          transform: 'rotate(-30deg)',
        }}
      />
      {/* Decorative line bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          width: '120px',
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          transform: 'rotate(25deg)',
        }}
      />
      {/* Dot pattern left side */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`dot-l-${i}`}
          style={{
            position: 'absolute',
            left: '3%',
            top: `${25 + i * 8}%`,
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(242,91,41,0.15)',
          }}
        />
      ))}
      {/* Dot pattern right side */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`dot-r-${i}`}
          style={{
            position: 'absolute',
            right: '4%',
            top: `${30 + i * 10}%`,
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
      {/* Furniture silhouette - sofa outline */}
      <svg
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '2%',
          width: '120px',
          height: '60px',
          opacity: 0.04,
        }}
        viewBox="0 0 120 60"
        fill="none"
        stroke="white"
        strokeWidth="1"
      >
        <path d="M10 45 L10 25 Q10 15 20 15 L100 15 Q110 15 110 25 L110 45" />
        <line x1="10" y1="35" x2="110" y2="35" />
        <line x1="35" y1="35" x2="35" y2="55" />
        <line x1="85" y1="35" x2="85" y2="55" />
        <line x1="25" y1="55" x2="95" y2="55" />
      </svg>
      {/* Furniture silhouette - lamp outline */}
      <svg
        style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          width: '50px',
          height: '100px',
          opacity: 0.035,
        }}
        viewBox="0 0 50 100"
        fill="none"
        stroke="white"
        strokeWidth="1"
      >
        <line x1="25" y1="95" x2="25" y2="40" />
        <path d="M10 40 Q25 10 40 40 Z" />
        <ellipse cx="25" cy="95" rx="15" ry="3" />
      </svg>
      {/* Furniture silhouette - plant outline */}
      <svg
        style={{
          position: 'absolute',
          top: '60%',
          right: '3%',
          width: '70px',
          height: '90px',
          opacity: 0.035,
        }}
        viewBox="0 0 70 90"
        fill="none"
        stroke="white"
        strokeWidth="1"
      >
        <path d="M35 85 Q20 60 15 40 Q20 20 35 15 Q50 20 55 40 Q50 60 35 85" />
        <line x1="20" y1="85" x2="50" y2="85" />
        <line x1="22" y1="85" x2="22" y2="88" />
        <line x1="48" y1="85" x2="48" y2="88" />
        <line x1="18" y1="88" x2="52" y2="88" />
      </svg>
      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

export default function StepUpload() {
  const { state, dispatch } = useMakeover();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      dispatch({ type: 'SET_IMAGE', payload: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRoomSelect = (room: RoomType) => {
    dispatch({ type: 'SET_ROOM_TYPE', payload: room });
  };

  const canProceed = state.uploadedImage && state.roomType;

  return (
    <div className="makeover-step" style={{ position: 'relative' }}>
      <UploadBackground />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
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
            Step 1 of 3
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
            Upload Your Room Photo
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
            Take a clear photo of your room and we will transform it with AI
          </p>
        </div>

        {/* Upload Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!state.uploadedImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: '0 auto 3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              padding: '4rem 2rem',
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(242,91,41,0.5)';
              e.currentTarget.style.background = 'rgba(242,91,41,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            {/* Subtle background image in upload area */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage: 'url(images/gallery/item5.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f25b29"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                color: '#ffffff',
                fontWeight: 400,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Click to upload a room photo
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#b0b2b5',
                position: 'relative',
                zIndex: 1,
              }}
            >
              Supports JPG, PNG - Max 10MB
            </span>
          </button>
        ) : (
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: '0 auto 3rem',
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <img
              src={state.uploadedImage}
              alt="Uploaded room"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: '12px',
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Change Photo
            </button>
          </div>
        )}

        {/* Room Type Selection - 12 options */}
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
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
            Select Room Type
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
            }}
          >
            {roomTypes.map((room) => (
              <button
                key={room.value}
                onClick={() => handleRoomSelect(room.value)}
                style={{
                  padding: '1rem 0.5rem',
                  border: state.roomType === room.value
                    ? '1px solid #f25b29'
                    : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  background: state.roomType === room.value
                    ? 'rgba(242,91,41,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  if (state.roomType !== room.value) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (state.roomType !== room.value) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
              >
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '0.4rem' }}>
                  {room.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: state.roomType === room.value ? '#ffffff' : '#b0b2b5',
                    fontWeight: state.roomType === room.value ? 500 : 400,
                  }}
                >
                  {room.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
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
            Continue -
          </button>
          {!canProceed && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: '#666',
                marginTop: '0.75rem',
              }}
            >
              Upload a photo and select a room type to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
