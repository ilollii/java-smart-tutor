/**
 * Gamification & Motivation Module
 * User-isolated XP, Levels, Daily Study Streak & Achievement Badges.
 */

window.GAMIFICATION = {
  xp: 50,
  level: 1,
  streak: 1,
  badges: [],

  getStorageKey() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || {};
    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';
    return `senad_gamification_${emailKey}`;
  },

  init() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || (window.APP_DATA && window.APP_DATA.profiles && window.APP_DATA.profiles.imsiu_cs) || {};
    const storageKey = this.getStorageKey();
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.xp = typeof parsed.xp === 'number' ? parsed.xp : 50;
        this.level = typeof parsed.level === 'number' ? parsed.level : 1;
        this.streak = typeof parsed.streak === 'number' ? parsed.streak : 1;
        this.badges = Array.isArray(parsed.badges) && parsed.badges.length > 0 ? parsed.badges : this.getDefaultBadges(student);
      } catch (e) {
        this.loadFromStudent(student);
      }
    } else {
      this.loadFromStudent(student);
    }

    this.updateUI();
    this.renderBadgesGrid();
  },

  loadFromStudent(student) {
    this.xp = typeof student.xp === 'number' ? student.xp : 50;
    this.level = typeof student.levelNumber === 'number' ? student.levelNumber : (Math.floor(this.xp / 500) + 1);
    this.streak = typeof student.streakDays === 'number' ? student.streakDays : 1;
    this.badges = (student.badges && student.badges.length > 0) ? [...student.badges] : this.getDefaultBadges(student);
    this.saveState();
  },

  getDefaultBadges(student) {
    return [
      { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "بدأت رحلة التعلم في منصة سِنَاد", unlocked: true },
      { id: "security_sentinel", name: "حارس الخصوصية PDPL", icon: "🛡️", desc: "فعلت التحقق الثنائي والمصادقة الموحدة", unlocked: true },
      { id: "oop_master", name: "مهندس الكائنات OOP", icon: "🏛️", desc: "أتقنت مفاهيم الوراثة والبوليمورفيزم", unlocked: false },
      { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في كويزات الأكواد", unlocked: false },
      { id: "slide_guru", name: "قاهر السلايدات", icon: "📚", desc: "لخصت محاضرات جامعية كاملة", unlocked: false },
      { id: "tracker_scholar", name: "العالم الأكاديمي", icon: "🎓", desc: "أضفت موادك وحسبت خطة المعدل الفصلي والتراكمي", unlocked: false }
    ];
  },

  saveState() {
    try {
      const payload = {
        xp: this.xp,
        level: this.level,
        streak: this.streak,
        badges: this.badges
      };
      localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));
      
      const student = (window.AUTH && window.AUTH.currentUser) || {};
      if (student.email) {
        student.xp = this.xp;
        student.levelNumber = this.level;
        student.streakDays = this.streak;
        student.badges = this.badges;
        localStorage.setItem('senad_universal_user_session', JSON.stringify(student));
      }
    } catch (e) {}
  },

  addXP(amount, reason = "") {
    this.xp += amount;
    
    // Check level up (e.g. 500 XP per level)
    const newLevel = Math.floor(this.xp / 500) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      if (window.APP) window.APP.showToast(`🎉 مبروك! ارتقيت إلى المستوى ${this.level} في متقن جافا!`, 'success');
      if (window.SOUNDS) window.SOUNDS.playLevelUp();
      if (window.CONFETTI) window.CONFETTI.launch(60);
    }

    this.saveState();
    this.updateUI();
  },

  unlockBadge(badgeId, reason = "") {
    const target = this.badges.find(b => b.id === badgeId);
    if (target && !target.unlocked) {
      target.unlocked = true;
      this.addXP(50, `فتح وسام: ${target.name}`);
      this.saveState();
      this.renderBadgesGrid();
      if (window.APP) window.APP.showToast(`🎖️ تم فتح وسام جديد: [${target.name}]! (+50 XP)`, 'success');
      if (window.SOUNDS) window.SOUNDS.playSuccess();
      if (window.CONFETTI) window.CONFETTI.launch(40);
    }
  },

  updateUI() {
    const xpElements = document.querySelectorAll('.user-xp-val');
    const levelElements = document.querySelectorAll('.user-level-val');
    const streakElements = document.querySelectorAll('.user-streak-val');
    const progressFill = document.getElementById('sidebar-xp-fill');
    const currentXpText = document.getElementById('sidebar-current-xp');
    const nextXpText = document.getElementById('sidebar-next-xp');

    xpElements.forEach(el => el.textContent = `${this.xp} XP`);
    levelElements.forEach(el => el.textContent = `المستوى ${this.level}`);
    streakElements.forEach(el => el.textContent = `${this.streak} يوم 🔥`);

    const xpInCurrentLevel = this.xp % 500;
    const progressPercent = (xpInCurrentLevel / 500) * 100;

    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (currentXpText) currentXpText.textContent = `${this.xp} XP`;
    if (nextXpText) nextXpText.textContent = `${this.level * 500} XP`;

    // Also update dashboard XP stat
    const dashXp = document.getElementById('dash-xp-stat');
    if (dashXp) dashXp.textContent = `${this.xp} XP`;
  },

  renderBadgesGrid() {
    const container = document.getElementById('badges-grid-container');
    if (!container) return;

    container.innerHTML = this.badges.map(b => `
      <div class="glass-panel" style="padding: 20px; text-align: center; border-color: ${b.unlocked ? 'var(--primary-glow)' : 'var(--border-color)'}; position: relative; overflow: hidden;">
        ${b.unlocked ? `<span style="position: absolute; top: 10px; left: 10px; font-size: 10px; padding: 2px 6px; background: rgba(16, 185, 129, 0.2); color: var(--primary); border-radius: 4px; font-weight: 700;">مكتمل ✅</span>` : '<span style="position: absolute; top: 10px; left: 10px; font-size: 10px; padding: 2px 6px; background: rgba(255,255,255,0.06); color: var(--text-dim); border-radius: 4px;">قيد الإنجاز 🔒</span>'}
        <div style="font-size: 42px; margin-bottom: 10px; filter: ${b.unlocked ? 'none' : 'grayscale(1) opacity(0.4)'};">
          ${b.icon}
        </div>
        <div style="font-size: 15px; font-weight: 800; color: ${b.unlocked ? 'var(--text-main)' : 'var(--text-muted)'}; margin-bottom: 6px;">
          ${b.name}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          ${b.desc}
        </div>
      </div>
    `).join('');
  }
};
