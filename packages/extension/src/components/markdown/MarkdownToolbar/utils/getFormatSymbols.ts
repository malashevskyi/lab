import type { ToolbarType } from '../types';

interface FormatSymbols {
  prefix: string;
  suffix: string;
}

export function getFormatSymbols(formatType: ToolbarType): FormatSymbols {
  switch (formatType) {
    case 'bold':
      return { prefix: '**', suffix: '**' };
    case 'italic':
      return { prefix: '*', suffix: '*' };
    case 'code':
      return { prefix: '`', suffix: '`' };
    default:
      return { prefix: '', suffix: '' };
  }
}
