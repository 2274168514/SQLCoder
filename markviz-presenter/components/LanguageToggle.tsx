import React from 'react';
import { Globe } from 'lucide-react';
import { i18n, Language } from '../i18n';

interface LanguageToggleProps {
  isDark?: boolean;
  onLanguageChange?: (language: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  isDark = true,
  onLanguageChange
}) => {
  const [currentLang, setCurrentLang] = React.useState<Language>(i18n.current);

  React.useEffect(() => {
    // 监听语言变化
    const unsubscribe = i18n.onChange((lang) => {
      setCurrentLang(lang);
      onLanguageChange?.(lang);
    });

    return unsubscribe;
  }, [onLanguageChange]);

  const handleToggle = () => {
    i18n.toggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="relative h-10 px-3 py-2 rounded-lg border transition-all duration-200 font-medium flex items-center gap-2"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-secondary)',
        backgroundColor: 'transparent'
      }}
      title={i18n.t('lang.switch')}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <Globe size={16} />
      <span className="text-sm font-medium">
        {currentLang === 'zh' ? '中' : 'En'}
      </span>
    </button>
  );
};