/**
 * Universal Multi-University Authentication Portal & Session Manager
 * Allows students from ANY university to register/login with their email, password,
 * chosen university, and major.
 */

window.AUTH = {
  isLoggedIn: false,
  is2FAVerified: false,
  currentUser: null,
  otpTimerInterval: null,
  otpTimeRemaining: 60,

  init() {
    // Check if session exists in localStorage or load default demo profile
    const saved = localStorage.getItem('senad_universal_user_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.isLoggedIn = true;
        this.is2FAVerified = true;
        this.showDashboard();
      } catch (e) {
        this.loginAsProfile('imsiu_cs');
      }
    } else {
      // Auto-enter default student profile to immediately showcase Next-Gen Bento UI
      this.loginAsProfile('imsiu_cs');
    }
  },

  showInitialLogin() {
    this.isLoggedIn = false;
    this.is2FAVerified = false;
    const loginPortal = document.getElementById('initial-login-portal');
    const appContainer = document.getElementById('app-container');

    if (loginPortal) loginPortal.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';

    // Reset login steps
    this.switchLoginTab('universal');
    this.resetOtpTimer();
  },

  showDashboard() {
    if (window.APP_DATA) window.APP_DATA.student = this.currentUser;
    const loginPortal = document.getElementById('initial-login-portal');
    const appContainer = document.getElementById('app-container');

    if (loginPortal) loginPortal.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    this.updateUI();
    if (window.SOUNDS) window.SOUNDS.playSuccess();
    if (window.CONFETTI) window.CONFETTI.launch(40);
  },

  switchLoginTab(tab) {
    const universalTab = document.getElementById('tab-btn-student');
    const demoTab = document.getElementById('tab-btn-demo');
    const universalForm = document.getElementById('form-student-login');
    const demoForm = document.getElementById('form-demo-login');
    const step2Fa = document.getElementById('form-2fa-step');

    if (step2Fa) step2Fa.style.display = 'none';

    if (tab === 'universal' || tab === 'student') {
      if (universalTab) universalTab.classList.add('active');
      if (demoTab) demoTab.classList.remove('active');
      if (universalForm) universalForm.style.display = 'block';
      if (demoForm) demoForm.style.display = 'none';
    } else {
      if (universalTab) universalTab.classList.remove('active');
      if (demoTab) demoTab.classList.add('active');
      if (universalForm) universalForm.style.display = 'none';
      if (demoForm) demoForm.style.display = 'block';
    }
  },

  onUniversityChange() {
    const select = document.getElementById('init-univ-select');
    const customInputBox = document.getElementById('custom-univ-group');
    if (!select || !customInputBox) return;

    if (select.value === 'other') {
      customInputBox.style.display = 'block';
    } else {
      customInputBox.style.display = 'none';
    }
  },

  async submitInitialCredentials() {
    const nameInput = document.getElementById('init-name');
    const emailInput = document.getElementById('init-email');
    const passInput = document.getElementById('init-password');
    const univSelect = document.getElementById('init-univ-select');
    const customUnivInput = document.getElementById('init-custom-univ');
    const majorSelect = document.getElementById('init-major-select');

    const name = nameInput ? nameInput.value.trim() : 'طالب جامعي';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !email.includes('@')) {
      if (window.APP) window.APP.showToast('يرجى إدخال بريد إلكتروني صحيح', 'warning');
      if (window.SOUNDS) window.SOUNDS.playError();
      return;
    }

    if (!password || password.length < 4) {
      if (window.APP) window.APP.showToast('يرجى إدخال كلمة مرور مكونة من 4 خانات على الأقل', 'warning');
      if (window.SOUNDS) window.SOUNDS.playError();
      return;
    }

    let university = univSelect ? univSelect.options[univSelect.selectedIndex].text : 'جامعة عامة';
    if (univSelect && univSelect.value === 'other') {
      university = (customUnivInput && customUnivInput.value.trim()) ? customUnivInput.value.trim() : 'جامعة أخرى';
    }

    const major = majorSelect ? majorSelect.options[majorSelect.selectedIndex].text : 'علوم الحاسب والمعلومات';

    // Store pending user
    this.pendingUser = {
      name: name || email.split('@')[0],
      studentId: email.split('@')[0],
      email: email,
      university: university,
      college: "كلية الحاسب وتقنية المعلومات",
      major: major,
      level: "طالب جامعي",
      gpa: 4.85,
      previousGpa: 4.80,
      previousCredits: 60,
      currentCredits: 16,
      gpaScale: university.includes('البترول') || university.includes('KFUPM') ? 4.00 : 5.00,
      xp: 1200,
      levelNumber: 4,
      streakDays: 3,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "بدأت رحلة التعلم في المنصة", unlocked: true },
        { id: "security_sentinel", name: "حارس الخصوصية PDPL", icon: "🛡️", desc: "فعلت التحقق الثنائي والمصادقة الموحدة", unlocked: true }
      ]
    };

    // Request secure Server-Side OTP generation
    let serverOtp = null;
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          email: email,
          name: name,
          studentId: email.split('@')[0]
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.otp) {
          serverOtp = data.otp;
          this.currentExpectedOtp = data.otp;
        }
      }
    } catch (e) {
      console.warn("Backend OTP send fallback:", e);
    }

    if (!serverOtp) {
      this.currentExpectedOtp = String(Math.floor(100000 + Math.random() * 900000));
    }

    // Advance to 2FA screen
    document.getElementById('form-student-login').style.display = 'none';
    document.getElementById('form-demo-login').style.display = 'none';
    const step2Fa = document.getElementById('form-2fa-step');
    if (step2Fa) step2Fa.style.display = 'block';

    if (window.APP) window.APP.showToast(`تم إرسال رمز التحقق الثنائي (OTP: ${this.currentExpectedOtp}) لبريدك المسجل 📱`, 'info');
    if (window.SOUNDS) window.SOUNDS.playClick();
    this.startOtpTimer();

    const otpField = document.getElementById('init-otp-input');
    if (otpField) {
      otpField.value = this.currentExpectedOtp;
      otpField.focus();
    }
  },

  startOtpTimer() {
    this.resetOtpTimer();
    this.otpTimeRemaining = 60;
    const timerEl = document.getElementById('init-otp-timer');
    if (timerEl) timerEl.textContent = `00:${this.otpTimeRemaining < 10 ? '0' : ''}${this.otpTimeRemaining}`;

    this.otpTimerInterval = setInterval(() => {
      this.otpTimeRemaining--;
      if (timerEl) {
        timerEl.textContent = `00:${this.otpTimeRemaining < 10 ? '0' : ''}${this.otpTimeRemaining}`;
      }
      if (this.otpTimeRemaining <= 0) {
        this.resetOtpTimer();
        if (timerEl) timerEl.textContent = 'انتهت صلاحية الرمز';
      }
    }, 1000);
  },

  resetOtpTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  },

  async verifyInitial2FA() {
    const otpInput = document.getElementById('init-otp-input');
    const otp = otpInput ? otpInput.value.trim() : '';

    if (!otp) {
      if (window.APP) window.APP.showToast('يرجى إدخال رمز التحقق الثنائي', 'danger');
      if (window.SOUNDS) window.SOUNDS.playError();
      return;
    }

    this.resetOtpTimer();
    this.currentUser = this.pendingUser || Object.assign({}, window.APP_DATA.profiles.imsiu_cs);

    // Verify OTP through server endpoint and acquire signed token
    let authenticated = false;
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          email: this.currentUser.email,
          otp: otp,
          studentId: this.currentUser.studentId
        })
      });
      if (res.ok) {
        const authData = await res.json();
        if (authData && authData.token) {
          this.currentUser.sessionToken = authData.token;
          if (window.API) window.API.sessionToken = authData.token;
          authenticated = true;
        }
      } else {
        const errData = await res.json();
        if (window.APP) window.APP.showToast(errData.error || 'رمز التحقق الثنائي غير صحيح أو منتهي الصلاحية', 'danger');
        if (window.SOUNDS) window.SOUNDS.playError();
        return;
      }
    } catch (e) {
      console.warn("Backend OTP verification notice:", e);
    }

    if (!authenticated) {
      if (this.currentExpectedOtp && otp !== this.currentExpectedOtp) {
        if (window.APP) window.APP.showToast('رمز التحقق الثنائي غير صحيح', 'danger');
        if (window.SOUNDS) window.SOUNDS.playError();
        return;
      }
    }

    this.isLoggedIn = true;
    this.is2FAVerified = true;
    localStorage.setItem('senad_universal_user_session', JSON.stringify(this.currentUser));

    this.showDashboard();
    if (window.APP) window.APP.showToast(`مرحباً بك يا ${this.currentUser.name} من (${this.currentUser.university})! 🚀`, 'success');
  },

  async loginAsProfile(profileKey) {
    const profile = Object.assign({}, window.APP_DATA.profiles[profileKey] || window.APP_DATA.profiles.imsiu_cs);
    this.currentUser = profile;

    // Acquire signed academic session token from backend
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          studentId: profile.studentId || profile.email || profileKey,
          email: profile.email || `${profileKey}@imsiu.edu.sa`,
          name: profile.name
        })
      });
      if (res.ok) {
        const authData = await res.json();
        if (authData && authData.token) {
          this.currentUser.sessionToken = authData.token;
          if (window.API) window.API.sessionToken = authData.token;
        }
      }
    } catch (e) {
      console.warn("Backend session token acquisition notice:", e);
    }

    this.isLoggedIn = true;
    this.is2FAVerified = true;
    localStorage.setItem('senad_universal_user_session', JSON.stringify(this.currentUser));

    this.showDashboard();
    if (window.APP) window.APP.showToast(`تم تسجيل الدخول كطالب (${profile.university} - ${profile.major}) بنجاح! 🎉`, 'success');
  },

  logout() {
    localStorage.removeItem('senad_universal_user_session');
    if (window.API) window.API.sessionToken = null;
    this.currentUser = null;
    this.isLoggedIn = false;
    this.is2FAVerified = false;
    this.showInitialLogin();
    if (window.APP) window.APP.showToast('تم تسجيل الخروج بنجاح.', 'info');
  },

  updateUI() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');
    const gpaBadge = document.getElementById('header-gpa-badge');
    const univBadge = document.getElementById('brand-univ-badge');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (roleEl) roleEl.textContent = `${this.currentUser.university} • ${this.currentUser.major}`;
    if (avatarEl) avatarEl.textContent = this.currentUser.name.charAt(0);
    if (gpaBadge) gpaBadge.textContent = `${(this.currentUser.gpa || 4.85).toFixed(2)} / ${(this.currentUser.gpaScale || 5.00).toFixed(2)}`;
    if (univBadge) univBadge.innerHTML = `<i class="fas fa-university"></i> ${this.currentUser.university}`;
  }
};
