/**
 * Module for adding delete button to chat items in ChatGPT sidebar
 */

const DELETE_BUTTON_CLASS = 'assistant-chatgpt-delete-button';

function createDeleteButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = `${DELETE_BUTTON_CLASS} __menu-item-trailing-btn`;
  button.setAttribute('aria-label', 'Delete chat');
  button.setAttribute('type', 'button');
  button.setAttribute('tabindex', '0');
  button.setAttribute('data-trailing-button', '');

  const iconDiv = document.createElement('div');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'currentColor');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M8.5 2C8.22386 2 8 2.22386 8 2.5V3H4.5C4.22386 3 4 3.22386 4 3.5C4 3.77614 4.22386 4 4.5 4H5V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V4H15.5C15.7761 4 16 3.77614 16 3.5C16 3.22386 15.7761 3 15.5 3H12V2.5C12 2.22386 11.7761 2 11.5 2H8.5ZM6 4H14V16C14 16.5523 13.5523 17 13 17H7C6.44772 17 6 16.5523 6 16V4ZM8 6.5C8 6.22386 8.22386 6 8.5 6C8.77614 6 9 6.22386 9 6.5V14.5C9 14.7761 8.77614 15 8.5 15C8.22386 15 8 14.7761 8 14.5V6.5ZM11 6.5C11 6.22386 11.2239 6 11.5 6C11.7761 6 12 6.22386 12 6.5V14.5C12 14.7761 11.7761 15 11.5 15C11.2239 15 11 14.7761 11 14.5V6.5Z'
  );

  svg.appendChild(path);
  iconDiv.appendChild(svg);
  button.appendChild(iconDiv);

  return button;
}

function createSpinner(): HTMLElement {
  const spinner = document.createElement('div');
  spinner.className = 'assistant-chatgpt-delete-spinner';
  spinner.style.cssText = `
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: assistant-chatgpt-spin 0.6s linear infinite;
  `;

  if (!document.querySelector('#assistant-chatgpt-spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'assistant-chatgpt-spinner-keyframes';
    style.textContent = `
      @keyframes assistant-chatgpt-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return spinner;
}

async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('https://chatgpt.com/api/auth/session');
    const data = await response.json();
    return data?.accessToken || null;
  } catch {
    return null;
  }
}

async function deleteChatByChatLink(
  chatLink: HTMLAnchorElement,
  deleteButton: HTMLButtonElement
): Promise<void> {
  const chatId = chatLink.getAttribute('href')?.match(/\/c\/([^/]+)/)?.[1];

  if (!chatId) {
    return;
  }

  const iconDiv = deleteButton.querySelector('div');
  if (!iconDiv) {
    return;
  }

  const originalContent = iconDiv.innerHTML;
  const spinner = createSpinner();
  iconDiv.innerHTML = '';
  iconDiv.appendChild(spinner);
  deleteButton.disabled = true;
  deleteButton.style.opacity = '0.6';
  deleteButton.style.cursor = 'not-allowed';

  const accessToken = await getAccessToken();

  if (!accessToken) {
    iconDiv.innerHTML = originalContent;
    deleteButton.disabled = false;
    deleteButton.style.opacity = '';
    deleteButton.style.cursor = '';
    return;
  }

  try {
    const response = await fetch(
      `https://chatgpt.com/backend-api/conversation/${chatId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          is_visible: false,
        }),
      }
    );

    if (response.ok) {
      chatLink.remove();
    } else {
      iconDiv.innerHTML = originalContent;
      deleteButton.disabled = false;
      deleteButton.style.opacity = '';
      deleteButton.style.cursor = '';
    }
  } catch (error) {
    console.error('Failed to delete chat:', error);
    iconDiv.innerHTML = originalContent;
    deleteButton.disabled = false;
    deleteButton.style.opacity = '';
    deleteButton.style.cursor = '';
  }
}

export function insertDeleteButton(chatLink: HTMLAnchorElement): void {
  const trailingHighlight = chatLink.querySelector<HTMLElement>(
    '.trailing.highlight'
  );

  if (!trailingHighlight) {
    return;
  }

  if (trailingHighlight.querySelector(`.${DELETE_BUTTON_CLASS}`)) {
    return;
  }

  const deleteButton = createDeleteButton();

  deleteButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    void deleteChatByChatLink(chatLink, deleteButton);
  });

  trailingHighlight.insertBefore(deleteButton, trailingHighlight.firstChild);
}

export function insertDeleteButtonsForAllChats(): void {
  const chatLinks = document.querySelectorAll<HTMLAnchorElement>(
    'a[data-sidebar-item="true"][href^="/c/"]'
  );

  chatLinks.forEach((chatLink) => {
    insertDeleteButton(chatLink);
  });
}

export function observeAndInsertDeleteButton(): void {
  insertDeleteButtonsForAllChats();

  const observer = new MutationObserver(() => {
    insertDeleteButtonsForAllChats();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
