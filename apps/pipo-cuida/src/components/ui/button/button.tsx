import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={styles.button}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
