/**
 * Gamification & Motivation Module
 * XP, Levels, Daily Study Streak & Achievement Badges.
 */

window.GAMIFICATION = {
  xp: 2850,
  level: 7,
  streak: 12,
  badges: [],

  init() {
    this.badges = [...window.APP_DATA.student.badges];
    this.xp = window.APP_DATA.student.xp;
    this.level = window.APP_DATA.student.levelNumber;
    this.streak = window.APP_DATA.student.streakDays;
    this.updateUI();
    this.renderBadgesGrid();
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

    this.updateUI();
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
  },

  renderBadgesGrid() {
    const container = document.getElementById('badges-grid-container');
    if (!container) return;

    container.innerHTML = this.badges.map(b => `
      <div class="glass-panel" style="padding: 20px; text-align: center; border-color: ${b.unlocked ? 'var(--primary-glow)' : 'var(--border-color)'}; position: relative; overflow: hidden;">
        ${b.unlocked ? `<span style="position: absolute; top: 10px; left: 10px; font-size: 10px; padding: 2px 6px; background: rgba(16, 185, 129, 0.2); color: var(--primary); border-radius: 4px; font-weight: 700;">مكتمل ✅</span>` : ''}
        <div style="font-size: 42px; margin-bottom: 10px; filter: ${b.unlocked ? 'none' : 'grayscale(1)'};">
          ${b.icon}
        </div>
        <div style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
          ${b.name}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          ${b.desc}
        </div>
      </div>
    `).join('');
  }
};
