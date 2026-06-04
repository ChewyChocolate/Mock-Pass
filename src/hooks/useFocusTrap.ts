import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    if (!node) return;

    const focusables = (): HTMLElement[] => {
      const list = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      const out: HTMLElement[] = [];
      list.forEach((el) => {
        if (!el.hasAttribute('aria-hidden') && el.offsetParent !== null) {
          out.push(el);
        }
      });
      return out;
    };

    const initial = focusables()[0];
    if (initial) {
      requestAnimationFrame(() => initial.focus());
    } else {
      node.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (current === first || !node.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active]);

  return ref;
}
