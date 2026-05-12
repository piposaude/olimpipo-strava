// Home — Pipo Cuida member app. Matches the brand template exactly.
// Uses the official illustrations and icons provided by the brand.

// Resolve asset URLs relative to this screen file. They live at the project root
// under assets/, so from ui_kits/pipo-cuida/ we go up two levels.
const ASSET_BASE = '';

const SpotIllustration = ({ src, size = 88 }) => (
  <img
    src={ASSET_BASE + src}
    alt=""
    width={size}
    height={size}
    style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}
  />
);

// ------- Reusable row primitives -------

const BannerCard = ({ title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: '#F7F3EB',
      border: 'none',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'box-shadow 160ms var(--ease-standard)',
      font: 'inherit',
      color: 'inherit',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #BCBAB5'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div>
      <div style={{ font: '500 16px/22px var(--font-display)', color: '#000' }}>{title}</div>
      <div style={{ font: '400 13px/20px var(--font-body)', color: 'var(--fg-3)', marginTop: 4 }}>{subtitle}</div>
    </div>
    <span style={{ color: '#000', fontSize: 22, lineHeight: 1, flexShrink: 0 }}>›</span>
  </button>
);

const BigTile = ({ title, illustrationSrc, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: '#F7F3EB',
      border: 'none',
      borderRadius: 12,
      padding: '22px 22px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minHeight: 200,
      cursor: 'pointer',
      textAlign: 'left',
      font: 'inherit',
      color: 'inherit',
      transition: 'box-shadow 160ms var(--ease-standard)',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #BCBAB5'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ font: '500 17px/22px var(--font-display)', color: '#000', maxWidth: 160 }}>
      {title}
    </div>
    <div style={{ alignSelf: 'center', marginTop: 8 }}>
      <img
        src={ASSET_BASE + illustrationSrc}
        alt=""
        style={{ display: 'block', width: 96, height: 96, objectFit: 'contain' }}
      />
    </div>
  </button>
);

const LinkRow = ({ iconSrc, label, onClick, isFirst }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: 'transparent',
      border: 'none',
      borderTop: isFirst ? 'none' : '1px solid #E2E1DF',
      padding: '14px 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      textAlign: 'left',
      font: 'inherit',
      transition: 'background 120ms var(--ease-standard)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{
      width: 48, height: 48,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <img src={ASSET_BASE + iconSrc} alt="" style={{ width: 40, height: 40, display: 'block' }} />
    </div>
    <div style={{ flex: 1, font: '400 15px/22px var(--font-body)', color: '#000' }}>{label}</div>
    <span style={{ color: '#3C404A', fontSize: 20, lineHeight: 1 }}>›</span>
  </button>
);

const PartnerCard = ({ eyebrow, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: '#F2E9FB',
      border: 'none',
      borderRadius: 12,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      cursor: 'pointer',
      textAlign: 'left',
      font: 'inherit',
      transition: 'box-shadow 160ms var(--ease-standard)',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #8B3ADD'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
      }}>
        {/* Vaccine glyph — small inline SVG; purple to match the brand partner accent. */}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <g stroke="#8B3ADD" strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M14 3l7 7" />
            <path d="M12.5 6.5l5 5" />
            <path d="M16 8l-9 9-4 1 1-4 9-9z" />
            <path d="M7 17l-3 3" />
          </g>
        </svg>
        <span style={{
          font: '500 15px/22px var(--font-display)',
          color: '#8B3ADD',
        }}>{eyebrow}</span>
      </div>
      <div style={{ font: '500 14px/22px var(--font-body)', color: '#000' }}>{title}</div>
      <div style={{ font: '400 14px/22px var(--font-body)', color: '#000' }}>{subtitle}</div>
    </div>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: 'transparent',
      border: '1px solid #8B3ADD',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8B3ADD', fontSize: 18, flexShrink: 0,
    }}>→</div>
  </button>
);

// Special row for Olimpipo with active-edition badge.
const OlimpipoLinkRow = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: 'transparent',
      border: 'none',
      borderTop: '1px solid #E2E1DF',
      padding: '14px 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      textAlign: 'left',
      font: 'inherit',
      transition: 'background 120ms var(--ease-standard)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{
      width: 48, height: 48,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <img src="assets/icons/illus-olimpipo.svg" alt="" style={{ width: 40, height: 40, display: 'block' }} />
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ font: '400 15px/22px var(--font-body)', color: '#000' }}>Olimpipo</span>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 10px 2px 8px',
        background: '#D4F8E7',
        color: '#0C5338',
        borderRadius: 999,
        font: '500 11px/1.4 var(--font-mono)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#1E9B5F',
          boxShadow: '0 0 0 3px rgba(30,155,95,0.18)',
        }} />
        Edição ativa
      </span>
    </div>
    <span style={{ color: '#3C404A', fontSize: 20, lineHeight: 1 }}>›</span>
  </button>
);

const HomeScreen = ({ user, onNavigate }) => (
  <div style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 24px 96px',
    boxSizing: 'border-box',
  }}>
    <div style={{
      width: '100%',
      maxWidth: 520,
      display: 'flex',
      flexDirection: 'column',
      gap: 48,
    }}>
      {/* 1. Survey banner */}
      <BannerCard
        title="Como anda sua saúde?"
        subtitle="Complete o questionário de saúde."
        onClick={() => onNavigate && onNavigate('plan')}
      />

      {/* 2. Main help section */}
      <section>
        <h2 style={{
          margin: '0 0 20px',
          font: '500 22px/28px var(--font-heading)',
          fontStyle: 'normal',
          color: '#000',
          textAlign: 'left',
        }}>
          Oi, como podemos te ajudar?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <BigTile
            title="Falar com o time de saúde"
            illustrationSrc="assets/illustrations/especialista.svg"
            onClick={() => onNavigate && onNavigate('plan')}
          />
          <BigTile
            title="Buscar rede credenciada"
            illustrationSrc="assets/illustrations/spot-rede.svg"
            onClick={() => onNavigate && onNavigate('network')}
          />
        </div>
      </section>

      {/* 3. Quick-links list */}
      <section>
        <LinkRow
          isFirst
          iconSrc="assets/icons/illus-benefit-card.svg"
          label="Carteirinhas"
          onClick={() => onNavigate && onNavigate('plan')}
        />
        <LinkRow
          iconSrc="assets/icons/illus-checkup.svg"
          label="Fazer check-up"
          onClick={() => onNavigate && onNavigate('plan')}
        />
        <LinkRow
          iconSrc="assets/icons/illus-chat-questions.svg"
          label="Tirar dúvidas"
          onClick={() => onNavigate && onNavigate('claims')}
        />
        <LinkRow
          iconSrc="assets/icons/illus-programa-pinguim.svg"
          label="Programa Pinguim"
          onClick={() => onNavigate && onNavigate('plan')}
        />
        <OlimpipoLinkRow onClick={() => onNavigate && onNavigate('olimpipo')} />
        <div style={{ borderTop: '1px solid #E2E1DF' }} />
      </section>

      {/* 4. Partners */}
      <section>
        <h3 style={{
          margin: '0 0 14px',
          font: '500 18px/26px var(--font-heading)',
          fontStyle: 'normal',
          color: '#000',
        }}>
          Nossos parceiros
        </h3>
        <PartnerCard
          eyebrow="Pipo + Beep Saúde"
          title="Vacinas à domicílio com desconto."
          subtitle="Acesse o benefício com cupom PIPOSAUDE"
        />
      </section>
    </div>
  </div>
);

Object.assign(window, { HomeScreen });
