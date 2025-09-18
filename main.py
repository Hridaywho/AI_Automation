from flask import Flask, request, jsonify, render_template_string
from openai import OpenAI
import os

"""
AI Email Reply App — Single File
--------------------------------
Run steps:
1. pip install -r requirements.txt
2. set environment variable:  OPENAI_API_KEY="your_key_here"
3. python app.py
4. Visit http://127.0.0.1:5000
"""

# ---------- HTML Frontend ----------
html_page = """
<!DOCTYPE html>
<html lang="en" class="bg-gray-50 dark:bg-gray-900">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Email Reply App</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="transition-colors duration-300 text-gray-900 dark:text-gray-100">
  <div class="max-w-4xl mx-auto p-6">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">AI Mail Composer</h1>
      <div>
        <select id="themeSelect" class="border rounded p-1">
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </header>

    <textarea id="emailInput" rows="10" class="w-full p-3 border rounded mb-4" placeholder="Paste your email here..."></textarea>

    <div class="flex gap-2 mb-4">
      <button id="condenseBtn" class="px-4 py-2 bg-blue-600 text-white rounded">Condense</button>
      <button id="replyBtn" class="px-4 py-2 bg-green-600 text-white rounded">Generate Reply</button>
    </div>

    <h2 class="text-lg font-semibold mt-4">Condensed Summary</h2>
    <pre id="summary" class="p-3 border rounded bg-gray-100 dark:bg-gray-800 whitespace-pre-wrap"></pre>

    <h2 class="text-lg font-semibold mt-4">Suggested Reply</h2>
    <textarea id="reply" rows="10" class="w-full p-3 border rounded bg-gray-100 dark:bg-gray-800"></textarea>
  </div>

<script>
const emailInput = document.getElementById('emailInput');
const summary = document.getElementById('summary');
const replyBox = document.getElementById('reply');
const condenseBtn = document.getElementById('condenseBtn');
const replyBtn = document.getElementById('replyBtn');
const themeSelect = document.getElementById('themeSelect');

function setTheme(mode) {
  if (mode === 'auto') {
    document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  } else {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
setTheme('auto');

themeSelect.addEventListener('change', e => setTheme(e.target.value));

async function callApi(mode) {
  const email = emailInput.value;
  const resp = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mode, tone: 'professional', model: 'gpt-4o' })
  });
  const data = await resp.json();
  if (resp.ok) return data.text;
  alert(data.error || 'Error');
  return '';
}

condenseBtn.addEventListener('click', async () => {
  summary.textContent = 'Loading...';
  summary.textContent = await callApi('condense');
});

replyBtn.addEventListener('click', async () => {
  replyBox.value = 'Loading...';
  replyBox.value = await callApi('reply');
});
</script>
</body>
</html>
"""

# ---------- Flask Backend ----------
app = Flask(__name__)
client = OpenAI()  # reads OPENAI_API_KEY from env

@app.route("/")
def index():
    return render_template_string(html_page)

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    email = data.get("email", "")
    mode = data.get("mode", "condense")
    tone = data.get("tone", "professional")
    model = data.get("model", "gpt-4o")

    if not email.strip():
        return jsonify({"error": "Email text required"}), 400

    if mode == "condense":
        user_prompt = (
            f"Condense the following email into a short bullet list of action items "
            f"and a 1-2 sentence summary. Tone: {tone}.\n\nEmail:\n{email}"
        )
    elif mode == "reply":
        user_prompt = (
            f"Write a {tone} reply to the following email. Keep it clear and professional. "
            f"Include a short subject suggestion in square brackets at the top.\n\nEmail:\n{email}"
        )
    else:
        return jsonify({"error": "Invalid mode"}), 400

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an AI assistant for corporate and personal email."},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=500,
            temperature=0.2,
        )
        text = completion.choices[0].message.content.strip()
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
