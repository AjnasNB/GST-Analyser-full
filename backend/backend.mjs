import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5000;

const API_KEY = process.env.API_KEY;
const MODEL_NAME = 'gemini-1.0-pro';

// Specify the allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  
  'http://localhost:5174'
];

// Configure CORS middleware to check the origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Increase the payload limit to 50MB
app.use(express.json({ limit: '50mb' }));

app.post('/ask', async (req, res) => {
  if (!req.body.prompt) {
    return res.status(400).send({ error: 'Please provide a prompt.' });
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [],
  });

  try {
    const result = await chat.sendMessage(req.body.prompt);
    const response = await result.response.text();
    res.send({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'Failed to generate response from the AI model.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
