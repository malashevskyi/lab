export const extensionToLanguageMap: { [key: string]: string } = {
  '.ts': 'typescript',
  '.js': 'javascript',
  '.tsx': 'typescript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sql': 'sql',
  '.java': 'java',
  '.go': 'go',
  '.rb': 'ruby',
  '.php': 'php',
  '.rs': 'rust',
};

export const TECHNOLOGIES = [
  'Node.js',
  'React',
  'TypeScript',
  'Microservices',
  'Express.js',
  'Material-UI',
  'Vs-code RegExp',
  'Javascript RegExp',
] as const;

export type Technology = (typeof TECHNOLOGIES)[number];
