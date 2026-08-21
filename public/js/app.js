/**
 * Main Application Router & Orchestrator
 * Controls navigation, themes, toasts & lifecycle initialization.
 */

window.APP = {
  currentView: 'dashboard',
  currentTheme: 'dark',

  init() {
    this.initTheme();
    this.bindNavigation();
    
    // Initialize Submodules
    if (window.AUTH) window.AUTH.init();
    if (window.ANALYZER) {
      window.ANALYZER.init();
      if (typeof window.ANALYZER.initMultiFile === 'function') window.ANALYZER.initMultiFile();
    }
    if (window.EXAMS) window.EXAMS.init();
    if (window.CHALLENGES) window.CHALLENGES.init();
    if (window.SLIDES) window.SLIDES.init();
    if (window.OCR) window.OCR.init();
    if (window.CHAT) window.CHAT.init();
    if (window.TRACKER) window.TRACKER.init();
    if (window.GAMIFICATION) window.GAMIFICATION.init();
    if (window.SECURITY) window.SECURITY.init();

    this.renderDashboard();
    console.log("[✓] Smart Java University Tutor initialized successfully.");
  },

  initTheme() {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      themeBtn.title = theme === 'dark' ? 'التحويل للوضع النهاري (Light Mode)' : 'التحويل للوضع الليلي (Dark Mode)';
    }
  },

  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
    this.showToast(`تم التبديل إلى ${this.currentTheme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}`, 'info');
  },

  toggleSidebar(forceState) {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtn = document.getElementById('mobile-menu-toggle');

    const isOpen = sidebar ? sidebar.classList.contains('open') : false;
    const targetState = typeof forceState === 'boolean' ? forceState : !isOpen;

    if (sidebar) {
      sidebar.classList.toggle('open', targetState);
    }
    if (backdrop) {
      backdrop.classList.toggle('open', targetState);
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = targetState ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
  },

  bindNavigation() {
    const navItems = document.querySelectorAll('[data-view-target]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });

    // Close sidebar on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleSidebar(false);
      }
    });

    // Close sidebar on window resize if expanded to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        this.toggleSidebar(false);
      }
    });
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Auto-close sidebar on mobile/tablet upon navigation
    if (window.innerWidth <= 1024) {
      this.toggleSidebar(false);
    }

    // Update Nav Sidebar links
    document.querySelectorAll('.nav-item').forEach(item => {
      const target = item.getAttribute('data-view-target');
      item.classList.toggle('active', target === viewName);
    });

    // Update View Sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewName === 'analyzer' && window.ANALYZER) {
      window.ANALYZER.updateLineNumbers();
    }
    if (viewName === 'chat' && window.CHAT) {
      window.CHAT.renderMessages();
      const chatInput = document.getElementById('chat-user-input');
      if (chatInput) setTimeout(() => chatInput.focus(), 150);
    }
    if (viewName === 'challenges' && window.CHALLENGES) {
      window.CHALLENGES.init();
    }
  },

  renderDashboard() {
    // Populate recent activities and quick action triggers
    const sampleCards = document.getElementById('dash-sample-codes');
    if (sampleCards && window.APP_DATA) {
      sampleCards.innerHTML = window.APP_DATA.sampleCodes.slice(0, 3).map((sample, idx) => `
        <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; cursor: pointer; transition: var(--transition);" onclick="window.APP.switchView('analyzer'); window.ANALYZER.loadSample(${idx});">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; padding: 2px 8px; background: rgba(16, 185, 129, 0.15); color: var(--primary); border-radius: var(--radius-full); font-weight: 700;">
              ${sample.topic}
            </span>
            <i class="fas fa-arrow-left" style="color: var(--primary); font-size: 12px;"></i>
          </div>
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: var(--text-main);">
            ${sample.title}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-code); direction: ltr; text-align: left;">
            ${sample.code.split('\n')[0]}...
          </div>
        </div>
      `).join('');
    }
    this.updateDashboardStats();
  },

  updateDashboardStats() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || {};
    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';

    // 1. GPA
    const gpaStatEl = document.getElementById('dash-gpa-stat');
    if (gpaStatEl) {
      const gpa = typeof student.gpa === 'number' ? student.gpa : 0.00;
      const scale = student.gpaScale || 5.00;
      gpaStatEl.textContent = `${gpa.toFixed(2)} / ${scale.toFixed(2)}`;
    }

    // 2. Courses Count
    const coursesStatEl = document.getElementById('dash-courses-count');
    if (coursesStatEl && window.TRACKER) {
      const count = (window.TRACKER.courses && window.TRACKER.courses.length) || 0;
      coursesStatEl.textContent = `${count} مقرر${count > 2 && count < 11 ? 'ات' : ''}`;
    }

    // 3. Codes analyzed
    const codesStatEl = document.getElementById('dash-codes-count');
    if (codesStatEl) {
      const count = parseInt(localStorage.getItem(`senad_codes_analyzed_${emailKey}`)) || (student.studentId === "441019284" ? 34 : 0);
      codesStatEl.textContent = `${count} كود`;
    }

    // 4. XP
    const xpStatEl = document.getElementById('dash-xp-stat');
    if (xpStatEl && window.GAMIFICATION) {
      xpStatEl.textContent = `${window.GAMIFICATION.xp} XP`;
    }
  },

  recordCodeActivity() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || {};
    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';
    let current = parseInt(localStorage.getItem(`senad_codes_analyzed_${emailKey}`)) || (student.studentId === "441019284" ? 34 : 0);
    current++;
    localStorage.setItem(`senad_codes_analyzed_${emailKey}`, String(current));
    this.updateDashboardStats();
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'danger') icon = 'times-circle';

    const safeMessage = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(message) : this.escapeHtml(message);

    toast.innerHTML = `
      <i class="fas fa-${icon}" style="font-size: 16px;"></i>
      <span>${safeMessage}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // --- Command Palette (Ctrl + K / Quick Action Launcher) ---
  initCommandPalette() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
      } else if (e.key === 'Escape') {
        this.closeCommandPalette();
      }
    });

    const input = document.getElementById('command-search-input');
    if (input) {
      input.addEventListener('input', () => {
        this.renderCommandResults(input.value.trim());
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (this.currentCommandItems && this.currentCommandItems.length > 0) {
            this.executeCommand(this.currentCommandItems[0].id);
          }
        }
      });
    }
  },

  toggleCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;
    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
      modal.classList.remove('hidden');
      const input = document.getElementById('command-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.renderCommandResults('');
    } else {
      modal.classList.add('hidden');
    }
  },

  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-search-input');
    if (!modal) return;
    modal.classList.remove('hidden');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.renderCommandResults('');
  },

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.add('hidden');
  },

  renderCommandResults(query) {
    const container = document.getElementById('command-palette-results');
    if (!container) return;

    const commands = [
      { id: 'view_analyzer', title: 'الانتقال إلى محرر ومحلل الأكواد (Java Workspace)', group: 'التنقل الرئيسي', icon: 'fas fa-code', action: () => this.switchView('analyzer') },
      { id: 'view_slides', title: 'الانتقال إلى ملخص السلايدات وبنك الأسئلة', group: 'التنقل الرئيسي', icon: 'fas fa-file-pdf', action: () => this.switchView('slides') },
      { id: 'view_chat', title: 'فتح مساعد سِنَاد الذكي للشات والاستفسارات', group: 'التنقل الرئيسي', icon: 'fas fa-comments', action: () => this.switchView('chat') },
      { id: 'view_ocr', title: 'التعرف على كود من صورة (OCR Scanner)', group: 'التنقل الرئيسي', icon: 'fas fa-camera', action: () => this.switchView('ocr') },
      { id: 'view_challenges', title: 'تحديات البرمجة اليومية ولوحة الشرف', group: 'التنقل الرئيسي', icon: 'fas fa-trophy', action: () => this.switchView('challenges') },
      { id: 'view_tracker', title: 'تتبع الخطة الدراسية وإنجاز المقررات', group: 'التنقل الرئيسي', icon: 'fas fa-graduation-cap', action: () => this.switchView('tracker') },
      { id: 'view_security', title: 'مركز الأمان وحماية البيانات وتشفير PDPL', group: 'التنقل الرئيسي', icon: 'fas fa-shield-alt', action: () => this.switchView('security') },
      { id: 'action_run', title: 'تشغيل الكود في بيئة Java 24 Sandbox', group: 'إجراءات سريعة', icon: 'fas fa-play', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.runCode(); } },
      { id: 'action_analyze', title: 'تحليل المفاهيم واكتشاف الأخطاء بالكود', group: 'إجراءات سريعة', icon: 'fas fa-brain', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.analyzeCode(); } },
      { id: 'action_uml', title: 'توليد مخطط الوراثة والكلاسات (UML Diagram)', group: 'إجراءات سريعة', icon: 'fas fa-project-diagram', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.openUMLModal(); } },
      { id: 'action_theme', title: 'تبديل المظهر (الوضع الليلي / النهاري)', group: 'الإعدادات', icon: 'fas fa-circle-half-stroke', action: () => this.toggleTheme() }
    ];

    const q = (query || '').toLowerCase().trim();
    const filtered = q ? commands.filter(c => c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)) : commands;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748b;">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px;"></i>
          <p style="font-size: 13px;">لم يتم العثور على نتائج مطابقة لـ "${this.escapeHtml(query)}"</p>
        </div>
      `;
      return;
    }

    // Group items
    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });

    let html = '';
    for (const [groupName, items] of Object.entries(groups)) {
      html += `<div class="command-group-title">${groupName}</div>`;
      items.forEach(item => {
        html += `
          <div class="command-item" onclick="window.APP.executeCommand('${item.id}')">
            <div class="command-item-left">
              <div class="command-item-icon"><i class="${item.icon}"></i></div>
              <div style="font-weight: 600;">${item.title}</div>
            </div>
            <i class="fas fa-chevron-left" style="font-size: 11px; color: #64748b;"></i>
          </div>
        `;
      });
    }

    container.innerHTML = html;
    this.currentCommandItems = filtered;
  },

  executeCommand(commandId) {
    this.closeCommandPalette();
    const commands = [
      { id: 'view_analyzer', action: () => this.switchView('analyzer') },
      { id: 'view_slides', action: () => this.switchView('slides') },
      { id: 'view_chat', action: () => this.switchView('chat') },
      { id: 'view_ocr', action: () => this.switchView('ocr') },
      { id: 'view_challenges', action: () => this.switchView('challenges') },
      { id: 'view_tracker', action: () => this.switchView('tracker') },
      { id: 'view_security', action: () => this.switchView('security') },
      { id: 'action_run', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.runCode(); } },
      { id: 'action_analyze', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.analyzeCode(); } },
      { id: 'action_uml', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.openUMLModal(); } },
      { id: 'action_theme', action: () => this.toggleTheme() }
    ];

    const target = commands.find(c => c.id === commandId);
    if (target && typeof target.action === 'function') {
      target.action();
    }
  }
};

// Auto boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.APP.init();
  window.APP.initCommandPalette();
});
