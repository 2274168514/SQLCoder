import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";

  const variants = {
    primary: "",
    secondary: "",
    ghost: "",
    outline: ""
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  };

  // 根据variant返回不同的样式
  const getVariantStyles = () => {
    const commonStyles = "transition-all duration-200";

    switch (variant) {
      case 'primary':
        return `${commonStyles} text-white font-medium`;
      case 'secondary':
        return `${commonStyles} font-medium`;
      case 'ghost':
        return `${commonStyles}`;
      case 'outline':
        return `${commonStyles} border font-medium`;
      default:
        return commonStyles;
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${className} ${getVariantStyles()}`}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--accent)' :
                        variant === 'secondary' ? 'var(--bg-secondary)' :
                        variant === 'ghost' ? 'transparent' :
                        variant === 'outline' ? 'var(--panel)' : undefined,
        color: variant === 'primary' ? 'white' :
               variant === 'secondary' ? 'var(--text-primary)' :
               variant === 'ghost' ? 'var(--text-secondary)' :
               variant === 'outline' ? 'var(--text-primary)' : undefined,
        borderColor: variant === 'outline' ? 'var(--border)' : undefined,
        borderWidth: variant === 'outline' ? '1px' : undefined,
        borderStyle: variant === 'outline' ? 'solid' : undefined,
        boxShadow: variant === 'primary' ? `0 4px 12px var(--shadow)` : 'none'
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 6px 16px var(--shadow)`;
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 12px var(--shadow)`;
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'var(--panel)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
