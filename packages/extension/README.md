# 🚀 Assistant

A browser assistant that helps you read, learn, analyze text, and create spaced-repetition flashcards directly while browsing.

**Extension:**  
[![React](https://img.shields.io/badge/-React-20232A?logo=react&logoColor=61DAFB&style=flat-square)](https://github.com/facebook/react)
[![React Query](https://img.shields.io/badge/-React%20Query-FF4154?logo=reactquery&logoColor=white&style=flat-square)](https://github.com/TanStack/query/tree/main/packages/react-query)
[![Formik](https://img.shields.io/badge/-Formik-2C3E50?style=flat-square)](https://github.com/jaredpalmer/formik)
[![React Draggable](https://img.shields.io/badge/-React%20Draggable-8E44AD?style=flat-square)](https://github.com/react-grid-layout/react-draggable)
[![React H5 Audio Player](https://img.shields.io/badge/-react--h5--audio--player-1ABC9C?style=flat-square)](https://github.com/lhz516/react-h5-audio-player)
[![React Icons](https://img.shields.io/badge/-React%20Icons-E91E63?style=flat-square)](https://github.com/react-icons/react-icons)
[![React Simple Code Editor](https://img.shields.io/badge/-react--simple--code--editor-34495E?style=flat-square)](https://github.com/satya164/react-simple-code-editor)
[![React Textarea Autosize](https://img.shields.io/badge/-react--textarea--autosize-16A085?style=flat-square)](https://github.com/Andarist/react-textarea-autosize)
[![Sonner](https://img.shields.io/badge/-Sonner-FFCC00?style=flat-square)](https://github.com/emilkowalski/sonner)
[![Zustand](https://img.shields.io/badge/-Zustand-3A3A3A?logo=zustand&style=flat-square)](https://github.com/pmndrs/zustand)
[![Zod](https://img.shields.io/badge/-Zod-3068D9?style=flat-square)](https://github.com/colinhacks/zod)
[![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=flat-square)](https://github.com/axios/axios)

**Server:**  
[![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white&style=flat-square)](https://github.com/nestjs/nest)
[![OpenAI](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white&style=flat-square)](https://github.com/openai/openai-node)

**Server Directory:**  
👉 [`../server/`](../server/)

---

## ✨ Features

### 1. 🧩 AI Flashcard Creation

- Chunk selection with **Alt + Cmd + Click**
- Can select both text and code blocks
- Ability to edit and delete chunks
- Ability to add an empty chunk for additional information
- AI accepts **article title + chunks**
  ![Flashcard Creation](./screenshots/flashcard-creation.png)

---

### 2. 🔄 Check Last Flashcard

- Shows the last created flashcard
- Ability to edit flashcard (TODO)
- Displays immediately after creation
  ![Last Flashcard](./screenshots/last-flashcard.png)

---

### 3. 📚 Flashcards Tab

- Displays all flashcards created for the current page URL
- Groups flashcards by normalized URL (e.g., Udemy course)

---

### 4. 🧠 Word/Phrase AI Analysis

- Word/phrase translation from English to your language  
  _(TODO: add target-language settings)_
- Save to dictionary
- Editing (TODO)
- Pronunciation generation
- History displaying all saved examples for the word/phrase
  ![Analysis](./screenshots/analysis.png)

---

### 🔍 “Ask Gemini” Button on Text Selection

- Opens a new tab with Gemini chat
- Automatically inserts selected text into the input and sends request
- If text is selected on Gemini page:
  - Inserts into input on the same page
  - Focuses input automatically
    ![Ask Gemini](./screenshots/ask-gemini.png)

---

### 🔍 “Delete” Button on Gemini page

- Adds a delete button next to microphone button in Gemini chat input
- Clicking the delete button deletes the current chat or the last chat in the left sidebar if the new empty chat is open

---

### 🗑️ "Delete" Button for ChatGPT Chats

- Adds a delete button to each chat item in the ChatGPT sidebar
- Button appears directly in the chat list for quick access
- Clicking the delete button removes the chat immediately via ChatGPT API
- Shows a loading spinner during deletion
- No confirmation dialog - immediate deletion for faster workflow
- Uses ChatGPT's backend API with authentication for reliable deletion

---

### 5. Smart URL Normalization

- Groups flashcards from the same course together
- Currently supports **Udemy** courses
  - Removes lecture-specific parts: `/learn/lecture/12345`
  - All flashcards from one course share the same source URL
- Example: Different lectures from the same course → One unified URL
  ![URL Normalization](./screenshots/url-normalization.png)

---

### 6. 📚 Vocabulary Repetition (TODO)

Spaced repetition for dictionary words.

---

### 7. 🗂 Flashcard Repetition (TODO)

Spaced repetition for created flashcards..
