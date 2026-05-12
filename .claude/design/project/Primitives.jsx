// Shared UI primitives for Pipo Cuida.
// Exposes to window so Babel-compiled siblings can use them.

const { useState, useEffect } = React;

const __svgCache = {};
const InlineSVG = ({ src, style, className }) => {
  const [html, setHtml] = useState(__svgCache[src] || '');
  useEffect(() => {
    if (__svgCache[src]) return;
    fetch(src).then(r => r.text()).then(t => {
      // Strip hardcoded width/height so the outer <span> sizing takes over.
      const normalized = t
        .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
        .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
        .replace(/<svg([^>]*?)>/, '<svg$1 width="100%" height="100%">');
      __svgCache[src] = normalized;
      setHtml(normalized);
    });
  }, [src]);
  return <span className={className} style={{ display: 'inline-flex', ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
};

const Icon = ({ name, size = 20, color = 'currentColor', style }) => (
  <InlineSVG
    src={`assets/icons/icon-${name}.svg`}
    style={{
      width: size, height: size, color,
      verticalAlign: 'middle', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}
  />
);

const Logo = ({ dark = false, size = 22 }) => (
  <InlineSVG
    src="assets/logos/pipo-wordmark.svg"
    style={{ height: size, width: 'auto', color: dark ? '#fff' : '#000' }}
  />
);

const Avatar = ({ name = '', size = 36, color = '#F7F3EB', fg = '#000' }) => {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: fg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 600,
      fontSize: size * 0.38, flexShrink: 0
    }}>{initials}</div>
  );
};

const Button = ({ variant = 'primary', size = 'md', icon, children, onClick, disabled, style }) => {
  const [hover, setHover] = useState(false);
  const sizes = {
    sm: { fontSize: 13, padding: '6px 12px', iconSize: 16 },
    md: { fontSize: 14, padding: '10px 18px', iconSize: 18 },
    lg: { fontSize: 15, padding: '12px 22px', iconSize: 20 },
  }[size];
  const variants = {
    primary: { background: '#000', color: '#fff', border: '1px solid #000' },
    secondary: { background: '#fff', color: '#000', border: '1px solid #E2E1DF' },
    ghost: { background: 'transparent', color: '#000', border: '1px solid transparent' },
    danger: { background: '#F04646', color: '#fff', border: '1px solid #F04646' },
  }[variant];
  const hoverShadow = disabled ? 'none'
    : variant === 'primary' ? 'inset 0 0 0 2px #000'
    : variant === 'danger'  ? 'inset 0 0 0 2px #902D2D'
    : 'inset 0 0 0 1px #BCBAB5';
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...sizes, ...variants,
        fontFamily: 'var(--font-ui)',  /* Manrope — brand "Label · 14/24" */
        fontWeight: 600,               /* SemiBold */
        letterSpacing: 0,
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        opacity: disabled ? 0.5 : 1,
        boxShadow: hover ? hoverShadow : 'none',
        transition: 'box-shadow 160ms cubic-bezier(.2,0,0,1)',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={sizes.iconSize} />}
      {children}
    </button>
  );
};

const Input = ({ label, caption, error, ...props }) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    {label && <div style={{ font: '700 13px/20px var(--font-body)', color: '#000', marginBottom: 4 }}>{label}</div>}
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '10px 12px', borderRadius: 8,
        border: `1px solid ${error ? '#F04646' : '#E2E1DF'}`,
        background: '#fff', font: '400 14px/20px var(--font-body)', color: '#000',
        outline: 'none',
      }}
    />
    {caption && <div style={{ font: '400 12px/16px var(--font-body)', color: error ? '#F04646' : 'var(--fg-3)', marginTop: 4 }}>{caption}</div>}
  </label>
);

const Card = ({ variant = 'white', children, style, onClick }) => {
  const variants = {
    white: { background: '#fff', border: '1px solid #E2E1DF', color: '#000' },
    beige: { background: '#F7F3EB', border: '1px solid #E6D9C2', color: '#000' },
    navy: { background: '#060D41', border: 'none', color: '#fff' },
  }[variant];
  return (
    <div onClick={onClick} style={{
      borderRadius: 16, padding: 20, ...variants,
      cursor: onClick ? 'pointer' : 'default', ...style
    }}>{children}</div>
  );
};

const Pill = ({ color = 'neutral', children }) => {
  const colors = {
    success: { background: '#D4F8E7', color: '#0C5338' },
    warning: { background: '#FFEEC2', color: '#7A4A00' },
    danger:  { background: '#FFDEDE', color: '#902D2D' },
    info:    { background: '#A2CEFF', color: '#1527A9' },
    neutral: { background: '#E2E1DF', color: '#3C404A' },
    dark:    { background: '#000', color: '#fff' },
  }[color];
  return (
    <span style={{
      ...colors,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      font: '500 11px/1.4 var(--font-mono)',
    }}>{children}</span>
  );
};

Object.assign(window, { Icon, Logo, Avatar, Button, Input, Card, Pill, InlineSVG });
