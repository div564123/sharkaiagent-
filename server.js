require('dotenv').config(); 
console.log(process.env.API_KEY


const express = require('express');
const app = express();
const fetch = require('node-fetch'); 
if (!process.env.API_KEY) {
  console.error('API_KEY is not set in the environment variables');
  process.exit(1); // Arrête le script avec un code d'erreur
}
const myURL = new URL('http://www.sharkaiagent.xyz/');

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

// Servir les fichiers statiques du dossier 'public'
app.use(express.static('.'));

// Middleware CORS doit être défini avant les routes pour s'appliquer à toutes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint pour les requêtes à l'IA
app.post('/ai-response', async (req, res) => {
  const { message } = req.body; // Extraire le message de la requête

  try {
    // Appel à une API externe d'IA - ici, nous utilisons l'API d'OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions ', { // URL correcte pour OpenAI
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
     body: JSON.stringify({
  model: "gpt-4.0-turbo",
  messages: [{role: "user", content: message}],
  max_tokens: 1000
})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Vérification de la structure de réponse de l'API d'OpenAI
    if (data.choices && data.choices.length > 0 && data.choices[0].text) {
      res.json({ answer: data.choices[0].text });
    } else {
      res.status(500).json({ error: 'Unexpected response format from OpenAI API' });
    }
  } catch (error) {
    console.error('Error fetching AI response:', error.message); // Log only the error message
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

