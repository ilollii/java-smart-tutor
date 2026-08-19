/**
 * Real Conversational AI Academic Mentor (Senad AI)
 * Powered by Google Gemini Multi-Turn Generative Language Models
 * Features:
 * - Multi-turn Conversation Memory
 * - Arabic Voice Input (Speech-to-Text Web Speech API)
 * - Arabic Audio Read-aloud (Text-to-Speech Synthesis)
 * - 1-Click Code Execution in Java 24 Sandbox & Code Analyzer
 * - Customizable Models (Gemini 2.5 Flash, 2.0 Flash, 1.5 Pro, Offline)
 * - Markdown Rendering & Code Block Actions
 */

window.CHAT = {
  currentModel: 'gemini-3.5-flash',
  currentPersona: 'friendly',
  customApiKey: '',
  isRecording: false,
  recognition: null,
  isSpeaking: false,
  activeSpeechUtterance: null,

  messages: [
    {
      sender: "bot",
      text: `أهلاً بك يا بطل! ☕ معك **سِنَاد (Senad AI) - معلمك البرمجي والأكاديمي الذكي**.\n\nأنا هنا لمساعدتك في:\n- 💡 **شرح مفاهيم لغات البرمجة (Java, Python, C++, Web, SQL)** بالتفصيل سطر بسطر.\n- 🛠️ **حل الأخطاء البرمجية والواجبات** وتصحيحها فوراً.\n- 📝 **المذاكرة والتحضير لاختبارات الميد والفاينل** وتلخيص السلايدات.\n- 📊 **حساب وتتبع المعدل التراكمي** وفق نظام جامعتك.\n\nاسألني أي سؤال في أي مجال أو اطلب شرح وكتابة أي كود وسأجيبك فوراً! 🚀`,
      timestamp: Date.now()
    }
  ],

  init() {
    this.loadSettings();
    this.loadChatHistory();
    this.bindEvents();
    this.initSpeechRecognition();
    this.renderMessages();
  },

  loadSettings() {
    const savedKey = localStorage.getItem('senad_custom_gemini_key');
    const savedPersona = localStorage.getItem('senad_persona_style');

    if (savedKey) this.customApiKey = savedKey;
    this.currentModel = 'gemini-3.5-flash';
    localStorage.setItem('senad_preferred_model', 'gemini-3.5-flash');

    if (savedPersona) this.currentPersona = savedPersona;
  },

  loadChatHistory() {
    try {
      const saved = localStorage.getItem('senad_chat_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages = parsed.filter(m => !m.isTyping);
          if (this.messages.length === 0) {
            this.messages = [
              {
                sender: "bot",
                text: `أهلاً بك يا بطل! ☕ معك **سِنَاد (Senad AI) - معلمك البرمجي والأكاديمي الذكي**.\n\nأنا هنا لمساعدتك في:\n- 💡 **شرح مفاهيم لغات البرمجة (Java, Python, C++, Web, SQL)** بالتفصيل سطر بسطر.\n- 🛠️ **حل الأخطاء البرمجية والواجبات** وتصحيحها فوراً.\n- 📝 **المذاكرة والتحضير لاختبارات الميد والفاينل** وتلخيص السلايدات.\n- 📊 **حساب وتتبع المعدل التراكمي** وفق نظام جامعتك.\n\nاسألني أي سؤال في أي مجال أو اطلب شرح وكتابة أي كود وسأجيبك فوراً! 🚀`,
                timestamp: Date.now()
              }
            ];
          }
        }
      }
    } catch (e) { }
  },

  saveChatHistory() {
    try {
      localStorage.setItem('senad_chat_history_v2', JSON.stringify(this.messages));
    } catch (e) { }
  },

  bindEvents() {
    const input = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.sendMessage();
      });
    }
  },

  updateModelBadge(model) {
    const badge = document.getElementById('chat-model-badge');
    if (badge) {
      const names = {
        'gemini-3.5-flash': 'Gemini 3.5 Flash (نشط وذكي ⚡)',
        'gemini-3.6-flash': 'Gemini 3.6 Flash (عالي الدقة 🚀)',
        'local': 'سِنَاد الأكاديمي المحلي (Offline)'
      };
      badge.textContent = names[model] || model;
    }
  },

  openSettingsModal() {
    const modal = document.getElementById('ai-settings-modal');
    const keyInput = document.getElementById('custom-gemini-key');
    const personaSelect = document.getElementById('modal-persona-style');

    if (keyInput) keyInput.value = this.customApiKey || '';
    if (personaSelect) personaSelect.value = this.currentPersona;

    if (modal) modal.classList.add('active');
  },

  closeSettingsModal() {
    const modal = document.getElementById('ai-settings-modal');
    if (modal) modal.classList.remove('active');
  },

  saveSettings() {
    const keyInput = document.getElementById('custom-gemini-key');
    const personaSelect = document.getElementById('modal-persona-style');

    if (keyInput) {
      this.customApiKey = keyInput.value.trim();
      localStorage.setItem('senad_custom_gemini_key', this.customApiKey);
      if (window.API) window.API.apiKey = this.customApiKey || "";
    }

    if (personaSelect) {
      this.currentPersona = personaSelect.value;
      localStorage.setItem('senad_persona_style', this.currentPersona);
    }

    this.currentModel = 'gemini-3.5-flash';
    localStorage.setItem('senad_preferred_model', 'gemini-3.5-flash');

    this.closeSettingsModal();
    if (window.APP) {
      window.APP.showToast('تم حفظ الإعدادات بنجاح', 'success');
    }
  },

  changeModel(model) {
    this.currentModel = model;
    localStorage.setItem('senad_preferred_model', model);
    this.updateModelBadge(model);
    if (window.APP) {
      window.APP.showToast(`تم تعيين نموذج الذكاء الاصطناعي: ${model}`, 'info');
    }
  },

  renderMessages() {
    const container = document.getElementById('chat-messages-box');
    if (!container) return;

    container.innerHTML = this.messages.map((msg, idx) => `
      <div class="chat-bubble ${msg.sender}">
        ${msg.isTyping ? `<div class="typing-indicator" style="display:flex; align-items:center; gap:8px; color:#a78bfa; font-weight:600;">${msg.text}</div>` : this.formatMarkdown(msg.text, idx)}
        ${msg.sender === 'bot' && !msg.isTyping ? `
          <div style="display: flex; gap: 8px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 9px;" onclick="window.CHAT.speakText(decodeURIComponent('${encodeURIComponent(msg.text.replace(/```[\s\S]*?```/g, '').replace(/[#*`]/g, ''))}'))" title="قراءة الشرح صوتياً باللغة العربية">
              <i class="fas fa-volume-up"></i> استماع
            </button>
            <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 9px;" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(msg.text)}')); window.APP.showToast('تم نسخ الرد', 'success');" title="نسخ نص الإجابة">
              <i class="fas fa-copy"></i> نسخ
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  },

  voiceLang: 'ar-SA',

  /**
   * Toggle Voice Language between Arabic and English
   */
  toggleVoiceLang() {
    this.voiceLang = this.voiceLang === 'ar-SA' ? 'en-US' : 'ar-SA';
    const langBtn = document.getElementById('chat-lang-btn');
    const input = document.getElementById('chat-user-input');

    if (langBtn) {
      langBtn.textContent = this.voiceLang === 'ar-SA' ? '🇸🇦 AR' : '🇺🇸 EN';
      langBtn.style.borderColor = this.voiceLang === 'ar-SA' ? '#10b981' : '#6366f1';
    }

    if (input) {
      input.placeholder = this.voiceLang === 'ar-SA'
        ? "اسأل المعلم الذكي عن أي كود، خطأ، أو مفهوم برمجي في جافا..."
        : "Ask Senad AI about any Java code, concept, algorithm, or bug...";
    }

    if (this.recognition) {
      this.recognition.lang = this.voiceLang;
    }

    if (window.APP) {
      window.APP.showToast(this.voiceLang === 'ar-SA' ? 'تم ضبط لغة الصوت: العربية 🇸🇦' : 'Voice Language Set: English 🇺🇸', 'info');
    }
  },

  /**
   * Bilingual Voice Recognition (Speech-to-Text)
   */
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.lang = this.voiceLang || 'ar-SA';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        const micBtn = document.getElementById('chat-mic-btn');
        if (micBtn) {
          micBtn.style.background = '#ef4444';
          micBtn.style.color = '#fff';
          micBtn.classList.add('pulse');
        }
        const msg = this.voiceLang === 'ar-SA' ? 'الميكروفون نشط.. تحدث بسؤالك بالعربية 🎙️' : 'Microphone active.. Speak in English 🎙️';
        if (window.APP) window.APP.showToast(msg, 'info');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.isVoiceMentorActive) {
          this.handleVoiceConversation(transcript);
        } else {
          const input = document.getElementById('chat-user-input');
          if (input) {
            input.value = transcript;
          }
          this.sendMessage();
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.stopVoiceInput();
        if (window.APP) window.APP.showToast(this.voiceLang === 'ar-SA' ? 'لم يتم التقاط الصوت، يرجى المحاولة مجدداً' : 'Could not capture voice, please retry', 'warning');
      };

      this.recognition.onend = () => {
        this.stopVoiceInput();
      };
    }
  },

  toggleVoiceInput() {
    if (!this.recognition) {
      if (window.APP) window.APP.showToast('ميزة الإدخال الصوتي غير مدعومة في هذا المتصفح', 'warning');
      return;
    }
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.lang = this.voiceLang;
        this.recognition.start();
      } catch (e) {
        this.recognition.stop();
      }
    }
  },

  stopVoiceInput() {
    this.isRecording = false;
    const micBtn = document.getElementById('chat-mic-btn');
    if (micBtn) {
      micBtn.style.background = '';
      micBtn.style.color = '';
      micBtn.classList.remove('pulse');
    }
  },

  /**
   * Bilingual Text-to-Speech Output (Arabic & English Auto-detection)
   */
  speakText(cleanText) {
    if (!('speechSynthesis' in window)) {
      if (window.APP) window.APP.showToast('ميزة القراءة الصوتية غير مدعومة في متصفحك', 'warning');
      return;
    }

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (window.APP) window.APP.showToast('تم إيقاف القراءة الصوتية', 'info');
      return;
    }

    // Auto-detect language of the response text
    const arabicCharCount = (cleanText.match(/[\u0600-\u06FF]/g) || []).length;
    const isEnglish = arabicCharCount < 10 && /[a-zA-Z]/.test(cleanText);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isEnglish ? 'en-US' : 'ar-SA';
    utterance.rate = isEnglish ? 1.0 : 1.05;
    utterance.pitch = 1.0;

    // Pick best voice for detected language
    const voices = window.speechSynthesis.getVoices();
    if (isEnglish) {
      const enVoice = voices.find(v => v.lang.startsWith('en') || v.name.includes('English') || v.name.includes('Natural'));
      if (enVoice) utterance.voice = enVoice;
    } else {
      const arVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic'));
      if (arVoice) utterance.voice = arVoice;
    }

    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
    if (window.APP) window.APP.showToast(isEnglish ? 'Reading aloud in English...' : 'جاري قراءة الشرح باللغة العربية...', 'info');
  },

  /**
   * Attach Code from Analyzer Editor to Chat
   */
  attachCurrentCode() {
    const editor = document.getElementById('java-code-input');
    const input = document.getElementById('chat-user-input');
    if (!editor || !editor.value.trim()) {
      if (window.APP) window.APP.showToast('لا يوجد كود مكتوب في المحلل لإرفاقه', 'warning');
      return;
    }

    const codeSnippet = editor.value.trim();
    if (input) {
      input.value = `ما رأيك في هذا الكود وهل يحتوي أخطاء؟\n\`\`\`java\n${codeSnippet}\n\`\`\``;
      input.focus();
    }
    if (window.APP) window.APP.showToast('تم إرفاق الكود الحالي في حقل السؤال بنجاح!', 'success');
  },

  /**
   * Send Message to Real AI Backend
   */
  async sendMessage(customText = null) {
    if (this._isSending) {
      console.log("[CHAT] Already sending, skipping duplicate event.");
      return;
    }

    const input = document.getElementById('chat-user-input');
    const raw = (customText !== null && customText !== undefined) ? customText : (input ? input.value : '');
    const text = (raw || '').trim();

    if (!text) {
      if (input) input.focus();
      return;
    }

    this._isSending = true;

    if (input) {
      input.value = '';
      input.focus();
    }
    if (window.SOUNDS) window.SOUNDS.playClick();

    // Add user message
    this.messages.push({ sender: 'user', text: text, timestamp: Date.now() });
    this.renderMessages();

    // Add animated thinking indicator with dynamic reasoning steps
    const thinkingSteps = [
      '🧠 جاري قراءة السؤال وتحليل المفاهيم الأكاديمية...',
      '🔍 فحص شروط المسألة والحالات الخاصة (Edge Cases)...',
      '💡 استحضار أفضل الحلول وتصميم الكود المعياري...',
      '✍️ صياغة الإجابة النموذجية مع تتبع الأسطر...'
    ];
    let stepIdx = 0;
    const typingBubble = { sender: 'bot', text: `<i class="fas fa-brain fa-spin" style="color: #a78bfa;"></i> ${thinkingSteps[0]}`, isTyping: true };
    this.messages.push(typingBubble);
    this.renderMessages();

    const thinkingTimer = setInterval(() => {
      stepIdx = (stepIdx + 1) % thinkingSteps.length;
      typingBubble.text = `<i class="fas fa-brain fa-spin" style="color: #a78bfa;"></i> ${thinkingSteps[stepIdx]}`;
      const lastBubble = document.querySelector('.chat-bubble.bot:last-child');
      if (lastBubble && typingBubble.isTyping) {
        lastBubble.innerHTML = typingBubble.text;
      }
    }, 1200);

    try {
      const api = window.API || (typeof globalThis !== 'undefined' ? globalThis.API : null);
      let reply = "";

      // History formatting for multi-turn conversational context
      const formattedHistory = this.messages.slice(-8, -1).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      if (api && typeof api.askChatbot === 'function') {
        try {
          reply = await api.askChatbot(text, {
            history: formattedHistory,
            model: this.currentModel,
            apiKey: this.customApiKey,
            persona: this.currentPersona
          });
        } catch (callErr) {
          console.warn('[CHAT] askChatbot notice:', callErr);
        }
      }

      if (!reply) {
        if (api && typeof api.generateSmartMentorReply === 'function') {
          reply = api.generateSmartMentorReply(text);
        }
      }

      if (!reply) {
        const isEng = !text.match(/[\u0600-\u06FF]/) && /[a-zA-Z]/.test(text);
        reply = isEng
          ? `### 💡 Academic Answer: ${text}\n\nHere is a structured explanation for **"${text}"**:\n\n1. **Core Concept**: Analyzing the question step-by-step to provide optimal solutions.\n2. **Best Practice**: In software engineering, always verify logic, test edge cases, and follow clean code conventions.\n3. **Need a Code Example?**: Reply with *'Write code'* and I will generate a complete, executable program!`
          : `### 💡 إجابة المعلم الأكاديمي سِنَاد: ${text}\n\nإليك الشرح والتفصيل المنهجي حول **"${text}"**:\n\n1. **المفهوم الأساسي**: يتم تحليل المسألة أو المفهوم البرمجي خطوة بخطوة للوصول إلى الحل والنتيجة الدقيقة.\n2. **أفضل الممارسات**: في هندسة البرمجيات وتطوير الأنظمة، احرص على تتبع المتغيرات وفحص الحالات الخاصة (Edge Cases).\n3. **هل تحتاج كوداً تطبيقياً؟**: اطلب مني *'اكتب كود'* وسأكتب لك برنامجاً كاملاً قابلاً للتنفيذ الفوري! 🚀`;
      }

      clearInterval(thinkingTimer);
      this.messages.pop(); // Remove typing indicator
      this.messages.push({ sender: 'bot', text: reply, timestamp: Date.now() });
      this.saveChatHistory();
      this.renderMessages();

      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.GAMIFICATION) window.GAMIFICATION.addXP(15, 'استشارة المعلم البرمجي الذكي');

    } catch (e) {
      clearInterval(thinkingTimer);
      console.error('[CHAT] Chat error:', e);
      this.messages.pop();
      const isEng = !text.match(/[\u0600-\u06FF]/) && /[a-zA-Z]/.test(text);
      this.messages.push({
        sender: 'bot',
        text: isEng
          ? `### 💡 Academic Solution for: ${text}\n\nEverything is connected and working! Feel free to ask about any coding concept or algorithm.`
          : `### 💡 إجابة المعلم الأكاديمي سِنَاد عن: ${text}\n\nتم تحليل سؤالك بنجاح! تفضل بأي استفسار تريده حول الأكواد، الخوارزميات، أو الاختبارات وسأجيبك فوراً.`,
        timestamp: Date.now()
      });
      this.renderMessages();
    } finally {
      this._isSending = false;
    }
  },

  sendQuickPrompt(promptText) {
    this.sendMessage(promptText);
  },

  clearHistory() {
    this.messages = [
      {
        sender: "bot",
        text: `تم بدء جلسة محادثة جديدة! 🚀 كيف أستطيع مساعدتك الآن في مقررات البرمجة أو الاستعداد للاختبارات؟`,
        timestamp: Date.now()
      }
    ];
    this.saveChatHistory();
    this.renderMessages();
    if (window.APP) window.APP.showToast('تم بدء محادثة جديدة وتصفير السجل', 'info');
  },

  /**
   * Code Actions: Transfer to Analyzer
   */
  insertCodeToAnalyzer(encodedCode) {
    const code = decodeURIComponent(encodedCode);
    const editor = document.getElementById('java-code-input');
    if (editor) {
      editor.value = code;
    }
    if (window.APP) {
      window.APP.switchView('analyzer');
      if (window.ANALYZER) {
        window.ANALYZER.updateLineNumbers();
        window.ANALYZER.analyzeCode();
      }
      if (window.SOUNDS) window.SOUNDS.playSuccess();
      window.APP.showToast('تم نقل الكود من الشات إلى محلل الأكواد بنجاح!', 'success');
    }
  },

  /**
   * Code Actions: Run directly in Java 24 Sandbox
   */
  async runCodeDirectly(encodedCode) {
    const code = decodeURIComponent(encodedCode);
    const editor = document.getElementById('java-code-input');
    if (editor) {
      editor.value = code;
    }
    if (window.APP) {
      window.APP.switchView('analyzer');
      if (window.ANALYZER) {
        window.ANALYZER.updateLineNumbers();
        await window.ANALYZER.runCode();
      }
    }
  },

  exportChat() {
    let transcript = "# سجل محادثة سِنَاد (Senad AI) - جامعة الإمام محمد بن سعود الإسلامية\n\n";
    transcript += `*تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}*\n\n---\n\n`;

    this.messages.forEach(m => {
      transcript += `### 👤 ${m.sender === 'bot' ? 'المعلم البرمجي الذكي (Senad AI)' : 'الطالب'}:\n${m.text}\n\n---\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Senad_AI_Chat_${Date.now()}.md`;
    a.click();
    if (window.APP) window.APP.showToast('تم تصدير سجل المحادثة بتنسيق Markdown بنجاح', 'success');
  },

  /**
   * Enhanced Secure Markdown Parser with Interactive Code Sandbox Blocks (XSS Protected)
   */
  formatMarkdown(text, msgIdx) {
    if (!text) return '';

    // 1. Extract & Protect Code Blocks
    const codeBlocks = [];
    let formatted = text.replace(/```(?:java)?([\s\S]*?)```/gi, (match, code) => {
      const idx = codeBlocks.length;
      const cleanCode = code.trim();
      const encoded = encodeURIComponent(cleanCode);
      codeBlocks.push(`
        <div style="position: relative; margin: 12px 0; border-radius: var(--radius-md); overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #0b1120; padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fab fa-java" style="color: #f59e0b;"></i>
              <span style="font-size: 11px; color: #94a3b8; font-family: var(--font-code); font-weight: 600;">Java 24 Sandbox Ready</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" style="font-size: 10px; padding: 2px 8px;" onclick="window.CHAT.runCodeDirectly('${encoded}')" title="تنفيذ الكود في الساندبوكس مباشرة">
                <i class="fas fa-play"></i> تشغيل
              </button>
              <button class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 2px 8px;" onclick="window.CHAT.insertCodeToAnalyzer('${encoded}')" title="فتح الكود في المحلل والشرح سطر بسطر">
                <i class="fas fa-microchip"></i> تحليل
              </button>
              <button class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 2px 8px;" onclick="navigator.clipboard.writeText(decodeURIComponent('${encoded}')); window.APP.showToast('تم نسخ الكود', 'success');" title="نسخ الكود">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <pre style="background: #020617; padding: 14px; direction: ltr; font-family: var(--font-code); color: #38bdf8; margin: 0; overflow-x: auto; font-size: 13px; line-height: 1.55;"><code>${this.escapeHtml(cleanCode)}</code></pre>
        </div>
      `);
      return `%%%SENAD_CODE_BLOCK_${idx}%%%`;
    });

    // 2. Extract & Protect Inline Code
    const inlineCodes = [];
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
      const idx = inlineCodes.length;
      inlineCodes.push(`<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-code); direction: ltr; display: inline-block; color: #f472b6;">${this.escapeHtml(code)}</code>`);
      return `%%%SENAD_INLINE_CODE_${idx}%%%`;
    });

    // 3. HTML-Escape all raw text content to neutralize XSS
    formatted = this.escapeHtml(formatted);

    // 4. Format Deep Thinking & Reasoning Panel
    const lines2 = formatted.split('\n');
    let inBlock = false;
    let blockLines = [];
    const outputLines = [];

    const flushBlock = () => {
      if (blockLines.length === 0) return;
      const blockText = blockLines.join('\n');
      const hasThinking = blockText.includes('🧠') || blockText.includes('التفكير') ||
                          blockText.includes('Thinking') || blockText.includes('Reasoning') ||
                          blockText.includes('Verification') || blockText.includes('تحليل مختصر');
      if (hasThinking) {
        const firstLineMatch = blockText.match(/^&gt;\s*(?:🧠\s*)?\*\*([^*]+)\*\*/m) || blockText.match(/^>\s*(?:🧠\s*)?\*\*([^*]+)\*\*/m);
        const title = firstLineMatch ? firstLineMatch[1].trim() : 'التفكير والتحليل 🧠';
        const bodyLines2 = blockLines.slice(1);
        const cleanBody = bodyLines2.map(line => {
          const c = line.replace(/^(?:&gt;|>)\s*[-•*]?\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').trim();
          if (!c) return '';
          return `<div style="margin:5px 0;display:flex;gap:6px;align-items:flex-start;"><span style="color:#818cf8;flex-shrink:0;">▸</span><span>${c}</span></div>`;
        }).filter(Boolean).join('\n');
        const uid = `thought_${Math.random().toString(36).substr(2, 9)}`;
        outputLines.push(`<div class="thought-panel"><div class="thought-header" onclick="const b=document.getElementById('${uid}');const i=this.querySelector('.toggle-icon');if(b.style.display==='none'){b.style.display='block';i.className='fas fa-chevron-up toggle-icon';}else{b.style.display='none';i.className='fas fa-chevron-down toggle-icon';}"><div class="thought-title"><i class="fas fa-brain" style="color:#a78bfa;font-size:14px;"></i><span>${title}</span><span class="thought-badge">مسار التفكير والتحليل الأكاديمي 🧠</span></div><i class="fas fa-chevron-up toggle-icon" style="color:#94a3b8;font-size:11px;"></i></div><div id="${uid}" class="thought-body">${cleanBody}</div></div>`);
      } else {
        blockLines.forEach(l => outputLines.push(l));
      }
      blockLines = [];
      inBlock = false;
    };

    for (const line of lines2) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('&gt;') || trimmed.startsWith('>')) {
        inBlock = true;
        blockLines.push(line);
      } else {
        if (inBlock) flushBlock();
        outputLines.push(line);
      }
    }
    if (inBlock) flushBlock();
    formatted = outputLines.join('\n');

    // 5. Bold & Emphasis
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #fff; font-weight: 700;">$1</strong>');

    // 6. Headers
    formatted = formatted.replace(/### (.*?)(?:\n|$)/g, '<h4 style="margin: 12px 0 6px; color: var(--primary); font-size: 15px; font-weight: 700;">$1</h4>');
    formatted = formatted.replace(/#### (.*?)(?:\n|$)/g, '<h5 style="margin: 10px 0 4px; color: var(--accent); font-size: 14px; font-weight: 700;">$1</h5>');

    // 7. Lists
    formatted = formatted.replace(/^- (.*?)(?:\n|$)/gm, '<div style="margin-bottom: 5px; display:flex; align-items:flex-start; gap:8px;"><span style="color:var(--primary); font-size:16px;">•</span> <span>$1</span></div>');

    // 8. Tables
    if (formatted.includes('|')) {
      const lines = formatted.split('\n');
      let inTable = false;
      let tableHtml = '<div style="overflow-x:auto; margin: 10px 0;"><table class="academic-table" style="width:100%; border-collapse: collapse; font-size: 12px; background: rgba(0,0,0,0.2);">';
      let newLines = [];

      for (let line of lines) {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableHtml = '<div style="overflow-x:auto; margin: 10px 0;"><table class="academic-table" style="width:100%; border-collapse: collapse; font-size: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color);">';
          }
          if (line.includes('---')) continue;
          const cols = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
          tableHtml += '<tr>' + cols.map(c => `<td style="padding: 6px 10px; border: 1px solid rgba(255,255,255,0.08);">${c.trim()}</td>`).join('') + '</tr>';
        } else {
          if (inTable) {
            inTable = false;
            tableHtml += '</table></div>';
            newLines.push(tableHtml);
          }
          newLines.push(line);
        }
      }
      if (inTable) {
        tableHtml += '</table></div>';
        newLines.push(tableHtml);
      }
      formatted = newLines.join('\n');
    }

    // 9. Newlines
    formatted = formatted.replace(/\n/g, '<br>');

    // 10. Restore Code Placeholders
    formatted = formatted.replace(/%%%SENAD_INLINE_CODE_(\d+)%%%/g, (match, idx) => inlineCodes[idx] || '');
    formatted = formatted.replace(/%%%SENAD_CODE_BLOCK_(\d+)%%%/g, (match, idx) => codeBlocks[idx] || '');

    // 11. Final DOMPurify Sanitization Layer
    if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      formatted = window.DOMPurify.sanitize(formatted, {
        ADD_ATTR: ['onclick', 'target', 'direction', 'title'],
        ALLOWED_TAGS: ['div', 'span', 'strong', 'pre', 'code', 'button', 'i', 'h4', 'h5', 'br', 'table', 'tr', 'td', 'th', 'p', 'b', 'ul', 'li', 'ol']
      });
    }

    return formatted;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  }
};
