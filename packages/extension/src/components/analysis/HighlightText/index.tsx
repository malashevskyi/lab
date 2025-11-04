/**
 * A helper component to highlight a substring within a text.
 * It splits the text and wraps the highlighted part in a <strong> tag.
 */
const HighlightText: React.FC<{ text: string; highlight: string }> = ({
  text,
  highlight,
}) => {
  if (!highlight || !text.includes(highlight)) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <strong key={index}>{part}</strong>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;
