// cloudflare/worker.js
// Module-style Cloudflare Worker. Bind your secret as `GEMINI_API_KEY` in Worker settings.


export default {
async fetch(request, env) {
if (request.method === 'OPTIONS') {
return new Response(null, {
status: 204,
headers: {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type'
}
});
}


if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });


const json = await request.json();
const { language, text, target_accent } = json || {};
if (!text || !language || !target_accent) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });


const GEMINI_API_KEY = env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });


const prompt = `You are an AI voice and accent transformation engine...\nLanguage: ${language}\nText: """${text}"""\nTarget accent: ${target_accent}\nOutput JSON with keys: accent_text, phonetic, speech_tags.`;


const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;
const body = { contents: [ { role: 'user', parts: [ { text: prompt } ] } ] };


const resp = await fetch(apiUrl, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});


const data = await resp.json();
const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';


// Try extracting JSON
let parsed = { accent_text: raw, phonetic: '', speech_tags: '' };
try {
const start = raw.indexOf('{');
const end = raw.lastIndexOf('}');
if (start !== -1 && end !== -1 && end > start) {
const jsonStr = raw.slice(start, end + 1);
const j = JSON.parse(jsonStr);
parsed = { accent_text: j.accent_text || raw, phonetic: j.phonetic || '', speech_tags: j.speech_tags || '' };
}
} catch (e) {
// no-op
}


return new Response(JSON.stringify(parsed), {
headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
});
}
};
