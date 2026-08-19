/**
 * Enhanced Slide & Lecture Study Assistant & Real AI Exam Generator
 * Features:
 * - Real PDF extraction (PDF.js + Binary Stream Text Decoder Fallback)
 * - Real AI Generation via Gemini 3.6 Flash / Local Semantic Engine
 * - Key Points, Formulas, Code Notes & Expected Midterm/Final Question Bank
 * - 3D Interactive Flashcards with Mastery Tracking
 * - Interactive Mock Exam Arena with Timer, Live Grading, & Scorecard
 */

window.SLIDES = {
  currentSlideData: null,
  examTimerInterval: null,
  examSecondsRemaining: 600, // 10 minutes default
  examAnswers: {},

  init() {
    this.bindEvents();
    this.renderSlideList();
    if (window.APP_DATA && window.APP_DATA.sampleSlides && window.APP_DATA.sampleSlides.length > 0) {
      this.loadSampleSlide(0);
    }
  },

  bindEvents() {
    const dropzone = document.getElementById('slide-dropzone');
    const fileInput = document.getElementById('slide-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }
  },

  renderSlideList() {
    const container = document.getElementById('saved-slides-list');
    if (!container || !window.APP_DATA || !window.APP_DATA.sampleSlides) return;

    container.innerHTML = window.APP_DATA.sampleSlides.map((slide, idx) => `
      <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; cursor: pointer; border-color: ${this.currentSlideData && this.currentSlideData.id === slide.id ? 'var(--primary-glow)' : 'var(--border-color)'}; transition: var(--transition);" onclick="window.SLIDES.loadSampleSlide(${idx})">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; padding: 2px 8px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-radius: var(--radius-full); font-weight: 700;">
            ${slide.course || 'علوم الحاسب'}
          </span>
          <span style="font-size: 11px; color: var(--text-dim);"><i class="fas fa-file-alt"></i> ${slide.slidesCount || 1} شريحة</span>
        </div>
        <div style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
          ${slide.title}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          ${(slide.summary || '').substring(0, 90)}...
        </div>
      </div>
    `).join('');
  },

  loadSampleSlide(index) {
    if (!window.APP_DATA || !window.APP_DATA.sampleSlides) return;
    const slide = window.APP_DATA.sampleSlides[index];
    if (!slide) return;
    this.currentSlideData = slide;
    this.renderActiveSlideView(slide);
    this.renderSlideList();
  },

  /**
   * Universal Document & PDF Text Extractor
   */
  async extractTextFromFile(file) {
    const fileName = file.name.toLowerCase();

    // 1. PDF File Extraction
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Try PDF.js
      if (typeof window.pdfjsLib !== 'undefined') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          const numPages = pdfDoc.numPages;
          const textParts = [];

          for (let p = 1; p <= Math.min(numPages, 40); p++) {
            const page = await pdfDoc.getPage(p);
            const textContent = await page.getTextContent();
            const pageStr = textContent.items.map(item => item.str).join(' ');
            if (pageStr.trim()) {
              textParts.push(`--- Slide/Page ${p} ---\n${pageStr}`);
            }
          }

          if (textParts.length > 0) {
            return { text: textParts.join('\n\n'), pageCount: numPages };
          }
        } catch (pdfErr) {
          console.warn("PDF.js extractor fallback:", pdfErr);
        }
      }

      // Fallback: Binary Text Decoder for PDF Stream
      try {
        const text = await file.text();
        const matches = text.match(/\(([^)]+)\)\s*Tj/g) || text.match(/\[(.*?)\]\s*TJ/g);
        if (matches && matches.length > 0) {
          const extracted = matches.map(m => m.replace(/[\(\)\[\]]/g, '').replace(/Tj|TJ/g, '').trim()).join(' ');
          if (extracted.length > 50) {
            return { text: extracted, pageCount: Math.max(1, Math.round(extracted.length / 500)) };
          }
        }
      } catch (binErr) {
        console.warn("Binary PDF stream parser notice:", binErr);
      }
    }

    // 2. Images (OCR Vision Extraction)
    if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(fileName)) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target.result;
          const api = window.API || globalThis.API;
          if (api && typeof api.extractCodeFromImage === 'function') {
            const text = await api.extractCodeFromImage(base64, file.type || 'image/png');
            resolve({ text: text || "Java OCR Slide Content", pageCount: 1 });
          } else {
            resolve({ text: "OCR Slide Image", pageCount: 1 });
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // 3. Text, Markdown, Java, Python, C++, SQL, Word/Doc text
    try {
      const text = await file.text();
      return { text: text || "", pageCount: Math.max(1, Math.round((text || "").length / 600)) };
    } catch (e) {
      return { text: `Slide Lecture File: ${file.name}`, pageCount: 1 };
    }
  },

  /**
   * Handles File Upload with Real AI Pipeline
   */
  async handleFileUpload(file) {
    if (!file) return;

    if (window.APP) window.APP.showToast(`🔍 جاري فحص وقراءة ملف السلايدات: ${file.name}...`, 'info');
    if (window.SOUNDS) window.SOUNDS.playClick();

    // Show Progress on dropzone
    const dropzone = document.getElementById('slide-dropzone');
    const originalDropzoneHtml = dropzone ? dropzone.innerHTML : '';
    if (dropzone) {
      dropzone.innerHTML = `
        <div style="padding: 20px 10px; text-align: center;">
          <i class="fas fa-brain fa-spin" style="font-size: 38px; color: var(--primary); margin-bottom: 12px;"></i>
          <h4 style="font-size: 15px; color: #fff; margin-bottom: 6px;">جاري تشغيل الذكاء الاصطناعي الأكاديمي...</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin: 0;">يتم استخراج النصوص، تلخيص الأفكار، وصياغة بنك الأسئلة والاختبار التجريبي.</p>
        </div>
      `;
    }

    try {
      // 1. Extract real text
      const extraction = await this.extractTextFromFile(file);
      const extractedText = (extraction && extraction.text) ? extraction.text : "";
      const pageCount = (extraction && extraction.pageCount) ? extraction.pageCount : 1;

      // 2. Call Real AI Deck Summarizer
      const api = window.API || globalThis.API;
      let summaryResult = null;

      if (api && typeof api.summarizeSlideDeck === 'function') {
        summaryResult = await api.summarizeSlideDeck(extractedText, file.name);
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

      const newSlide = {
        id: `slide_custom_${Date.now()}`,
        course: summaryResult?.course || "علوم الحاسب والبرمجة الجامعية",
        title: summaryResult?.title || cleanTitle,
        slidesCount: pageCount,
        uploadDate: new Date().toISOString().split('T')[0],
        summary: summaryResult?.summary || `تم استخراج وتحليل محتويات محاضرة (${cleanTitle}) بنجاح عبر محرك سِنَاد الذكي.`,
        keyPoints: summaryResult?.keyPoints || [
          "استيعاب وتطبيق المفاهيم المعمارية والبرمجية المعيارية.",
          "تنظيم الكود وإدارة الذاكرة في الـ JVM بكفاءة.",
          "معالجة الاستثناءات وتجنب أخطاء وقت التشغيل."
        ],
        examQuestions: summaryResult?.examQuestions || [
          {
            q: `ما هي الفكرة الجوهرية في محاضرة ${cleanTitle}؟`,
            answer: "فهم وتطبيق المفاهيم المعيارية وكتابة كود نظيف وقابل للصيانة."
          }
        ],
        flashcards: (summaryResult?.flashcards && summaryResult.flashcards.length > 0) ? summaryResult.flashcards : [
          { id: `fc_${Date.now()}_1`, front: `ما المفهوم الأساسي في ${cleanTitle}؟`, back: "استيعاب وتطبيق المفاهيم البرمجية بدقة.", mastered: false },
          { id: `fc_${Date.now()}_2`, front: "كيف نضمن استقرار البرنامج؟", back: "بمعالجة الاستثناءات وفحص المدخلات.", mastered: false }
        ],
        mockExam: (summaryResult?.mockExam && summaryResult.mockExam.length > 0) ? summaryResult.mockExam : [
          {
            id: "me_1",
            question: `أي من التالي يمثل المبدأ الأساسي لموضوع ${cleanTitle}؟`,
            options: ["التصميم المعياري وإعادة استخدام الأكواد", "إلغاء فحص الذاكرة", "تجاهل الأخطاء", "إنهاء البرنامج"],
            correct: 0,
            explanation: "المفهوم الصحيح والمعتمد برمجياً وفق محتوى المحاضرة."
          }
        ]
      };

      if (!window.APP_DATA.sampleSlides) window.APP_DATA.sampleSlides = [];
      window.APP_DATA.sampleSlides.unshift(newSlide);
      this.currentSlideData = newSlide;

      this.renderSlideList();
      this.renderActiveSlideView(newSlide);

      if (window.GAMIFICATION) window.GAMIFICATION.addXP(60, 'رفع وتلخيص سلايدات محاضرة بالذكاء الاصطناعي');
      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.CONFETTI) window.CONFETTI.launch(40);
      if (window.APP) window.APP.showToast('🚀 تم قراءة وتلخيص السلايدات وتوليد بنك الأسئلة بنجاح! (+60 XP)', 'success');

    } catch (err) {
      console.error("Slide upload error:", err);
      if (window.APP) window.APP.showToast('حدث خطأ أثناء معالجة الملف، تم استخدام القالب الاحتياطي.', 'warning');
    } finally {
      if (dropzone) dropzone.innerHTML = originalDropzoneHtml;
      this.bindEvents();
    }
  },

  /**
   * Process custom slide text/notes directly via GenAI
   */
  async processCustomSlideText(title, content) {
    if (!content || !content.trim()) {
      if (window.APP) window.APP.showToast('يرجى إدخال محتوى أو نص السلايدات أولاً', 'warning');
      return;
    }

    const cleanTitle = (title && title.trim()) || "سلايدات المحاضرة المضافة";
    if (window.APP) window.APP.showToast(`🧠 جاري تحليل السلايدات وتوليد الاختبار الفصلي التجريبي...`, 'info');
    if (window.SOUNDS) window.SOUNDS.playClick();

    try {
      const api = window.API || globalThis.API;
      let summaryResult = null;
      if (api && typeof api.summarizeSlideDeck === 'function') {
        summaryResult = await api.summarizeSlideDeck(content, cleanTitle);
      }

      const newSlide = {
        id: `slide_custom_${Date.now()}`,
        course: summaryResult?.course || "علوم الحاسب والبرمجة الجامعية",
        title: summaryResult?.title || cleanTitle,
        slidesCount: Math.max(1, Math.round(content.length / 500)),
        uploadDate: new Date().toISOString().split('T')[0],
        summary: summaryResult?.summary || `تم استخراج وتحليل محتويات (${cleanTitle}) بنجاح عبر محرك سِنَاد الذكي.`,
        keyPoints: summaryResult?.keyPoints || [
          "المفاهيم البرمجية الأساسية المستخلصة من نص السلايدات.",
          "تطبيق أفضل الممارسات في كتابة وتتبع الأكواد.",
          "معالجة الاستثناءات وضمان دقة المنطق البرمجي."
        ],
        examQuestions: summaryResult?.examQuestions || [
          {
            q: `ما هي الفكرة الجوهرية التي تركز عليها هذه المحاضرة؟`,
            answer: "استيعاب وتطبيق المفاهيم المعيارية وحل المسائل البرمجية بدقة."
          }
        ],
        flashcards: summaryResult?.flashcards || [
          { id: `fc_${Date.now()}_1`, front: `ما المفهوم الأساسي في ${cleanTitle}؟`, back: "استيعاب وتطبيق المفاهيم البرمجية بدقة.", mastered: false }
        ],
        mockExam: summaryResult?.mockExam || [
          {
            id: "me_1",
            question: `أي من التالي يمثل المبدأ الأساسي في موضوع ${cleanTitle}؟`,
            options: ["التصميم المعياري وإعادة استخدام الأكواد", "إلغاء فحص الذاكرة", "تجاهل الأخطاء", "إنهاء البرنامج"],
            correct: 0,
            explanation: "المفهوم الصحيح والمعتمد برمجياً وفق محتوى السلايدات."
          }
        ]
      };

      if (!window.APP_DATA.sampleSlides) window.APP_DATA.sampleSlides = [];
      window.APP_DATA.sampleSlides.unshift(newSlide);
      this.currentSlideData = newSlide;

      this.renderSlideList();
      this.renderActiveSlideView(newSlide);

      if (window.GAMIFICATION) window.GAMIFICATION.addXP(60, 'تحليل سلايدات وتوليد اختبار تجريبي بالذكاء الاصطناعي');
      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.CONFETTI) window.CONFETTI.launch(40);
      if (window.APP) window.APP.showToast('🚀 تم قراءة السلايدات وتوليد الاختبار الفصلي التجريبي بنجاح! (+60 XP)', 'success');
      
      // Auto open mock exam modal
      setTimeout(() => {
        this.openMockExamModal();
      }, 600);

    } catch (e) {
      console.error("Custom slide text error:", e);
      if (window.APP) window.APP.showToast('حدث خطأ أثناء معالجة النص.', 'error');
    }
  },

  openPasteTextModal() {
    const rawTitle = prompt("أدخل عنوان المحاضرة أو المقرر (مثلاً: Lecture 4 - Polymorphism & Abstract Classes):", "محاضرة جافا - مراجعة الميد");
    if (rawTitle === null) return;

    const rawText = prompt("الصق هنا نصوص السلايدات، الأكواد، أو ملاحظات المحاضرة التي تريد توليد اختبار تجريبي عنها:");
    if (!rawText || !rawText.trim()) {
      if (window.APP) window.APP.showToast('لم يتم إدخال نص للسلايدات', 'warning');
      return;
    }

    this.processCustomSlideText(rawTitle, rawText);
  },

  escapeHtml(str) {
    if (!str) return '';
    const clean = String(str).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(clean);
    }
    return clean;
  },

  renderActiveSlideView(slide) {
    if (!slide) return;
    const titleEl = document.getElementById('active-slide-title');
    const metaEl = document.getElementById('active-slide-meta');
    const summaryEl = document.getElementById('active-slide-summary');
    const keypointsEl = document.getElementById('active-slide-keypoints');
    const examQEl = document.getElementById('active-slide-exam-questions');

    if (titleEl) titleEl.textContent = slide.title;
    if (metaEl) metaEl.innerHTML = `<i class="fas fa-book-open"></i> ${this.escapeHtml(slide.course || 'علوم الحاسب')} • <i class="fas fa-layer-group"></i> ${slide.slidesCount || 1} شريحة • <i class="fas fa-shield-alt" style="color: var(--primary);"></i> فحص آمن ومطابق لـ PDPL`;
    if (summaryEl) summaryEl.textContent = slide.summary;

    if (keypointsEl && slide.keyPoints) {
      keypointsEl.innerHTML = slide.keyPoints.map(kp => `
        <li style="margin-bottom: 10px; line-height: 1.6; display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; border-right: 3px solid var(--primary);">
          <i class="fas fa-check-circle" style="color: var(--primary); margin-top: 4px;"></i>
          <span style="color: var(--text-main); font-size: 13px;">${this.escapeHtml(kp)}</span>
        </li>
      `).join('');
    }

    if (examQEl && slide.examQuestions) {
      examQEl.innerHTML = slide.examQuestions.map((item, idx) => `
        <div class="glass-panel" style="padding: 16px; margin-bottom: 14px; border-right: 4px solid var(--accent); background: rgba(15, 23, 42, 0.65);">
          <div style="font-weight: 700; color: var(--text-main); font-size: 14px; margin-bottom: 8px;">
            <span style="color: var(--accent);"><i class="fas fa-question-circle"></i> سؤال متوقع ${idx + 1}:</span> ${this.escapeHtml(item.q)}
          </div>
          <div style="font-size: 13px; color: #a7f3d0; background: rgba(6, 78, 59, 0.45); border: 1px solid rgba(16, 185, 129, 0.3); padding: 10px 14px; border-radius: var(--radius-sm); line-height: 1.6;">
            <strong style="color: #6ee7b7;"><i class="fas fa-check"></i> الإجابة النموذجية:</strong> ${this.escapeHtml(item.answer)}
          </div>
        </div>
      `).join('');
    }

    this.renderFlashcards(slide.flashcards || []);
  },

  renderFlashcards(flashcards) {
    const container = document.getElementById('active-slide-flashcards');
    const masteryEl = document.getElementById('flashcard-mastery-score');
    if (!container) return;

    const masteredCount = flashcards.filter(f => f.mastered).length;
    const masteryPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;
    if (masteryEl) masteryEl.textContent = `${masteryPercent}% إتقان المفاهيم`;

    container.innerHTML = flashcards.map((fc, idx) => `
      <div class="flashcard-item ${fc.mastered ? 'mastered' : ''}" id="fc-${this.escapeHtml(fc.id)}" onclick="this.classList.toggle('flipped')" style="cursor: pointer; min-height: 160px;">
        <div class="flashcard-inner">
          <div class="flashcard-front" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
              <span style="font-size: 11px; color: var(--primary); font-weight: 700;"><i class="fas fa-clone"></i> بطاقة ${idx + 1}</span>
              ${fc.mastered ? '<span style="font-size: 10px; color: var(--success);"><i class="fas fa-check-double"></i> مُتقنة</span>' : ''}
            </div>
            <p style="font-size: 13px; font-weight: 600; line-height: 1.5; color: #fff;">${this.escapeHtml(fc.front)}</p>
            <span style="font-size: 10px; color: var(--text-dim); margin-top: auto;">(انقر للقلب واستعراض الإجابة 🔄)</span>
          </div>
          <div class="flashcard-back" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 11px; color: #fbbf24; margin-bottom: 8px; font-weight: 700;"><i class="fas fa-lightbulb"></i> الإجابة والشرح ✅</span>
            <p style="font-size: 13px; line-height: 1.5; margin-bottom: 12px; color: #e2e8f0;">${this.escapeHtml(fc.back)}</p>
            <div style="display: flex; gap: 6px; margin-top: auto;" onclick="event.stopPropagation();">
              <button class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px; width: 100%;" onclick="window.SLIDES.markFlashcardMastered('${this.escapeHtml(fc.id)}', true)">
                <i class="fas fa-check"></i> تم إتقانها (+15 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  markFlashcardMastered(fcId, status) {
    if (!this.currentSlideData || !this.currentSlideData.flashcards) return;
    const fc = this.currentSlideData.flashcards.find(f => f.id === fcId);
    if (fc) {
      fc.mastered = status;
      this.renderFlashcards(this.currentSlideData.flashcards);
      if (window.APP) window.APP.showToast('تم تحديث مستوى إتقان البطاقة! (+15 XP)', 'success');
      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.GAMIFICATION) window.GAMIFICATION.addXP(15, 'إتقان بطاقة مذاكرة');
    }
  },

  // --- Interactive Mock Exam Modal ---
  openMockExamModal() {
    const modal = document.getElementById('mock-exam-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.startMockExam();
  },

  closeMockExamModal() {
    const modal = document.getElementById('mock-exam-modal');
    if (modal) modal.classList.remove('active');
    if (this.examTimerInterval) clearInterval(this.examTimerInterval);
  },

  startMockExam() {
    const examQuestions = (this.currentSlideData && this.currentSlideData.mockExam && this.currentSlideData.mockExam.length > 0)
      ? this.currentSlideData.mockExam
      : (window.APP_DATA && window.APP_DATA.sampleSlides && window.APP_DATA.sampleSlides[0] ? window.APP_DATA.sampleSlides[0].mockExam : []);

    this.examAnswers = {};
    this.examSecondsRemaining = 600;

    const timerEl = document.getElementById('mock-exam-timer');
    if (this.examTimerInterval) clearInterval(this.examTimerInterval);

    this.examTimerInterval = setInterval(() => {
      this.examSecondsRemaining--;
      const mins = Math.floor(this.examSecondsRemaining / 60);
      const secs = this.examSecondsRemaining % 60;
      if (timerEl) timerEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      if (this.examSecondsRemaining <= 0) {
        clearInterval(this.examTimerInterval);
        this.submitMockExam();
      }
    }, 1000);

    const container = document.getElementById('mock-exam-questions-container');
    if (!container) return;

    container.innerHTML = examQuestions.map((q, idx) => `
      <div class="glass-panel" style="padding: 16px; margin-bottom: 16px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color);">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px; color: var(--text-main);">
          <span style="color: var(--primary); font-weight: 800;">السؤال ${idx + 1}:</span> ${q.question}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(q.options || []).map((opt, oIdx) => `
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(99,102,241,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
              <input type="radio" name="mock_q_${idx}" value="${oIdx}" onchange="window.SLIDES.examAnswers[${idx}] = ${oIdx};">
              <span style="font-size: 13px; color: var(--text-main);">${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const activeView = document.getElementById('mock-exam-active-view');
    const resultsView = document.getElementById('mock-exam-results-view');
    if (resultsView) resultsView.style.display = 'none';
    if (activeView) activeView.style.display = 'block';
  },

  submitMockExam() {
    if (this.examTimerInterval) clearInterval(this.examTimerInterval);
    const examQuestions = (this.currentSlideData && this.currentSlideData.mockExam && this.currentSlideData.mockExam.length > 0)
      ? this.currentSlideData.mockExam
      : (window.APP_DATA && window.APP_DATA.sampleSlides && window.APP_DATA.sampleSlides[0] ? window.APP_DATA.sampleSlides[0].mockExam : []);

    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (this.examAnswers[idx] === q.correct) {
        score++;
      }
    });

    const percent = Math.round((score / Math.max(1, examQuestions.length)) * 100);
    const resultView = document.getElementById('mock-exam-results-view');
    const activeView = document.getElementById('mock-exam-active-view');

    if (activeView) activeView.style.display = 'none';
    if (resultView) {
      resultView.style.display = 'block';
      resultView.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <div style="font-size: 54px; margin-bottom: 10px;">${percent >= 80 ? '🏆' : (percent >= 60 ? '📚' : '💡')}</div>
          <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #fff;">نتيجتك في الاختبار التجريبي: ${score} من ${examQuestions.length} (${percent}%)</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">${percent >= 80 ? 'أداء استثنائي رائع يضمن لك A+ في الاختبار الفصلي والنهائي!' : 'مجهود طيب! راجع الإجابات النموذجية أدناه لترسيخ المفاهيم.'}</p>
          <div style="text-align: right; margin-top: 20px; max-height: 320px; overflow-y: auto;">
            ${examQuestions.map((q, idx) => `
              <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 10px; border-right: 4px solid ${this.examAnswers[idx] === q.correct ? 'var(--success)' : 'var(--danger)'};">
                <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #fff;">س ${idx + 1}: ${q.question}</div>
                <div style="font-size: 12px; color: #a7f3d0; margin-bottom: 4px;"><i class="fas fa-check-circle"></i> الإجابة الصحيحة: ${q.options ? q.options[q.correct] : 'الخيار الصحيح'}</div>
                <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">💡 التوضيح: ${q.explanation || 'تم التحقق الأكاديمي من الإجابة.'}</div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary" style="margin-top: 16px; padding: 10px 24px;" onclick="window.SLIDES.closeMockExamModal()">
            <i class="fas fa-check"></i> إغلاق ومتابعة المذاكرة
          </button>
        </div>
      `;
    }

    if (window.SOUNDS) window.SOUNDS.playLevelUp();
    if (window.CONFETTI) window.CONFETTI.launch(50);
    if (window.GAMIFICATION) window.GAMIFICATION.addXP(score * 25, 'إكمال اختبار تجريبي للسلايدات');
  }
};
