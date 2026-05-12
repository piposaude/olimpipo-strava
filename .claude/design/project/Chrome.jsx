// App chrome for Pipo Cuida — minimal top bar only.
// Matches the brand template: wordmark left, "Meus dados | Sair" right.

const TopBar = ({ onNavigate }) => (
  <header style={{
    height: 64,
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderBottom: 'none',
  }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Logo />
    </div>
    <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <a
        onClick={() => onNavigate && onNavigate('plan')}
        style={{
          font: '400 14px/20px var(--font-body)',
          color: '#000',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >Meus dados</a>
      <span style={{ width: 1, height: 16, background: '#BCBAB5' }} />
      <a
        style={{
          font: '400 14px/20px var(--font-body)',
          color: '#000',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >Sair</a>
    </nav>
  </header>
);

// Kept for backward-compat with other screens that still import SidebarNav.
const SidebarNav = () => null;

Object.assign(window, { TopBar, SidebarNav });
