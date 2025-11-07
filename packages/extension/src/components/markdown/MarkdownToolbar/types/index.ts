export enum ToolbarType {
  Bold = 'bold',
  Italic = 'italic',
  Code = 'code',
}

export interface ToolbarButtonDef {
  iconClass: string;
  type: ToolbarType;
  label: string;
  viewBox: string;
  pathD: string;
}
