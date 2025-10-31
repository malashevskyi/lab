export const serializeRange = (range) => {
  if (!(range instanceof Range)) {
    return null; // Повертаємо null, якщо це не Range
  }

  // Витягуємо ключові властивості
  return {
    collapsed: range.collapsed, // Чи згорнутий діапазон (початкова точка = кінцева точка)
    startOffset: range.startOffset, // Зміщення початку (індекс символу або вузла)
    endOffset: range.endOffset, // Зміщення кінця
    // Щоб уникнути циклічних посилань, не передаємо самі вузли (startContainer/endContainer).
    // Натомість, ми можемо передати їхні імена тегів або ID для контексту:
    startContainerType: range.startContainer.nodeName,
    endContainerType: range.endContainer.nodeName,
    text:
      range.toString().substring(0, 150) +
      (range.toString().length > 150 ? '...' : ''), // Текст (обрізаний)
  };
};
