const express = require('express');
const cors = require('cors');

// 1. Move CORS to the VERY TOP of your middleware stack
app.use(cors({
    origin: ["https://bookstreamer-app.vercel.app", "http://localhost:3000"],
    methods: ["POST", "GET", "DELETE", "OPTIONS"], // Added OPTIONS
    credentials: true,
    optionsSuccessStatus: 200 // Some browsers prefer 200 over 204
}));

// 2. Add this specific handler for OPTIONS requests
app.options('*', cors());

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('BookStreamer Server Running'));

app.post('/api/autofill', async (req, res) => {
    try {
        const { title, author } = req.body;

        // 1. Fetch Summary (Using STABLE 1.5-flash model)
        const summaryPromise = (async () => {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Write a short summary of "${title}" by ${author} in exactly 80 words. No spoilers.`;
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (e) {
                console.error("Gemini Error:", e.message);
                return "Summary unavailable at this moment.";
            }
        })();

        // 2. Fetch Cover
        const coverPromise = (async () => {
            try {
                const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
                const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
                if (googleRes.data.items?.length > 0) {
                    let img = googleRes.data.items[0].volumeInfo.imageLinks?.thumbnail;
                    return img ? img.replace('http:', 'https:').replace('zoom=5', 'zoom=1') : null;
                }
                return null;
            } catch (e) { return null; }
        })();

        const [summary, coverUrl] = await Promise.all([summaryPromise, coverPromise]);
        res.json({ summary, coverUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app; // Required for Vercel