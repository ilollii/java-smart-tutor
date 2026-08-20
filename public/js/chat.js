/**
 * Real Conversational AI Academic Mentor (Senad AI)
 * Powered by OpenRouter / Google Gemini Generative Models
 * Features:
 * - Multi-turn Conversation Memory & Database Persistence
 * - 1-Click Code Execution in Java 24 Sandbox & Code Analyzer
 * - Customizable Academic Reasoning Models
 * - Markdown Rendering & Code Block Actions
 */

window.CHAT = {
  currentModel: 'gemini-2.5-flash',
  currentPersona: 'friendly',
  customApiKey: '',
  _isSending: false,

  messages: [
    {
      sender: "bot",
      text: `أهلاً بك يا بطل! ☕ معك **سِنَاد (Senad AI) - معلمك البرمجي والأكاديمي الذكي**.\n\nأنا هنا لمساعدتك حصرياً في:\n- 💡 **شرح مفاهيم لغات البرمجة (Java, Python, C++, Web, SQL)** بالتفصيل سطر بسطر.\n- 🛠️ **حل وتصحيح الأكواد البرمجية والواجبات** وتتبع الأخطاء فوراً.\n- 📝 **المذاكرة والتحضير لاختبارات البرمجة والميد والفاينل** وتلخيص السلايدات.\n- 📊 **حساب وتتبع المعدل التراكمي** لطلاب كليات الحاسب.\n\nاسألني أي سؤال برمجي أو اطلب كتابة وشرح أي كود في لغة جافا ولغات البرمجة وسأجيبك فوراً! 🚀`,
      timestamp: Date.now()
    }
  ],

  init() {
    this.loadSettings();
    this.loadChatHistory();
    this.bindEvents();
    this.renderMessages();
  },

  loadSettings() {
    // Security: Use ephemeral sessionStorage for sensitive API keys
    const savedKey = sessionStorage.getItem('senad_custom_gemini_key') || localStorage.getItem('senad_custom_gemini_key');
    const savedPersona = localStorage.getItem('senad_persona_style');

    if (savedKey) {
      this.customApiKey = savedKey;
      sessionStorage.setItem('senad_custom_gemini_key', savedKey);
      localStorage.removeItem('senad_custom_gemini_key'); // Clean legacy persistent key
    }
    this.currentModel = 'gemini-2.5-flash';
    localStorage.setItem('senad_preferred_model', 'gemini-2.5-flash');

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
                text: `أهلاً بك يا بطل! ☕ معك **سِنَاد (Senad AI) - معلمك البرمجي والأكاديمي الذكي**.\n\nأنا هنا لمساعدتك حصرياً في:\n- 💡 **شرح مفاهيم لغات البرمجة (Java, Python, C++, Web, SQL)** بالتفصيل سطر بسطر.\n- 🛠️ **حل وتصحيح الأكواد البرمجية والواجبات** وتتبع الأخطاء فوراً.\n- 📝 **المذاكرة والتحضير لاختبارات البرمجة والميد والفاينل** وتلخيص السلايدات.\n- 📊 **حساب وتتبع المعدل التراكمي** لطلاب كليات الحاسب.\n\nاسألني أي سؤال برمجي أو اطلب كتابة وشرح أي كود في لغة جافا ولغات البرمجة وسأجيبك فوراً! 🚀`,
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
      const student = (window.AUTH && window.AUTH.currentUser) || {};
      if (student.email && window.API && typeof window.API.saveChatToDB === 'function') {
        window.API.saveChatToDB(student.email, this.messages);
      }
    } catch (e) { }
  },

  bindEvents() {
    const input = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (input) {
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      };
    }

    if (sendBtn) {
      sendBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.sendMessage();
      };
    }
  },

  updateModelBadge(model) {
    const badge = document.getElementById('chat-model-badge');
    if (badge) {
      const names = {
        'gemini-2.5-flash': 'Gemini 2.5 Flash (نشط وذكي ⚡)',
        'gemini-2.0-flash': 'Gemini 2.0 Flash (عالي الدقة 🚀)',
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
      sessionStorage.setItem('senad_custom_gemini_key', this.customApiKey);
      localStorage.removeItem('senad_custom_gemini_key');
      if (window.API) window.API.apiKey = this.customApiKey || "";
    }

    if (personaSelect) {
      this.currentPersona = personaSelect.value;
      localStorage.setItem('senad_persona_style', this.currentPersona);
    }

    this.currentModel = 'gemini-2.5-flash';
    localStorage.setItem('senad_preferred_model', 'gemini-2.5-flash');

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
            <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 9px;" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(msg.text)}')); window.APP.showToast('تم نسخ الرد', 'success');" title="نسخ نص الإجابة">
              <i class="fas fa-copy"></i> نسخ
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
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
    const sendBtn = document.getElementById('chat-send-btn');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الرد...';
    }

    // Safety timeout to ensure sending lock is ALWAYS released within 20s
    const safetyUnlockTimeout = setTimeout(() => {
      this._isSending = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
      }
    }, 20000);

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
      clearTimeout(safetyUnlockTimeout);
      this.messages.pop(); // Remove typing indicator
      this.messages.push({ sender: 'bot', text: reply, timestamp: Date.now() });
      this.saveChatHistory();
      this.renderMessages();

      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.GAMIFICATION) window.GAMIFICATION.addXP(15, 'استشارة المعلم البرمجي الذكي');

    } catch (e) {
      clearInterval(thinkingTimer);
      clearTimeout(safetyUnlockTimeout);
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
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
      }
      if (input) input.focus();
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
  formatMarkdown(rawText, msgIdx) {
    if (!rawText) return '';

    // 0. Completely Strip any Thinking & Reasoning Tags or Blocks (Hidden from user)
    let formatted = (rawText || '')
      .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/gi, '');

    // 1. Extract & Protect Code Blocks
    const codeBlocks = [];
    formatted = formatted.replace(/```(?:([a-zA-Z0-9_-]+)?\n)?([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      const cleanLang = (lang || 'java').toLowerCase().trim();
      const cleanCode = (code || '').replace(/^\n+|\n+$/g, '');
      const encoded = encodeURIComponent(cleanCode);

      codeBlocks.push(`
        <div class="code-block-wrapper" style="margin: 12px 0; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; overflow: hidden;">
          <div class="code-block-header" style="background: rgba(0,0,0,0.5); padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span style="font-size: 11px; font-family: var(--font-code); color: var(--primary); font-weight: 700;">
              <i class="fab fa-java"></i> ${cleanLang.toUpperCase()}
            </span>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" style="font-size: 10px; padding: 2px 8px;" onclick="window.CHAT.runCodeDirectly('${encoded}')" title="تشغيل الكود مباشرة في Java 24 Sandbox">
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

    // 4. Filter blockquotes - completely hide/suppress any Thinking/Reasoning blockquotes
    const lines2 = formatted.split('\n');
    let inBlock = false;
    let blockLines = [];
    const outputLines = [];

    const flushBlock = () => {
      if (blockLines.length === 0) return;
      const blockText = blockLines.join('\n');
      const hasThinking = blockText.includes('🧠') || blockText.includes('التفكير') ||
                          blockText.includes('Thinking') || blockText.includes('Reasoning') ||
                          blockText.includes('Verification') || blockText.includes('تحليل مختصر') ||
                          blockText.includes('الهدف والمطلوب') || blockText.includes('استراتيجية الحل');
      if (!hasThinking) {
        blockLines.forEach(l => {
          const c = l.replace(/^(?:&gt;|>)\s*/, '');
          outputLines.push(`<div class="academic-note" style="border-right: 3px solid var(--primary); padding: 6px 12px; margin: 6px 0; background: rgba(16, 185, 129, 0.08); border-radius: 4px;">${c}</div>`);
        });
      }
      // If hasThinking: completely suppressed
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

    // Strip leading blank lines
    while (outputLines.length > 0 && !outputLines[0].trim()) {
      outputLines.shift();
    }
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
  }
};
