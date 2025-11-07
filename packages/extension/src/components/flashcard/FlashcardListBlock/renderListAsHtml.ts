import { markdownToHtml } from '../EditableHTML/utils/markdownToHtml';

export const renderListAsHtml = (markdownList: string) => {
  const listItems = markdownList
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const content = line.replace(/^-\s*/, '').trim();
      const htmlContent = markdownToHtml(content);
      return `<li>${htmlContent}</li>`;
    })
    .join('');

  if (listItems.length) return `<ul>${listItems}</ul>`;
  return '';
};
