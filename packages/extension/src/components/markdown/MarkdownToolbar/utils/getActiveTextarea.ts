import { toast } from 'sonner';

type RootType = Document | ShadowRoot;

export function getActiveTextarea(root?: RootType): HTMLTextAreaElement | null {
  const rootElement = root || document;
  const active = rootElement.activeElement;

  // If active element is inside shadow DOM → dive deeper
  if (active && active instanceof HTMLElement && active.shadowRoot) {
    return getActiveTextarea(active.shadowRoot);
  }

  // If active element IS textarea
  if (active instanceof HTMLTextAreaElement) return active;

  toast.error('No active textarea found for formatting');
  return null;
}
