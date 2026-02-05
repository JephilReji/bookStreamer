# 📚 BookStreamer

**Your Personal Library, Streaming Live.**

BookStreamer is a minimalist, elegant application designed to track your reading journey. It leverages **Generative AI** to automatically generate book summaries and fetch cover images, allowing you to focus on reading rather than data entry.

## ✨ Features

- **🎨 Elegant UI:** A clean, responsive interface with a beautiful card layout and smooth animations (Framer Motion).
- **🌗 Dark/Light Mode:** A persistent, eye-strain-free dark mode inspired by modern developer tools.
- **🤖 AI Auto-Fill:** Powered by Google Gemini. Just enter a Title and Author, and the app fetches a concise summary and book cover automatically.
- **🔐 User Authentication:** Secure login via Google (Firebase Auth) ensures your library is private and synced.
- **☁️ Cloud Storage:** All data is stored securely in Firebase Firestore.

## 🛠️ Tech Stack

**Frontend:**
- React.js
- CSS3 (Variables for theming, Inter font)
- Framer Motion (Animations)
- Firebase SDK (Auth & Firestore)

**Backend:**
- Node.js & Express
- Google Generative AI SDK (Gemini) for text & image logic

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/BookStreamer.git](https://github.com/your-username/BookStreamer.git)
cd BookStreamer
```

### 2. Backend Setup (Server)
The server handles the AI requests.

```Bash
cd server
npm install
```
##### Create a .env file in the server/ folder and add your Gemini API Key:

```bash
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```
Start the server:

```Bash
node index.js
```
### 3. Frontend Setup (Client)
Open a new terminal for the client.

```Bash
cd client
npm install
```
### Firebase Configuration:

 ##### Go to Firebase Console.

##### Create a project and enable Authentication (Google Provider) and Firestore Database.

##### Create a file client/src/firebase.js (if not already tracked) and add your config:

```JavaScript

// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
```
#### Start the React app:

```Bash
npm start
```
### 📸 Usage
- **login**: Click "Login with Google" to access your dashboard.

- **Add a Book**: Type the Title and Author.

- **Magic Button**: Click "✨ Auto-Fill Info". The AI will generate a summary and find a cover image.

- **Save**: Enter your start/finish dates and click "Save Entry".

- **View**: Your book will appear in the stream below with a beautiful layout.

## 🤝 Contributing

#### This is purely a VIBE-CODED project made in 60 minutes ! 
##### Feel free to fork this repository and submit pull requests. Any improvements to the UI or AI prompts are welcome!

## 📄 License
This project is open-source and available under the MIT License.
