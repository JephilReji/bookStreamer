const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ["http://localhost:3000", "https://your-vercel-app.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => res.send('BookStreamer Server Running'));

app.post('/api/autofill', async (req, res) => {
    try {
        const { title, author } = req.body;
        console.log(`Fetching data for: ${title}`);

        // 1. Fetch Summary (Using correct 2.5-flash model)
        const summaryPromise = (async () => {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `Write a short, engaging summary of the book "${title}" by ${author} in exactly 80 words. Plain text only, no spoilers.`;
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (e) {
                console.error("Gemini Error:", e.message);
                return "Summary unavailable at this moment.";
            }
        })();

        // 2. Fetch Cover (High Res if possible)
        const coverPromise = (async () => {
            try {
                const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
                const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
                
                if (googleRes.data.items?.length > 0) {
                    let img = googleRes.data.items[0].volumeInfo.imageLinks?.thumbnail;
                    // Try to force https and get a slightly larger image if available
                    return img ? img.replace('http:', 'https:').replace('&edge=curl', '') : null;
                }
                return null;
            } catch (e) {
                return null; 
            }
        })();

        const [summary, coverUrl] = await Promise.all([summaryPromise, coverPromise]);
        res.json({ summary, coverUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;