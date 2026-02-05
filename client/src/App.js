import React, { useState, useEffect } from 'react';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore'; 
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  
  // State
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Dark Mode State (Persistence)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [formData, setFormData] = useState({
    title: '', author: '', startDate: '', endDate: '', summary: '', coverUrl: '' 
  });

  // Toggle Theme
  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); 
      if (currentUser) fetchBooks(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchBooks = (uid) => {
    const q = query(collection(db, "books"), where("uid", "==", uid));
    onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      booksData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setBooks(booksData);
    });
  };

  const handleAutoFill = async () => {
    if (!formData.title || !formData.author) return alert("Please enter Title and Author first.");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/autofill`, {
        title: formData.title, author: formData.author
      });
      setFormData(prev => ({ 
        ...prev, 
        summary: res.data.summary, 
        coverUrl: res.data.coverUrl || 'https://via.placeholder.com/150x220?text=No+Cover'
      }));
    } catch (error) { 
      alert("Could not fetch data. Check your connection."); 
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.title) return alert("Title is required");

    await addDoc(collection(db, "books"), { ...formData, uid: user.uid, createdAt: new Date() });
    setFormData({ title: '', author: '', startDate: '', endDate: '', summary: '', coverUrl: '' });
  };

  if (authLoading) {
    return <div className="loading-screen">Starting BookStreamer...</div>;
  }

  return (
    <div className="app-container" data-theme={darkMode ? 'dark' : 'light'}>
      <nav className="navbar">
        {/* UPDATED: Elegant, Cursive, Split Colors */}
        <h1 className="logo">
          <span className="logo-book">Book</span>
          <span className="logo-streamer">Streamer</span>
        </h1>
        
        <div className="nav-actions">
          <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle Dark Mode">
            {darkMode ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user.displayName.split(' ')[0]}</span>
              <button onClick={() => signOut(auth)} className="btn-logout">Logout</button>
            </div>
          ) : (
            <button onClick={() => signInWithPopup(auth, provider)} className="btn-login">Login</button>
          )}
        </div>
      </nav>

      {user ? (
        <main className="main-content">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="input-card">
            <div className="input-grid">
              <div className="text-inputs">
                <h2>Track a New Book</h2>
                <input placeholder="Book Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <input placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                
                <div className="date-row">
                  <label>Started: <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></label>
                  <label>Finished: <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></label>
                </div>

                <textarea placeholder="Summary (Auto-generated)" rows="3" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
                
                <div className="action-buttons">
                  <button onClick={handleAutoFill} disabled={loading} className="btn-ai">
                    {/* UPDATED: "Summarizing..." instead of "Dreaming..." */}
                    {loading ? "⚙️ Summarizing..." : "✨ Auto-Fill Info"}
                  </button>
                  <button onClick={handleSubmit} className="btn-save">Save Entry</button>
                </div>
              </div>

              <div className="cover-preview-container">
                {formData.coverUrl ? (
                  <img src={formData.coverUrl} alt="Cover" className="cover-preview" />
                ) : (
                  <div className="cover-placeholder">Cover Preview</div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="feed-section">
            <h2 className="section-title">Books Streamed</h2>
            
            <div className="feed-grid">
              <AnimatePresence>
                {books.map(b => (
                  <motion.div 
                    key={b.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="book-card"
                  >
                    <div className="card-image-section">
                      <img src={b.coverUrl || 'https://via.placeholder.com/150'} alt={b.title} />
                    </div>

                    <div className="card-content-section">
                      <div className="card-header">
                        <h3>{b.title}</h3>
                        <p className="card-author">by {b.author}</p>
                        <span className="read-date">{b.startDate} — {b.endDate}</span>
                      </div>
                      <div className="card-summary">
                        <p>{b.summary}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {books.length === 0 && (
                <p className="empty-state">No books streamed yet. Add your first one above!</p>
              )}
            </div>
          </div>
        </main>
      ) : (
        <div className="login-hero">
          <h2>Your Personal Library, Streaming Live.</h2>
          <p>Track your reading journey with AI-powered summaries.</p>
          <button onClick={() => signInWithPopup(auth, provider)} className="btn-login-large">Get Started</button>
        </div>
      )}
    </div>
  );
}

export default App;