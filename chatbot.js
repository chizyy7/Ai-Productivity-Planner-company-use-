/* =========================================================
   Planify Chatbot Widget
   Floating AI assistant — sends messages to MiniGPT API
   ========================================================= */

(function () {
    'use strict';

    const API_URL = 'https://api.mycompany.com/minigpt';

    /* ---------- Local AI Fallback ---------- */
    /* Smart pattern-matching responses when API is unreachable */
    const LOCAL_RESPONSES = [
        { patterns: [/\b(hi|hello|hey|sup|yo|hola|greetings|howdy)\b/i],
          replies: [
            "Hey there! 👋 How can I help you with Planify today?",
            "Hello! Welcome to Planify. Ask me anything about productivity, tasks, or our features!",
            "Hi! I'm the Planify assistant. What can I do for you?"
          ]},
        { patterns: [/\b(how are you|how'?s it going|what'?s up)\b/i],
          replies: [
            "I'm doing great, thanks for asking! Ready to help you be more productive. 💪",
            "All systems running smoothly! What can I help you with today?"
          ]},
        { patterns: [/\b(what is planify|what'?s planify|tell me about planify|about planify)\b/i],
          replies: [
            "Planify is an AI-powered productivity planner that helps you manage tasks, stay focused with a built-in Pomodoro timer, and get intelligent insights to boost your workflow. It's built by chizy7 and trusted by thousands of users! 🚀"
          ]},
        { patterns: [/\b(feature|what can you do|what does it do|capabilities)\b/i],
          replies: [
            "Planify is packed with features! Here's what you get:\n\n✅ Smart Task Management — prioritize, filter & categorize\n⏱️ Pomodoro Focus Timer — customizable work sessions\n🤖 AI Productivity Insights — personalized tips\n📊 Progress Analytics — streaks & completion tracking\n⌨️ Keyboard Shortcuts — power-user speed\n📱 Works on any device — fully responsive"
          ]},
        { patterns: [/\b(task|todo|to-do|manage|organize)\b/i],
          replies: [
            "With Planify, you can create tasks with priorities (high, medium, low), assign categories, set due dates, and filter them easily. Press 'N' to quickly add a new task! Try the planner to see it in action. ✅",
            "Our task management lets you organize by priority and category. You can also search tasks instantly with '/' and use keyboard shortcuts for lightning-fast workflows!"
          ]},
        { patterns: [/\b(timer|pomodoro|focus|session|break)\b/i],
          replies: [
            "The Pomodoro Focus Timer helps you work in focused intervals! 🍅\n\n• Work sessions (default 25 min)\n• Short breaks (5 min)\n• Long breaks (15 min)\n\nYou can click the timer to customize the duration for each mode. Press 'P' to jump to the timer section!",
          ]},
        { patterns: [/\b(shortcut|keyboard|hotkey|key)\b/i],
          replies: [
            "Here are Planify's keyboard shortcuts: ⌨️\n\n• N — New task\n• / — Search tasks\n• P — Jump to Pomodoro timer\n• 1, 2, 3 — Filter by priority\n• ? — Show shortcuts panel\n• Esc — Close modals\n\nThey work anywhere on the planner page!"
          ]},
        { patterns: [/\b(okr|objective|key result|goal)\b/i],
          replies: [
            "Planify supports Company-Level OKRs! You can define Objectives and Key Results at the company, team, and individual level — then link every task to the goals they support. Progress rolls up automatically across the org. 🎯"
          ]},
        { patterns: [/\b(kpi|dashboard|metric|analytics|tracking)\b/i],
          replies: [
            "Our KPI Tracking Dashboards let you build custom views of the metrics that matter — task throughput, cycle time, goal attainment, and team velocity. You can use pre-built templates or drag-and-drop your own! 📊"
          ]},
        { patterns: [/\b(forecast|predict|completion date|when will)\b/i],
          replies: [
            "Planify's AI analyzes your task velocity and historical patterns to predict when projects will actually finish. You get confidence intervals (best/likely/worst case) that auto-adjust as progress changes. 📅"
          ]},
        { patterns: [/\b(scenario|what if|simulate|simulation)\b/i],
          replies: [
            "With Scenario Simulation, you can ask \"What if we delay this by 2 weeks?\" and instantly see the ripple effects across your timeline. Compare multiple scenario branches side-by-side before committing! 🔮"
          ]},
        { patterns: [/\b(coach|manager|team|burnout|workload|delegate)\b/i],
          replies: [
            "Our AI Coaching feature helps managers with real-time recommendations on workload balance, burnout risk detection, and smart delegation based on team strengths. It's like having a management consultant built in! 👥"
          ]},
        { patterns: [/\b(knowledge graph|relationship|dependency|dependencies)\b/i],
          replies: [
            "The Knowledge Graph maps relationships between tasks, people, projects, and decisions. Discover hidden dependencies and institutional knowledge with a visual dependency graph explorer! 🕸️"
          ]},
        { patterns: [/\b(price|pricing|cost|free|pay|subscription|plan)\b/i],
          replies: [
            "Planify is completely free to get started! Sign up at the signup page and you'll have access to all core features including task management, Pomodoro timer, and AI insights. 🎉"
          ]},
        { patterns: [/\b(sign up|register|create account|get started|join)\b/i],
          replies: [
            "Getting started is easy! Just head to the signup page, enter your name, email, and a password, and you're in. It takes less than 30 seconds! 🚀\n\nClick here or visit signup.html to create your account."
          ]},
        { patterns: [/\b(login|sign in|log in|access)\b/i],
          replies: [
            "You can sign in from the home page (index.html). Just enter your email and password. If you don't have an account yet, click 'Create a free account' to sign up first!"
          ]},
        { patterns: [/\b(who (made|built|created)|chizy|developer|creator)\b/i],
          replies: [
            "Planify was built by chizy7 — a developer passionate about building tools that help people be more productive. You can find them on GitHub at github.com/chizy7! 👨‍💻"
          ]},
        { patterns: [/\b(open source|github|source code|contribute)\b/i],
          replies: [
            "Yes! Planify is proudly open source. You can explore the code, report issues, or contribute on GitHub at github.com/chizy7. We'd love your contributions! 💜"
          ]},
        { patterns: [/\b(thank|thanks|thx|appreciate)\b/i],
          replies: [
            "You're welcome! Happy to help. Let me know if there's anything else you'd like to know about Planify! 😊",
            "Anytime! That's what I'm here for. 💜"
          ]},
        { patterns: [/\b(bye|goodbye|see you|later|cya)\b/i],
          replies: [
            "Goodbye! Have a productive day! 🚀",
            "See you later! Remember — plan smarter, achieve more. ✨"
          ]},
        { patterns: [/\b(help|support|assist|stuck|issue|problem|bug)\b/i],
          replies: [
            "I'm here to help! Here's what I can assist with:\n\n• Planify features & how to use them\n• Task management tips\n• Pomodoro timer usage\n• Account & login questions\n• OKRs, KPIs & enterprise features\n\nJust ask me anything specific!"
          ]},
        { patterns: [/\b(tip|advice|productive|productivity|efficient)\b/i],
          replies: [
            "Here's a productivity tip! 💡 Try the \"2-Minute Rule\": if a task takes less than 2 minutes, do it immediately. For everything else, add it to Planify with a priority level and let the smart sorting handle the rest!",
            "Pro tip: Use Planify's Pomodoro timer with 25-minute focus blocks. After 4 sessions, take a longer break. This rhythm keeps your brain sharp all day! 🧠",
            "Advice from top performers: Start each day by reviewing your high-priority tasks in Planify. Tackle the hardest one first (\"eat the frog\") when your energy is highest! 🐸"
          ]}
    ];

    const FALLBACK_REPLIES = [
        "That's a great question! While I'm running in offline mode right now, I can help with anything about Planify's features, tasks, timer, OKRs, and more. What would you like to know?",
        "Hmm, I'm not sure about that specific topic, but I'm an expert on all things Planify! Try asking about features, the Pomodoro timer, task management, or our enterprise AI tools. 🤔",
        "Interesting question! I work best with Planify-related topics. Ask me about tasks, the focus timer, keyboard shortcuts, OKRs, KPI dashboards, or how to get started!",
        "I'd love to help with that! Currently I can answer questions about Planify — features, tips, account help, and more. What would you like to explore?"
    ];

    function getLocalReply(userText) {
        const lower = userText.toLowerCase();
        for (const entry of LOCAL_RESPONSES) {
            for (const pattern of entry.patterns) {
                if (pattern.test(lower)) {
                    const replies = entry.replies;
                    return replies[Math.floor(Math.random() * replies.length)];
                }
            }
        }
        return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
    }

    /* ---------- Inject HTML ---------- */
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
        <!-- Floating trigger button -->
        <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
            <svg class="chatbot-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="chatbot-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                 style="display:none">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>

        <!-- Chat window -->
        <div id="chatbot-window" class="chatbot-window chatbot-hidden">
            <div class="chatbot-header">
                <div class="chatbot-header-left">
                    <div class="chatbot-avatar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                    </div>
                    <div>
                        <span class="chatbot-header-title">Planify AI</span>
                        <span class="chatbot-header-status">Online</span>
                    </div>
                </div>
                <button id="chatbot-close" class="chatbot-close-btn" aria-label="Close chat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <div id="chatbot-messages" class="chatbot-messages">
                <div class="chatbot-msg chatbot-msg-bot">
                    <div class="chatbot-msg-bubble">
                        Hi there! 👋 I'm the Planify assistant. How can I help you today?
                    </div>
                </div>
            </div>

            <form id="chatbot-form" class="chatbot-input-area" autocomplete="off">
                <input id="chatbot-input" class="chatbot-input" type="text"
                       placeholder="Type a message…" required />
                <button type="submit" id="chatbot-send" class="chatbot-send" aria-label="Send message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(widget);

    /* ---------- DOM refs ---------- */
    const toggleBtn  = document.getElementById('chatbot-toggle');
    const closeBtn   = document.getElementById('chatbot-close');
    const chatWindow = document.getElementById('chatbot-window');
    const form       = document.getElementById('chatbot-form');
    const input      = document.getElementById('chatbot-input');
    const messages   = document.getElementById('chatbot-messages');
    const iconOpen   = widget.querySelector('.chatbot-icon-open');
    const iconClose  = widget.querySelector('.chatbot-icon-close');

    /* ---------- Toggle chat window ---------- */
    let isOpen = false;

    function openChat() {
        isOpen = true;
        chatWindow.classList.remove('chatbot-hidden');
        chatWindow.classList.add('chatbot-visible');
        iconOpen.style.display  = 'none';
        iconClose.style.display = 'block';
        toggleBtn.classList.add('chatbot-toggle-active');
        setTimeout(() => input.focus(), 300);
    }

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove('chatbot-visible');
        chatWindow.classList.add('chatbot-hidden');
        iconOpen.style.display  = 'block';
        iconClose.style.display = 'none';
        toggleBtn.classList.remove('chatbot-toggle-active');
    }

    toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
    closeBtn.addEventListener('click', closeChat);

    /* ---------- Helpers ---------- */
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function appendMessage(text, sender) {
        const wrap = document.createElement('div');
        wrap.className = `chatbot-msg chatbot-msg-${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'chatbot-msg-bubble';
        bubble.textContent = text;
        wrap.appendChild(bubble);
        messages.appendChild(wrap);
        scrollToBottom();
        return wrap;
    }

    function showTypingIndicator() {
        const wrap = document.createElement('div');
        wrap.className = 'chatbot-msg chatbot-msg-bot chatbot-typing-wrap';
        wrap.innerHTML = `
            <div class="chatbot-msg-bubble chatbot-typing">
                <span class="chatbot-dot"></span>
                <span class="chatbot-dot"></span>
                <span class="chatbot-dot"></span>
            </div>`;
        messages.appendChild(wrap);
        scrollToBottom();
        return wrap;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    /* ---------- Send message ---------- */
    async function sendMessage(userText) {
        /* Show user message */
        appendMessage(userText, 'user');

        /* Disable input while waiting */
        input.disabled = true;
        const typing = showTypingIndicator();

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            removeTypingIndicator(typing);

            if (!res.ok) {
                throw new Error(`Server error (${res.status})`);
            }

            const data = await res.json();
            const reply = data.reply || data.response || data.message || data.text || JSON.stringify(data);
            appendMessage(reply, 'bot');
        } catch (err) {
            removeTypingIndicator(typing);

            /* ---- Fallback to local AI when API is unreachable ---- */
            const localReply = getLocalReply(userText);
            /* Simulate a short "thinking" delay for natural feel */
            const thinkTyping = showTypingIndicator();
            await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
            removeTypingIndicator(thinkTyping);
            appendMessage(localReply, 'bot');
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    /* ---------- Form submit ---------- */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text);
    });

    /* ---------- Close on Escape ---------- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });

})();
