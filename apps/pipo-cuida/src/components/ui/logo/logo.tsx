import styles from './logo.module.css';

export type LogoProps = { size?: number; dark?: boolean };

export function Logo({ size = 22, dark = false }: LogoProps) {
  return (
    <img
      src="/assets/logos/pipo-wordmark.svg"
      alt="Pipo"
      className={styles.logo}
      style={{ height: size, filter: dark ? 'invert(1)' : 'none' }}
    />
  );
}
