/**
 * Universal Multi-University Authentication Portal & Session Manager
 * Allows students from ANY university to register/login with their email, password,
 * chosen university, major, and starting academic status (freshman vs advanced).
 */

window.AUTH = {
  isLoggedIn: false,
  is2FAVerified: false,
  currentUser: null,
  otpTimerInterval: null,
  otpTimeRemaining: 60,

  init() {
    // Check if student session exists in localStorage
    const saved = localStorage.getItem('senad_universal_user_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.isLoggedIn = true;
        this.is2FAVerified = true;
        this.showDashboard();
        return;
      } catch (e) {
        localStorage.removeItem('senad_universal_user_session');
      }
    }
    // Show registration / login gateway for student
    this.showInitialLogin();
  },

  showInitialLogin() {
    this.isLoggedIn = false;
    this.is2FAVerified = false;
    const loginPortal = document.getElementById('initial-login-portal');
    const appContainer = document.getElementById('app-container');

    if (loginPortal) loginPortal.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';

    // Reset login steps
    this.switchLoginTab('student');
    this.resetOtpTimer();
  },

  showDashboard() {
    if (window.APP_DATA) window.APP_DATA.student = this.currentUser;
    const loginPortal = document.getElementById('initial-login-portal');
    const appContainer = document.getElementById('app-container');

    if (loginPortal) loginPortal.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    this.updateUI();

    // Re-initialize GPA Tracker and Gamification for this specific active student
    if (window.TRACKER) {
      window.TRACKER.syncWithCurrentStudent();
      window.TRACKER.init();
    }
    if (window.GAMIFICATION) {
      window.GAMIFICATION.init();
    }
    if (window.APP && typeof window.APP.updateDashboardStats === 'function') {
      window.APP.updateDashboardStats();
    }

    if (window.SOUNDS) window.SOUNDS.playSuccess();
    if (window.CONFETTI) window.CONFETTI.launch(40);
  },

  switchLoginTab(tab) {
    const studentForm = document.getElementById('form-student-login');
    const step2Fa = document.getElementById('form-2fa-step');

    if (step2Fa) step2Fa.style.display = 'none';
    if (studentForm) studentForm.style.display = 'block';
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

  onAcademicStatusChange() {
    const statusSelect = document.getElementById('init-academic-status');
    const advancedGroup = document.getElementById('advanced-academic-group');
    if (!statusSelect || !advancedGroup) return;

    if (statusSelect.value === 'advanced') {
      advancedGroup.style.display = 'block';
    } else {
      advancedGroup.style.display = 'none';
    }
  },

  validatePassword(password) {
    const p = password || '';
    const hasLength = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasDigit) score++;
    if (hasSymbol) score++;

    return {
      valid: hasLength && hasUpper && hasLower && hasDigit && hasSymbol,
      hasLength,
      hasCase: hasUpper && hasLower,
      hasDigit,
      hasSymbol,
      score
    };
  },

  onPasswordInput(val) {
    const res = this.validatePassword(val);
    const label = document.getElementById('pass-strength-label');
    const bar = document.getElementById('pass-strength-bar');

    const updateReq = (id, valid) => {
      const el = document.getElementById(id);
      if (!el) return;
      const icon = el.querySelector('.req-icon') || el.querySelector('i');
      if (valid) {
        el.style.color = '#10b981';
        if (icon) {
          icon.className = 'fas fa-circle-check req-icon';
          icon.style.color = '#10b981';
        }
      } else {
        el.style.color = 'var(--text-muted)';
        if (icon) {
          icon.className = 'fas fa-circle-xmark req-icon';
          icon.style.color = 'var(--danger)';
        }
      }
    };

    updateReq('req-length', res.hasLength);
    updateReq('req-case', res.hasCase);
    updateReq('req-digit', res.hasDigit);
    updateReq('req-symbol', res.hasSymbol);

    if (bar && label) {
      if (!val) {
        bar.style.width = '0%';
        bar.style.background = 'var(--danger)';
        label.textContent = 'غير مكتملة';
        label.style.color = 'var(--text-muted)';
      } else if (res.score === 1) {
        bar.style.width = '25%';
        bar.style.background = '#ef4444';
        label.textContent = 'ضعيفة جداً (1/4)';
        label.style.color = '#ef4444';
      } else if (res.score === 2) {
        bar.style.width = '50%';
        bar.style.background = '#f59e0b';
        label.textContent = 'مقبولة (2/4)';
        label.style.color = '#f59e0b';
      } else if (res.score === 3) {
        bar.style.width = '75%';
        bar.style.background = '#eab308';
        label.textContent = 'جيدة (3/4)';
        label.style.color = '#eab308';
      } else if (res.score === 4) {
        bar.style.width = '100%';
        bar.style.background = '#10b981';
        label.textContent = 'قوية ومطابقة للمعايير الأكاديمية 🛡️';
        label.style.color = '#10b981';
      }
    }
  },

  togglePasswordVisibility() {
    const input = document.getElementById('init-password');
    const icon = document.getElementById('pass-visibility-icon');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fas fa-eye';
    }
  },

  async submitInitialCredentials() {
    const nameInput = document.getElementById('init-name');
    const emailInput = document.getElementById('init-email');
    const passInput = document.getElementById('init-password');
    const univSelect = document.getElementById('init-univ-select');
    const customUnivInput = document.getElementById('init-custom-univ');
    const majorSelect = document.getElementById('init-major-select');
    const statusSelect = document.getElementById('init-academic-status');
    const prevGpaInput = document.getElementById('init-prev-gpa');
    const prevCreditsInput = document.getElementById('init-prev-credits');

    const name = nameInput ? nameInput.value.trim() : 'طالب جامعي';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !email.includes('@') || !email.includes('.')) {
      if (window.APP) window.APP.showToast('يرجى إدخال بريد إلكتروني صحيح ومعتمد', 'warning');
      if (window.SOUNDS) window.SOUNDS.playError();
      return;
    }

    const passCheck = this.validatePassword(password);
    if (!passCheck.valid) {
      if (window.APP) window.APP.showToast('⚠️ يرجى استيفاء شروط كلمة المرور: 8 خانات، حرف كبير وصغير (A-z)، رقم (0-9)، ورمز خاص (@, #, $).', 'danger');
      if (window.SOUNDS) window.SOUNDS.playError();
      const passBox = document.getElementById('init-password');
      if (passBox) passBox.focus();
      return;
    }

    let university = univSelect ? univSelect.options[univSelect.selectedIndex].text : 'جامعة عامة';
    if (univSelect && univSelect.value === 'other') {
      university = (customUnivInput && customUnivInput.value.trim()) ? customUnivInput.value.trim() : 'جامعة أخرى';
    }

    const major = majorSelect ? majorSelect.options[majorSelect.selectedIndex].text : 'علوم الحاسب والمعلومات';
    const isAdvanced = statusSelect && statusSelect.value === 'advanced';
    const gpaScale = (university.includes('البترول') || university.includes('KFUPM')) ? 4.00 : 5.00;

    let previousGpa = 0.00;
    let previousCredits = 0;
    if (isAdvanced) {
      previousGpa = prevGpaInput && parseFloat(prevGpaInput.value) ? parseFloat(prevGpaInput.value) : (gpaScale === 4.00 ? 3.50 : 4.50);
      previousCredits = prevCreditsInput && parseInt(prevCreditsInput.value) ? parseInt(prevCreditsInput.value) : 48;
    }

    // Initialize fresh student profile
    this.pendingUser = {
      name: name || email.split('@')[0],
      studentId: email.split('@')[0],
      email: email,
      university: university,
      college: "كلية الحاسب وتقنية المعلومات",
      major: major,
      level: isAdvanced ? "طالب جامعي (مستوى متقدم)" : "المستوى الأول (مستجد)",
      gpa: previousGpa,
      previousGpa: previousGpa,
      previousCredits: previousCredits,
      currentCredits: 0,
      gpaScale: gpaScale,
      xp: 50, // Welcome bonus for registration & 2FA
      levelNumber: 1,
      streakDays: 1,
      isFreshUser: true,
      plainPassword: password,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "بدأت رحلة التعلم في منصة سِنَاد", unlocked: true },
        { id: "security_sentinel", name: "حارس الخصوصية PDPL", icon: "🛡️", desc: "فعلت التحقق الثنائي والمصادقة الموحدة", unlocked: true },
        { id: "oop_master", name: "مهندس الكائنات OOP", icon: "🏛️", desc: "أتقنت مفاهيم الوراثة والبوليمورفيزم", unlocked: false },
        { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في كويزات الكود", unlocked: false },
        { id: "slide_guru", name: "قاهر السلايدات", icon: "📚", desc: "لخصت محاضرات جامعية كاملة", unlocked: false },
        { id: "tracker_scholar", name: "العالم الأكاديمي", icon: "🎓", desc: "أضفت موادك وحسبت خطة المعدل الفصلي والتراكمي", unlocked: false }
      ]
    };

    // Request secure Server-Side OTP generation & real email dispatch
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
      if (!res.ok) {
        const errData = await res.json();
        if (window.APP) window.APP.showToast(errData.error || 'تعذر إرسال رمز التحقق، يرجى المحاولة لاحقاً', 'danger');
        return;
      }
    } catch (e) {
      console.warn("Backend OTP send notice:", e);
    }

    // Advance to 2FA screen
    const studentForm = document.getElementById('form-student-login');
    const step2Fa = document.getElementById('form-2fa-step');
    if (studentForm) studentForm.style.display = 'none';
    if (step2Fa) step2Fa.style.display = 'block';

    if (window.APP) window.APP.showToast(`تم إرسال رمز التحقق الأكاديمي المكون من 6 أرقام إلى بريدك الإلكتروني (${email}) 📩 يرجى إدخاله لتأكيد الدخول.`, 'info');
    if (window.SOUNDS) window.SOUNDS.playClick();
    this.startOtpTimer();

    // STRICT: DO NOT auto-fill OTP in input field! Keep empty and wait for user to enter code from email
    const otpField = document.getElementById('init-otp-input');
    if (otpField) {
      otpField.value = '';
      otpField.focus();
    }
  },

  startOtpTimer() {
    this.resetOtpTimer();
    this.otpTimeRemaining = 300; // 5 minutes standard OTP validity
    const timerEl = document.getElementById('init-otp-timer');
    const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };
    if (timerEl) timerEl.textContent = formatTime(this.otpTimeRemaining);

    this.otpTimerInterval = setInterval(() => {
      this.otpTimeRemaining--;
      if (timerEl) {
        timerEl.textContent = formatTime(Math.max(0, this.otpTimeRemaining));
      }
      if (this.otpTimeRemaining <= 0) {
        this.resetOtpTimer();
        if (timerEl) timerEl.textContent = 'انتهت صلاحية الرمز';
      }
    }, 1000);
  },

  async resendOtp() {
    if (!this.pendingUser || !this.pendingUser.email) {
      if (window.APP) window.APP.showToast('يرجى إعادة تعبئة بيانات التسجيل', 'warning');
      this.switchLoginTab('student');
      return;
    }
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          email: this.pendingUser.email,
          name: this.pendingUser.name,
          studentId: this.pendingUser.studentId
        })
      });
      if (res.ok) {
        this.startOtpTimer();
        const otpField = document.getElementById('init-otp-input');
        if (otpField) {
          otpField.value = '';
          otpField.focus();
        }
        if (window.APP) window.APP.showToast(`تم إرسال رمز تحقق جديد إلى بريدك (${this.pendingUser.email}) ✉️`, 'success');
      } else {
        const err = await res.json();
        if (window.APP) window.APP.showToast(err.error || 'تعذر إعادة إرسال الرمز', 'danger');
      }
    } catch (e) {
      if (window.APP) window.APP.showToast('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً', 'danger');
    }
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

    if (!otp || otp.length !== 6) {
      if (window.APP) window.APP.showToast('يرجى إدخال رمز التحقق الثنائي المكون من 6 أرقام والمستلم في بريدك', 'danger');
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
          studentId: this.currentUser.studentId,
          student: this.currentUser
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
      if (window.APP) window.APP.showToast('رمز التحقق الثنائي غير صحيح أو منتهي الصلاحية', 'danger');
      if (window.SOUNDS) window.SOUNDS.playError();
      return;
    }

    this.isLoggedIn = true;
    this.is2FAVerified = true;
    localStorage.setItem('senad_universal_user_session', JSON.stringify(this.currentUser));

    // For fresh registered student: if no existing courses saved for this email, ensure fresh empty list
    const studentCourseKey = 'senad_student_courses_' + this.currentUser.email;
    if (!localStorage.getItem(studentCourseKey)) {
      localStorage.setItem(studentCourseKey, JSON.stringify([]));
    }

    // Persist real student profile to Server-Side SenadDatabase
    if (window.API && typeof window.API.saveStudentToDB === 'function') {
      window.API.saveStudentToDB(this.currentUser);
    }

    this.showDashboard();
    if (window.APP) window.APP.showToast(`مرحباً بك يا ${this.currentUser.name} من (${this.currentUser.university})! تم تسجيل وحفظ حسابك الأكاديمي بنجاح 🚀`, 'success');
  },

  async loginAsProfile(profileKey) {
    const profile = Object.assign({}, window.APP_DATA.profiles[profileKey] || window.APP_DATA.profiles.imsiu_cs);
    this.currentUser = profile;

    // For demo profile: ensure demo courses are loaded if not previously saved
    const studentCourseKey = 'senad_student_courses_' + profile.email;
    if (!localStorage.getItem(studentCourseKey)) {
      localStorage.setItem(studentCourseKey, JSON.stringify(window.APP_DATA.courses));
    }

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
    if (gpaBadge) gpaBadge.textContent = `${(this.currentUser.gpa || 0.00).toFixed(2)} / ${(this.currentUser.gpaScale || 5.00).toFixed(2)}`;
    if (univBadge) univBadge.innerHTML = `<i class="fas fa-university"></i> ${this.escapeHtml(this.currentUser.university || 'جامعة الإمام')}`;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
};
