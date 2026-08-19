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

  bindNavigation() {
    const navItems = document.querySelectorAll('[data-view-target]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });
  },

  switchView(viewName) {
    this.currentView = viewName;

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

    toast.innerHTML = `
      <i class="fas fa-${icon}" style="font-size: 16px;"></i>
      <span>${message}</span>
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
          const firstItem = document.querySelector('.command-item');
          if (firstItem) firstItem.click();
        }
      });
    }
  },

  toggleCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
      this.closeCommandPalette();
    } else {
      this.openCommandPalette();
    }
  },

  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-search-input');
    if (!modal) return;
    modal.classList.add('active');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.renderCommandResults('');
  },

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.remove('active');
  },

  renderCommandResults(query) {
    const container = document.getElementById('command-results-container');
    if (!container) return;

    const commands = [
      { id: 'view_analyzer', title: 'محلل أكواد جافا (Java 24 Sandbox)', group: 'التنقل السريع', icon: 'fas fa-code', action: () => this.switchView('analyzer') },
      { id: 'view_slides', title: 'مساعد السلايدات والاختبار الفصلي (Mock Exam)', group: 'التنقل السريع', icon: 'fas fa-file-powerpoint', action: () => this.switchView('slides') },
      { id: 'view_chat', title: 'المعلم البرمجي الذكي (سِنَاد AI Copilot)', group: 'التنقل السريع', icon: 'fas fa-robot', action: () => this.switchView('chat') },
      { id: 'view_ocr', title: 'القارئ البصري الذكي OCR للأكواد', group: 'التنقل السريع', icon: 'fas fa-camera', action: () => this.switchView('ocr') },
      { id: 'view_challenges', title: 'تحديات جافا اليومية ولوحة الشرف', group: 'التنقل السريع', icon: 'fas fa-trophy', action: () => this.switchView('challenges') },
      { id: 'view_tracker', title: 'حاسبة ومخطط المعدل التراكمي GPA', group: 'التنقل السريع', icon: 'fas fa-calculator', action: () => this.switchView('tracker') },
      { id: 'view_security', title: 'مركز الأمان والامتثال لنظام PDPL', group: 'التنقل السريع', icon: 'fas fa-shield-alt', action: () => this.switchView('security') },
      { id: 'action_run', title: 'تشغيل الكود الحالي في الساندبوكس (Run Code)', group: 'إجراءات فورية', icon: 'fas fa-play', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.runCode(); } },
      { id: 'action_analyze', title: 'تحليل الكود سطر بسطر (AI Line Breakdown)', group: 'إجراءات فورية', icon: 'fas fa-microchip', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.analyzeCode(); } },
      { id: 'action_uml', title: 'توليد مخطط الكلاسات الذكي UML Diagram', group: 'إجراءات فورية', icon: 'fas fa-sitemap', action: () => { this.switchView('analyzer'); if (window.ANALYZER) window.ANALYZER.openUMLModal(); } },
      { id: 'action_theme', title: 'تبديل المظهر (الوضع الليلي / النهاري)', group: 'الإعدادات', icon: 'fas fa-circle-half-stroke', action: () => this.toggleTheme() }
    ];

    const q = (query || '').toLowerCase().trim();
    const filtered = q ? commands.filter(c => c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)) : commands;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748b;">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px;"></i>
          <p style="font-size: 13px;">لم يتم العثور على نتائج مطابقة لـ "${query}"</p>
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
