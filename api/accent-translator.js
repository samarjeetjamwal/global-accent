// File: /api/accent-translator.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, language, targetAccent } = req.body;

  if (!text || !language || !targetAccent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `
You are an AI voice and accent transformation engine.

TASK:
- Convert the provided text into the SAME LANGUAGE but in the requested global accent.
- Ensure it sounds natural to a native speaker of that accent.
- Preserve meaning, idioms, and informal tone markers where applicable.
- Keep the sentence structure fluent for that accent, adjusting words or phrasing if needed.
- Do NOT translate to another language unless explicitly asked — only modify the pronunciation style in text form and speech cues.

INPUTS:
1. Language of input text: ${language}
2. Original text: """${text}"""
3. Target accent: ${targetAccent}
4. Output style: Accent transcription + accent-aware phonetic hints + optional localized vocabulary.

OUTPUT FORMAT:
---
**Accent-Modified Text:** <natural text in target accent>
**Phonetic Guide:** <phonetic hints for pronunciation>
**Speech Tags:** <pauses, emphasis, intonation markers>
---
    `;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();
    const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';

    return res.status(200).json({ accentOutput: outputText });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
