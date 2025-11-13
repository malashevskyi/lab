(function () {
  const vscode = acquireVsCodeApi();
  let currentSnippets = [];
  let selectedTechnology = 'Node.js';

  const TECHNOLOGIES = ['Node.js', 'React', 'TypeScript', 'Microservices'];

  const createButton = document.getElementById('create-button');
  const questionInput = document.getElementById('question-input');
  const snippetsPreview = document.getElementById('snippets-preview');
  const technologyButtonsContainer =
    document.getElementById('technology-buttons');

  const originalButtonText = createButton.textContent;

  // Create technology buttons
  function createTechnologyButtons() {
    technologyButtonsContainer.innerHTML = '';
    TECHNOLOGIES.forEach((tech) => {
      const button = document.createElement('button');
      button.className = 'technology-button';
      button.textContent = tech;
      button.onclick = () => selectTechnology(tech);
      technologyButtonsContainer.appendChild(button);
    });
  }

  function selectTechnology(technology) {
    selectedTechnology = technology;
    updateTechnologyButtons();
    vscode.postMessage({
      command: 'selectTechnology',
      technology: technology,
    });
  }

  function updateTechnologyButtons() {
    const buttons =
      technologyButtonsContainer.querySelectorAll('.technology-button');
    buttons.forEach((button) => {
      if (button.textContent === selectedTechnology) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  createTechnologyButtons();
  updateTechnologyButtons();

  // Listen for messages from the extension
  window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.command) {
      case 'updateSnippets':
        currentSnippets = message.snippets;
        if (message.selectedTechnology) {
          selectedTechnology = message.selectedTechnology;
          updateTechnologyButtons();
        }
        if (message.snippetsHtml && message.snippets.length > 0) {
          snippetsPreview.innerHTML = message.snippetsHtml;
        } else {
          snippetsPreview.innerHTML = '<p>No snippets selected yet.</p>';
          questionInput.value = '';
        }
        break;

      case 'operationComplete':
        createButton.disabled = false;
        createButton.textContent = originalButtonText;
        break;
    }
  });

  // Handle the create button click
  createButton.addEventListener('click', () => {
    if (questionInput.value && currentSnippets.length > 0) {
      createButton.disabled = true;
      createButton.textContent = 'Creating...';

      vscode.postMessage({
        command: 'createFlashcard',
        question: questionInput.value,
        technology: selectedTechnology,
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
