import { ToolbarType, type ToolbarButtonDef } from '../types';

export const TOOLBAR_BUTTONS: ToolbarButtonDef[] = [
  {
    iconClass: 'octicon-bold',
    type: ToolbarType.Bold,
    label: 'Bold',
    viewBox: '0 0 16 16',
    pathD:
      'M4 2h4.5a3.501 3.501 0 0 1 2.852 5.53A3.499 3.499 0 0 1 9.5 14H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm1 7v3h4.5a1.5 1.5 0 0 0 0-3Zm3.5-2a1.5 1.5 0 0 0 0-3H5v3Z',
  },
  {
    iconClass: 'octicon-italic',
    type: ToolbarType.Italic,
    label: 'Italic',
    viewBox: '0 0 16 16',
    pathD:
      'M6 2.75A.75.75 0 0 1 6.75 2h6.5a.75.75 0 0 1 0 1.5h-2.505l-3.858 9H9.25a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.505l3.858-9H6.75A.75.75 0 0 1 6 2.75Z',
  },
  {
    iconClass: 'octicon-code',
    type: ToolbarType.Code,
    label: 'Inline Code',
    viewBox: '0 0 16 16',
    pathD:
      'm11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z',
  },
];
