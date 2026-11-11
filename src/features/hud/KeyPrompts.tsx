import { ChevronLeft } from 'lucide-react';
import { useInputMode } from '../../app/inputMode';
import type { Prompt } from './prompts';
import styles from './KeyPrompts.module.css';

/**
 * Console-style button prompts along the bottom of a screen. Back is a real
 * button (it also works by touch); the rest are hints, hidden on touch. They
 * show controller buttons once the visitor plays with a controller.
 */
export function KeyPrompts({
  prompts,
  onBack,
}: {
  prompts: readonly Prompt[];
  onBack?: () => void;
}) {
  const pad = useInputMode() === 'pad';
  return (
    <div role="group" aria-label="Controls" className={styles.bar}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack}>
          <kbd className={styles.key}>{pad ? 'B' : 'Esc'}</kbd>
          <ChevronLeft className={styles.chevron} aria-hidden="true" />
          Back
        </button>
      )}
      {prompts.map((prompt) => (
        <span key={prompt.label} className={styles.hint}>
          {(pad ? prompt.pad : prompt.keys).map((key) => (
            <kbd key={key} className={styles.key}>
              {key}
            </kbd>
          ))}
          <span>{prompt.label}</span>
        </span>
      ))}
    </div>
  );
}
