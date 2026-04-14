import { forwardRef } from 'react'

// Card dimensions: 320px × 510px (portrait, ~85mm × 135mm at 96dpi)
const CARD_W = 320
const CARD_H = 510

const PASS_TYPE_COLORS = {
  Participant: { bg: '#7C3AED', text: '#ffffff' },
  Volunteer: { bg: '#059669', text: '#ffffff' },
  Speaker: { bg: '#D97706', text: '#ffffff' },
  Guest: { bg: '#2563EB', text: '#ffffff' },
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * EventPassCard — ID-card style event pass.
 * forwardRef so parent can pass a ref for html2canvas capture.
 *
 * Props:
 *   pass         — EventPass data object
 *   qrCodeDataUrl — base64 PNG data URL from generateQRCode()
 */
const EventPassCard = forwardRef(function EventPassCard({ pass, qrCodeDataUrl }, ref) {
  const {
    eventName = 'Kalam Conclave 2.0',
    eventDate = '',
    eventVenue = '',
    eventOrganizer = 'K.R. Mangalam University',
    eventLogo = null,
    participantName = '',
    participantId = '',
    participantDepartment = '',
    participantYear = '',
    participantPhoto = null,
    passId = '',
    passType = 'Participant',
  } = pass

  const typeColor = PASS_TYPE_COLORS[passType] ?? PASS_TYPE_COLORS.Participant
  const initials = getInitials(participantName)

  return (
    <div
      ref={ref}
      style={{
        width: `${CARD_W}px`,
        height: `${CARD_H}px`,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* University watermark — rotated, very low opacity, behind everything */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-35deg)',
          fontSize: '28px',
          fontWeight: 900,
          letterSpacing: '0.04em',
          color: '#7C3AED',
          opacity: 0.04,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
        }}
      >
        {eventOrganizer}
      </div>

      {/* Gradient header */}
      <div
        style={{
          height: '90px',
          background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Dot pattern overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            pointerEvents: 'none',
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {eventLogo ? (
            <img alt="Event Logo" src={eventLogo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '22px' }}>🎓</span>
          )}
        </div>

        {/* Event title block */}
        <div style={{ marginLeft: '12px', flex: 1, zIndex: 1 }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            {eventName}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.82)',
              marginTop: '4px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {eventOrganizer}
          </div>
        </div>
      </div>

      {/* Holographic shimmer strip */}
      <div
        aria-hidden="true"
        style={{
          height: '5px',
          background:
            'linear-gradient(90deg, #7C3AED, #06B6D4, #7C3AED, #ec4899, #06B6D4)',
          backgroundSize: '200% 100%',
          flexShrink: 0,
          zIndex: 1,
        }}
      />

      {/* Left accent stripe (absolute, full height) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: 'linear-gradient(180deg, #7C3AED, #06B6D4)',
          zIndex: 2,
        }}
      />

      {/* Pass type badge */}
      <div
        style={{
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <span
          style={{
            background: typeColor.bg,
            color: typeColor.text,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '3px 14px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.75)',
              display: 'inline-block',
            }}
          />
          {passType}
        </span>
      </div>

      {/* Photo / Avatar area */}
      <div
        style={{
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: '3px solid #7C3AED',
            boxShadow: '0 0 0 3px rgba(124,58,237,0.18)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {participantPhoto ? (
            <img
              alt={participantName}
              src={participantPhoto}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {initials || '?'}
            </span>
          )}
        </div>
      </div>

      {/* Participant details */}
      <div
        style={{
          padding: '6px 20px 10px',
          textAlign: 'center',
          flexShrink: 0,
          zIndex: 1,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#0A0F1E',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {participantName || '—'}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#7C3AED',
            marginTop: '4px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {participantId}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#64748B',
            marginTop: '3px',
          }}
        >
          {participantDepartment}
          {participantYear ? ` • ${participantYear} Year` : ''}
        </div>
      </div>

      {/* Event details */}
      <div
        style={{
          padding: '10px 20px',
          flexShrink: 0,
          zIndex: 1,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '13px', flexShrink: 0 }}>📅</span>
          <span style={{ fontSize: '11px', color: '#0A0F1E', fontWeight: 500 }}>{eventDate}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '13px', flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: '11px', color: '#0A0F1E', fontWeight: 500, lineHeight: 1.35 }}>
            {eventVenue}
          </span>
        </div>
      </div>

      {/* QR code section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 16px 12px',
          zIndex: 1,
        }}
      >
        {qrCodeDataUrl ? (
          <img
            alt="QR Code"
            src={qrCodeDataUrl}
            style={{
              width: '86px',
              height: '86px',
              borderRadius: '6px',
              border: '2px solid #e2e8f0',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '86px',
              height: '86px',
              borderRadius: '6px',
              border: '2px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '10px',
            }}
          >
            QR
          </div>
        )}
        <div
          style={{
            fontSize: '9px',
            color: '#64748B',
            marginTop: '5px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Scan to Verify
        </div>
        <div
          style={{
            fontSize: '8px',
            color: '#94a3b8',
            marginTop: '3px',
            letterSpacing: '0.06em',
            fontFamily: 'monospace',
          }}
        >
          {passId}
        </div>
      </div>
    </div>
  )
})

export default EventPassCard
