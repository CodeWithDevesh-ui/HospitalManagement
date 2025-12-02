// js/chat.js - simple chat UI with mock AI replies and typing animation
(function () {
  // auth check (same as dashboard)
  const userJson = localStorage.getItem('user');
  const loggedIn = localStorage.getItem('loggedIn');
  if (!userJson && loggedIn !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  function appendMessage(text, who) {
    const el = document.createElement('div');
    el.className = 'message ' + (who === 'user' ? 'msg-user' : 'msg-ai');
    el.textContent = text;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function appendTyping() {
    const el = document.createElement('div');
    el.className = 'message msg-ai typing';
    el.textContent = 'AI is thinking…';
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return el;
  }

  // Mock AI function — replace with real API call:
  async function getAIReply(prompt) {
    // Simulate network + thinking delay
    await new Promise(r => setTimeout(r, 800));
    // Simple canned responses for demo
    const lower = prompt.toLowerCase();
    if (lower.includes('fever') || lower.includes('cough')) {
      return 'Possible causes: viral infection, common cold or COVID-19. Recommend temperature check, oxygen saturation, and if severe, immediate clinical evaluation.';
    }
    if (lower.includes('headache')) {
      return 'Headache can be tension, migraine, or secondary to systemic conditions. Please check pain intensity and triggers.';
    }
    return 'I understand. Could you share more details (onset, severity, other symptoms)?';
  }

  chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    chatInput.value = '';

    const typingEl = appendTyping();
    // get reply (mock)
    try {
      const reply = await getAIReply(text);
      // remove typing element
      typingEl.remove();
      appendMessage(reply, 'ai');
    } catch (err) {
      typingEl.remove();
      appendMessage('Something went wrong. Try again later.', 'ai');
    }
  });

  // pre-focus input
  chatInput.focus();

})();
