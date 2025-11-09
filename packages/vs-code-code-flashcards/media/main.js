(function () {
  const vscode = acquireVsCodeApi();
  let currentSnippets = [];

  const createButton = document.getElementById('create-button');
  const questionInput = document.getElementById('question-input');
  const languageInput = document.getElementById('language-input');
  const snippetsPreview = document.getElementById('snippets-preview');

  // Listen for messages from the extension
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'updateSnippets') {
      currentSnippets = message.snippets;
      languageInput.value = message.language || '';

      // Update the preview div with the pre-rendered HTML
      if (message.snippetsHtml && message.snippets.length > 0) {
        snippetsPreview.innerHTML = message.snippetsHtml;
      } else {
        snippetsPreview.innerHTML = '<p>No snippets selected yet.</p>';
        questionInput.value = '';
        languageInput.value = '';
      }
    }
  });

  // Handle the create button click
  createButton.addEventListener('click', () => {
    if (questionInput.value && currentSnippets.length > 0) {
      vscode.postMessage({
        command: 'createFlashcard',
        question: questionInput.value,
        language: languageInput.value || 'unknown',
        snippets: currentSnippets,
      });
    } else {
      vscode.postMessage({
        command: 'showError',
        text: 'Please provide a question and select at least one code snippet.',
      });
    }
  });
})();
