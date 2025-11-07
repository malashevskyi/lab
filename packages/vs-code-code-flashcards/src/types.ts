export interface CodeSnippet {
  id: string;
  content: string;
  fileName: string;
  range: {
    startLine: number;
    endLine: number;
  };
  uri: string;
}
