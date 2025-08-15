// accent-translator.js
// 🌍 Global Accent Translator - Client-side Gemini API integration
// ⚠️ Warning: API key is exposed if used on GitHub Pages (public projects)

// 🔑 Replace with your own Gemini API key
const GEMINI_API_KEY = "AIzaSyDl0zTraVy57ozoADHu26jCv7GvDMq-_Pw"; // Example: "AIzaSyD...."

// 🎤 Capture microphone input and transcribe (browser SpeechRecognition API)
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    document.getElementById("originalText").textContent = spokenText;
    const accent = document.getElementById("accentSelect").value;
    const translated = await translateAccent(spokenText, accent);
    document.getElementById("translatedText").textContent = translated;
    speakText(translated);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.start();
}

// 🔄 Send text to Gemini to "translate" into same language but different accent
async function translateAccent(text, accent) {
  const prompt = `Take the following English text and rewrite it in the accent style of ${accent}.
  Do NOT translate to another language, only modify the wording to sound natural in that accent.
  Text: "${text}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Invalid response from Gemini:", data);
      return "(Error: No translation returned)";
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    return "(Error: API request failed)";
  }
}

// 🔊 Speak text aloud using browser TTS
function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.pitch = 1;
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

// 📌 Event listeners for buttons
document.getElementById("listenBtn").addEventListener("click", startListening);
