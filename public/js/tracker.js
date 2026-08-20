/**
 * Enhanced Course & Multi-Semester Saudi GPA Tracker
 * Saudi 5.00 / 4.00 scale, accurate cumulative calculations, user isolated persistence,
 * fully customizable assessment weights (Max scores per assessment), and transcript exporter.
 */

window.TRACKER = {
  courses: [],
  gpaScale: 5.00,
  previousGpa: 0.00,
  previousCredits: 0,
  universityName: "الجامعة",
  collegeName: "كلية علوم الحاسب والمعلومات",

  init() {
    this.syncWithCurrentStudent();
    this.renderCoursesTable();
    this.updateGPACalculations();
  },

  getStorageKey() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || {};
    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';
    return `senad_student_courses_${emailKey}`;
  },

  syncWithCurrentStudent() {
    const student = (window.AUTH && window.AUTH.currentUser) || (window.APP_DATA && window.APP_DATA.student) || (window.APP_DATA && window.APP_DATA.profiles && window.APP_DATA.profiles.imsiu_cs) || {};
    this.universityName = student.university || "جامعة الإمام محمد بن سعود الإسلامية";
    this.collegeName = student.college || "كلية علوم الحاسب والمعلومات";
    this.gpaScale = student.gpaScale || 5.00;

    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';
    const savedPriorGpa = localStorage.getItem(`senad_student_prior_gpa_${emailKey}`);
    const savedPriorCredits = localStorage.getItem(`senad_student_prior_credits_${emailKey}`);

    if (savedPriorGpa !== null) {
      this.previousGpa = parseFloat(savedPriorGpa) || 0.00;
    } else {
      this.previousGpa = (typeof student.previousGpa !== 'undefined') ? student.previousGpa : (student.gpa || 0.00);
    }

    if (savedPriorCredits !== null) {
      this.previousCredits = parseInt(savedPriorCredits) || 0;
    } else {
      this.previousCredits = (typeof student.previousCredits !== 'undefined') ? student.previousCredits : 0;
    }

    // Load courses for this active student
    const storageKey = this.getStorageKey();
    const savedCourses = localStorage.getItem(storageKey);
    if (savedCourses) {
      try {
        this.courses = JSON.parse(savedCourses);
      } catch (e) {
        this.courses = [];
      }
    } else {
      // Demo profile fallback
      if (student.studentId === "441019284" || student.email === "441019284@sm.imamu.edu.sa") {
        this.courses = [...(window.APP_DATA.courses || [])];
      } else {
        this.courses = [];
      }
    }

    // Normalize max fields for any legacy courses
    this.courses.forEach(c => {
      if (c.midterm1Max === undefined) c.midterm1Max = 20;
      if (c.midterm2Max === undefined) c.midterm2Max = 20;
      if (c.quizzesMax === undefined) c.quizzesMax = 10;
      if (c.assignmentsMax === undefined) c.assignmentsMax = 10;
      if (c.projectMax === undefined) c.projectMax = 10;
      if (c.finalExamMax === undefined) c.finalExamMax = 30;
    });

    // Update scale labels in DOM
    const scaleTextEls = document.querySelectorAll('.gpa-scale-text');
    scaleTextEls.forEach(el => { el.textContent = `من ${this.gpaScale.toFixed(2)}`; });

    const targetInput = document.getElementById('target-gpa-input');
    if (targetInput) {
      targetInput.max = this.gpaScale.toFixed(2);
      targetInput.value = this.gpaScale === 4.00 ? "3.95" : "4.95";
      targetInput.placeholder = `المعدل المستهدف (مثلاً ${this.gpaScale === 4.00 ? '3.95' : '4.95'})`;
    }
  },

  calculateCourseTotal(c) {
    const m1Earned = parseFloat(c.midterm1) || 0;
    const m1Max = parseFloat(c.midterm1Max !== undefined ? c.midterm1Max : 20);

    const m2Earned = parseFloat(c.midterm2) || 0;
    const m2Max = parseFloat(c.midterm2Max !== undefined ? c.midterm2Max : 20);

    const qEarned = parseFloat(c.quizzes) || 0;
    const qMax = parseFloat(c.quizzesMax !== undefined ? c.quizzesMax : 10);

    const aEarned = parseFloat(c.assignments) || 0;
    const aMax = parseFloat(c.assignmentsMax !== undefined ? c.assignmentsMax : 10);

    const pEarned = parseFloat(c.project) || 0;
    const pMax = parseFloat(c.projectMax !== undefined ? c.projectMax : 10);

    const fEarned = parseFloat(c.finalExam) || 0;
    const fMax = parseFloat(c.finalExamMax !== undefined ? c.finalExamMax : 30);

    const totalEarned = m1Earned + m2Earned + qEarned + aEarned + pEarned + fEarned;
    const totalMax = m1Max + m2Max + qMax + aMax + pMax + fMax;

    if (totalMax <= 0) return 0;
    return (totalEarned / totalMax) * 100;
  },

  getLetterGradeAndPoint(total) {
    if (this.gpaScale === 5.00) {
      if (total >= 95) return { letter: "A+", points: 5.00 };
      if (total >= 90) return { letter: "A", points: 4.75 };
      if (total >= 85) return { letter: "B+", points: 4.50 };
      if (total >= 80) return { letter: "B", points: 4.00 };
      if (total >= 75) return { letter: "C+", points: 3.50 };
      if (total >= 70) return { letter: "C", points: 3.00 };
      if (total >= 65) return { letter: "D+", points: 2.50 };
      if (total >= 60) return { letter: "D", points: 2.00 };
      return { letter: "F", points: 1.00 };
    } else {
      if (total >= 95) return { letter: "A+", points: 4.00 };
      if (total >= 90) return { letter: "A", points: 3.75 };
      if (total >= 85) return { letter: "B+", points: 3.50 };
      if (total >= 80) return { letter: "B", points: 3.00 };
      if (total >= 75) return { letter: "C+", points: 2.50 };
      if (total >= 70) return { letter: "C", points: 2.00 };
      if (total >= 60) return { letter: "D", points: 1.00 };
      return { letter: "F", points: 0.00 };
    }
  },

  renderCoursesTable() {
    const tbody = document.getElementById('courses-table-body');
    if (!tbody) return;

    if (this.courses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 45px 20px; background: rgba(0,0,0,0.15);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 24px; border: 1px solid rgba(16, 185, 129, 0.3);">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <h4 style="color: var(--text-main); font-size: 16px; font-weight: 700; margin-bottom: 6px;">لا توجد مواد مسجلة في سجلك الأكاديمي حتى الآن</h4>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 18px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.6;">
              أضف موادك ومقرراتك الدراسية لهذا الفصل مع توزيع الدرجات المخصص ليتم احتساب معدلك الفصلي والتراكمي بدقة فورية.
            </p>
            <button class="btn btn-primary btn-sm" onclick="window.TRACKER.openAddCourseModal()" style="font-weight: 700;">
              <i class="fas fa-plus"></i> إضافة أول مقرر دراسي
            </button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.courses.map((c, index) => {
      const total = this.calculateCourseTotal(c);
      const gradeInfo = this.getLetterGradeAndPoint(total);
      const badgeClass = `grade-${gradeInfo.letter.replace('+', '-plus')}`;

      const formatScore = (earned, max) => {
        if (max === 0 || max === '0') return '<span style="color: var(--text-dim);">-</span>';
        return `${earned} <span style="font-size: 10px; color: var(--text-dim);">/${max}</span>`;
      };

      return `
        <tr>
          <td style="font-weight: 700;">
            <div style="font-family: var(--font-code); color: var(--primary);">${this.escapeHtml(c.code)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${this.escapeHtml(c.name)}</div>
          </td>
          <td>${c.credits} ساعات</td>
          <td>${formatScore(c.midterm1, c.midterm1Max !== undefined ? c.midterm1Max : 20)}</td>
          <td>${formatScore(c.midterm2, c.midterm2Max !== undefined ? c.midterm2Max : 20)}</td>
          <td>${formatScore(c.quizzes, c.quizzesMax !== undefined ? c.quizzesMax : 10)}</td>
          <td>${formatScore(c.assignments, c.assignmentsMax !== undefined ? c.assignmentsMax : 10)}</td>
          <td>${formatScore(c.project, c.projectMax !== undefined ? c.projectMax : 10)}</td>
          <td style="font-weight: 700; color: #fbbf24;">${formatScore(c.finalExam, c.finalExamMax !== undefined ? c.finalExamMax : 30)}</td>
          <td style="font-weight: 800; font-size: 14px;">${total.toFixed(1)}%</td>
          <td>
            <span class="grade-badge ${badgeClass}">${gradeInfo.letter} (${gradeInfo.points.toFixed(2)})</span>
          </td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn btn-sm" onclick="window.TRACKER.openAddCourseModal(${index})" title="تعديل المقرر والدرجات">
                <i class="fas fa-edit" style="color: var(--primary); font-size: 11px;"></i>
              </button>
              <button class="icon-btn btn-sm" onclick="window.TRACKER.deleteCourse(${index})" title="حذف المقرر">
                <i class="fas fa-trash" style="color: var(--danger); font-size: 11px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateGPACalculations() {
    let currentSemesterPoints = 0;
    let currentSemesterCredits = 0;

    this.courses.forEach(c => {
      const total = this.calculateCourseTotal(c);
      const gradeInfo = this.getLetterGradeAndPoint(total);
      currentSemesterPoints += gradeInfo.points * (c.credits || 3);
      currentSemesterCredits += (c.credits || 3);
    });

    const semesterGpa = currentSemesterCredits > 0 ? (currentSemesterPoints / currentSemesterCredits) : 0;

    // Cumulative calculation:
    const prevPoints = (this.previousGpa || 0) * (this.previousCredits || 0);
    const totalCumulativePoints = prevPoints + currentSemesterPoints;
    const totalCumulativeCredits = (this.previousCredits || 0) + currentSemesterCredits;
    const cumulativeGpa = totalCumulativeCredits > 0 ? (totalCumulativePoints / totalCumulativeCredits) : 0;
    
    // Update DOM elements
    const gpaValEl = document.getElementById('gpa-main-val');
    const gpaSemesterEl = document.getElementById('gpa-semester-val');
    const gpaTotalCreditsEl = document.getElementById('gpa-total-credits');
    const gpaPercentEl = document.getElementById('gpa-progress-ring');
    const headerGpaEl = document.getElementById('header-gpa-badge');
    const dashGpaStat = document.getElementById('dash-gpa-stat');
    const dashCoursesCount = document.getElementById('dash-courses-count');
    const appreciationEl = document.getElementById('gpa-grade-appreciation');
    const honorBadgeEl = document.getElementById('gpa-honor-badge');

    if (gpaValEl) gpaValEl.textContent = cumulativeGpa.toFixed(2);
    if (gpaSemesterEl) gpaSemesterEl.textContent = `المعدل الفصلي الحالي: ${semesterGpa.toFixed(2)}`;
    if (gpaTotalCreditsEl) {
      gpaTotalCreditsEl.textContent = `${totalCumulativeCredits} ساعة إجمالية (${currentSemesterCredits} الفصل الحالي${this.previousCredits > 0 ? ` + ${this.previousCredits} سابقة` : ''})`;
    }
    if (headerGpaEl) headerGpaEl.textContent = `${cumulativeGpa.toFixed(2)} / ${this.gpaScale.toFixed(2)}`;
    if (dashGpaStat) dashGpaStat.textContent = `${cumulativeGpa.toFixed(2)} / ${this.gpaScale.toFixed(2)}`;
    if (dashCoursesCount) {
      dashCoursesCount.textContent = `${this.courses.length} مقرر${this.courses.length > 2 && this.courses.length < 11 ? 'ات' : ''}`;
    }

    // Appreciation label & honor badge
    if (appreciationEl && honorBadgeEl) {
      if (totalCumulativeCredits === 0) {
        appreciationEl.textContent = "التقدير التراكمي: سجل جديد";
        honorBadgeEl.innerHTML = `<i class="fas fa-rocket"></i> بداية موفقة 🚀`;
      } else {
        const isFour = this.gpaScale === 4.00;
        if (cumulativeGpa >= (isFour ? 3.75 : 4.75)) {
          appreciationEl.textContent = "التقدير التراكمي: ممتاز مرتفع (A+)";
          honorBadgeEl.innerHTML = `<i class="fas fa-award"></i> مرتبة الشرف الأولى 🏆`;
        } else if (cumulativeGpa >= (isFour ? 3.50 : 4.50)) {
          appreciationEl.textContent = "التقدير التراكمي: ممتاز (A)";
          honorBadgeEl.innerHTML = `<i class="fas fa-medal"></i> مرتبة الشرف الثانية 🎖️`;
        } else if (cumulativeGpa >= (isFour ? 3.00 : 3.75)) {
          appreciationEl.textContent = "التقدير التراكمي: جيد جداً مرتفع (B+)";
          honorBadgeEl.innerHTML = `<i class="fas fa-star"></i> أداء أكاديمي متقدم ✨`;
        } else if (cumulativeGpa >= (isFour ? 2.50 : 3.00)) {
          appreciationEl.textContent = "التقدير التراكمي: جيد جداً (B)";
          honorBadgeEl.innerHTML = `<i class="fas fa-check"></i> أداء جيد 👍`;
        } else if (cumulativeGpa >= (isFour ? 2.00 : 2.75)) {
          appreciationEl.textContent = "التقدير التراكمي: جيد (C)";
          honorBadgeEl.innerHTML = `<i class="fas fa-arrow-up"></i> قابل للتطوير 📈`;
        } else {
          appreciationEl.textContent = "التقدير التراكمي: مقبول (D)";
          honorBadgeEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> يحتاج لمضاعفة الجهد ⚡`;
        }
      }
    }

    // Update SVG stroke offset
    if (gpaPercentEl) {
      const maxGpa = this.gpaScale;
      const progress = maxGpa > 0 ? (cumulativeGpa / maxGpa) : 0;
      const circumference = 2 * Math.PI * 54;
      gpaPercentEl.style.strokeDashoffset = circumference * (1 - progress);
    }

    // Persist courses locally per student
    const storageKey = this.getStorageKey();
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.courses));
      const student = (window.AUTH && window.AUTH.currentUser) || {};
      if (student.email) {
        student.gpa = cumulativeGpa;
        student.currentCredits = currentSemesterCredits;
        localStorage.setItem('senad_universal_user_session', JSON.stringify(student));
        if (window.API && typeof window.API.saveCoursesToDB === 'function') {
          window.API.saveCoursesToDB(student.email, this.courses);
        }
      }
    } catch (e) {}
  },

  deleteCourse(index) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه المادة من السجل الأكاديمي؟')) {
      this.courses.splice(index, 1);
      this.renderCoursesTable();
      this.updateGPACalculations();
      window.APP.showToast('تم حذف المادة بنجاح', 'info');
      if (window.SOUNDS) window.SOUNDS.playClick();
    }
  },

  openAddCourseModal(editIndex = -1) {
    const modal = document.getElementById('add-course-modal');
    const titleEl = document.getElementById('course-modal-title');
    const editIndexEl = document.getElementById('course-edit-index');

    if (editIndexEl) editIndexEl.value = editIndex;

    if (editIndex >= 0 && this.courses[editIndex]) {
      const c = this.courses[editIndex];
      if (titleEl) titleEl.innerHTML = `<i class="fas fa-edit" style="color: var(--primary);"></i> تعديل درجات المقرر (${this.escapeHtml(c.code)})`;

      document.getElementById('new-course-code').value = c.code || '';
      document.getElementById('new-course-name').value = c.name || '';
      document.getElementById('new-course-credits').value = c.credits || 3;

      document.getElementById('new-course-m1').value = c.midterm1 !== undefined ? c.midterm1 : '';
      document.getElementById('new-course-m1-max').value = c.midterm1Max !== undefined ? c.midterm1Max : 20;

      document.getElementById('new-course-m2').value = c.midterm2 !== undefined ? c.midterm2 : '';
      document.getElementById('new-course-m2-max').value = c.midterm2Max !== undefined ? c.midterm2Max : 20;

      document.getElementById('new-course-quizzes').value = c.quizzes !== undefined ? c.quizzes : '';
      document.getElementById('new-course-quizzes-max').value = c.quizzesMax !== undefined ? c.quizzesMax : 10;

      document.getElementById('new-course-assign').value = c.assignments !== undefined ? c.assignments : '';
      document.getElementById('new-course-assign-max').value = c.assignmentsMax !== undefined ? c.assignmentsMax : 10;

      document.getElementById('new-course-project').value = c.project !== undefined ? c.project : '';
      document.getElementById('new-course-project-max').value = c.projectMax !== undefined ? c.projectMax : 10;

      document.getElementById('new-course-final').value = c.finalExam !== undefined ? c.finalExam : '';
      document.getElementById('new-course-final-max').value = c.finalExamMax !== undefined ? c.finalExamMax : 30;
    } else {
      if (titleEl) titleEl.innerHTML = `<i class="fas fa-plus-circle" style="color: var(--primary);"></i> إضافة وتوزيع درجات المقرر`;

      document.getElementById('new-course-code').value = '';
      document.getElementById('new-course-name').value = '';
      document.getElementById('new-course-credits').value = 3;

      document.getElementById('new-course-m1').value = '';
      document.getElementById('new-course-m1-max').value = 20;

      document.getElementById('new-course-m2').value = '';
      document.getElementById('new-course-m2-max').value = 20;

      document.getElementById('new-course-quizzes').value = '';
      document.getElementById('new-course-quizzes-max').value = 10;

      document.getElementById('new-course-assign').value = '';
      document.getElementById('new-course-assign-max').value = 10;

      document.getElementById('new-course-project').value = '';
      document.getElementById('new-course-project-max').value = 10;

      document.getElementById('new-course-final').value = '';
      document.getElementById('new-course-final-max').value = 30;
    }

    this.updateModalLivePreview();
    if (modal) modal.classList.add('active');
  },

  closeAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) modal.classList.remove('active');
  },

  applyDistributionPreset(presetKey) {
    if (presetKey === 'std_30_final') {
      document.getElementById('new-course-m1-max').value = 20;
      document.getElementById('new-course-m2-max').value = 20;
      document.getElementById('new-course-quizzes-max').value = 10;
      document.getElementById('new-course-assign-max').value = 10;
      document.getElementById('new-course-project-max').value = 10;
      document.getElementById('new-course-final-max').value = 30;
    } else if (presetKey === 'final_40') {
      document.getElementById('new-course-m1-max').value = 20;
      document.getElementById('new-course-m2-max').value = 0;
      document.getElementById('new-course-quizzes-max').value = 10;
      document.getElementById('new-course-assign-max').value = 10;
      document.getElementById('new-course-project-max').value = 20;
      document.getElementById('new-course-final-max').value = 40;
    } else if (presetKey === 'final_50') {
      document.getElementById('new-course-m1-max').value = 25;
      document.getElementById('new-course-m2-max').value = 0;
      document.getElementById('new-course-quizzes-max').value = 10;
      document.getElementById('new-course-assign-max').value = 10;
      document.getElementById('new-course-project-max').value = 5;
      document.getElementById('new-course-final-max').value = 50;
    } else if (presetKey === 'final_60') {
      document.getElementById('new-course-m1-max').value = 25;
      document.getElementById('new-course-m2-max').value = 0;
      document.getElementById('new-course-quizzes-max').value = 10;
      document.getElementById('new-course-assign-max').value = 5;
      document.getElementById('new-course-project-max').value = 0;
      document.getElementById('new-course-final-max').value = 60;
    }
    this.updateModalLivePreview();
    if (window.SOUNDS) window.SOUNDS.playClick();
  },

  updateModalLivePreview() {
    const m1 = parseFloat(document.getElementById('new-course-m1')?.value) || 0;
    const m1Max = parseFloat(document.getElementById('new-course-m1-max')?.value) || 0;

    const m2 = parseFloat(document.getElementById('new-course-m2')?.value) || 0;
    const m2Max = parseFloat(document.getElementById('new-course-m2-max')?.value) || 0;

    const q = parseFloat(document.getElementById('new-course-quizzes')?.value) || 0;
    const qMax = parseFloat(document.getElementById('new-course-quizzes-max')?.value) || 0;

    const assign = parseFloat(document.getElementById('new-course-assign')?.value) || 0;
    const assignMax = parseFloat(document.getElementById('new-course-assign-max')?.value) || 0;

    const proj = parseFloat(document.getElementById('new-course-project')?.value) || 0;
    const projMax = parseFloat(document.getElementById('new-course-project-max')?.value) || 0;

    const finalEx = parseFloat(document.getElementById('new-course-final')?.value) || 0;
    const finalMax = parseFloat(document.getElementById('new-course-final-max')?.value) || 0;

    const totalEarned = m1 + m2 + q + assign + proj + finalEx;
    const totalMax = m1Max + m2Max + qMax + assignMax + projMax + finalMax;

    const percent = totalMax > 0 ? ((totalEarned / totalMax) * 100) : 0;
    const gradeInfo = this.getLetterGradeAndPoint(percent);

    const maxTotalEl = document.getElementById('modal-live-max-total');
    const earnedTotalEl = document.getElementById('modal-live-earned-total');
    const percentEl = document.getElementById('modal-live-percent');
    const gradeBadgeEl = document.getElementById('modal-live-grade-badge');

    if (maxTotalEl) maxTotalEl.textContent = totalMax;
    if (earnedTotalEl) earnedTotalEl.textContent = totalEarned.toFixed(1);
    if (percentEl) percentEl.textContent = `${percent.toFixed(1)}%`;
    if (gradeBadgeEl) {
      gradeBadgeEl.textContent = `${gradeInfo.letter} (${gradeInfo.points.toFixed(2)})`;
      gradeBadgeEl.className = `grade-badge grade-${gradeInfo.letter.replace('+', '-plus')}`;
    }
  },

  saveNewCourse() {
    const code = document.getElementById('new-course-code').value.trim();
    const name = document.getElementById('new-course-name').value.trim();
    const credits = parseInt(document.getElementById('new-course-credits').value) || 3;
    const editIndex = parseInt(document.getElementById('course-edit-index').value);

    const m1 = parseFloat(document.getElementById('new-course-m1').value) || 0;
    const m1Max = parseFloat(document.getElementById('new-course-m1-max').value) || 0;

    const m2 = parseFloat(document.getElementById('new-course-m2').value) || 0;
    const m2Max = parseFloat(document.getElementById('new-course-m2-max').value) || 0;

    const q = parseFloat(document.getElementById('new-course-quizzes').value) || 0;
    const qMax = parseFloat(document.getElementById('new-course-quizzes-max').value) || 0;

    const assign = parseFloat(document.getElementById('new-course-assign').value) || 0;
    const assignMax = parseFloat(document.getElementById('new-course-assign-max').value) || 0;

    const proj = parseFloat(document.getElementById('new-course-project').value) || 0;
    const projMax = parseFloat(document.getElementById('new-course-project-max').value) || 0;

    const finalEx = parseFloat(document.getElementById('new-course-final').value) || 0;
    const finalMax = parseFloat(document.getElementById('new-course-final-max').value) || 0;

    if (!code || !name) {
      window.APP.showToast('يرجى كتابة رمز واسم المادة', 'warning');
      return;
    }

    const courseData = {
      id: (editIndex >= 0 && this.courses[editIndex]) ? this.courses[editIndex].id : `course_${Date.now()}`,
      code: code,
      name: name,
      credits: credits,
      midterm1: m1,
      midterm1Max: m1Max,
      midterm2: m2,
      midterm2Max: m2Max,
      quizzes: q,
      quizzesMax: qMax,
      assignments: assign,
      assignmentsMax: assignMax,
      project: proj,
      projectMax: projMax,
      finalExam: finalEx,
      finalExamMax: finalMax
    };

    if (editIndex >= 0 && this.courses[editIndex]) {
      this.courses[editIndex] = courseData;
      window.APP.showToast('تم تعديل درجات المقرر وحساب المعدل بنجاح 🎯', 'success');
    } else {
      this.courses.push(courseData);
      if (window.GAMIFICATION) {
        window.GAMIFICATION.addXP(30, 'إضافة مادة أكاديمية جديدة');
        window.GAMIFICATION.unlockBadge('tracker_scholar', 'حساب الخطة الأكاديمية وإضافة المقررات');
      }
      if (window.CONFETTI) window.CONFETTI.launch(30);
      window.APP.showToast('تمت إضافة المادة وحساب المعدل بنجاح! (+30 XP)', 'success');
    }

    this.renderCoursesTable();
    this.updateGPACalculations();
    this.closeAddCourseModal();

    if (window.SOUNDS) window.SOUNDS.playSuccess();
  },

  openEditPriorModal() {
    const modal = document.getElementById('edit-prior-gpa-modal');
    const gpaInput = document.getElementById('edit-prev-gpa-input');
    const creditsInput = document.getElementById('edit-prev-credits-input');

    if (gpaInput) gpaInput.value = this.previousGpa > 0 ? this.previousGpa.toFixed(2) : '';
    if (creditsInput) creditsInput.value = this.previousCredits > 0 ? this.previousCredits : '';

    if (modal) modal.classList.add('active');
  },

  closeEditPriorModal() {
    const modal = document.getElementById('edit-prior-gpa-modal');
    if (modal) modal.classList.remove('active');
  },

  savePriorAcademicRecord() {
    const gpaInput = document.getElementById('edit-prev-gpa-input');
    const creditsInput = document.getElementById('edit-prev-credits-input');

    const newPriorGpa = gpaInput ? (parseFloat(gpaInput.value) || 0.00) : 0.00;
    const newPriorCredits = creditsInput ? (parseInt(creditsInput.value) || 0) : 0;

    this.previousGpa = newPriorGpa;
    this.previousCredits = newPriorCredits;

    const student = (window.AUTH && window.AUTH.currentUser) || {};
    const emailKey = student.email ? student.email.toLowerCase() : 'default_student';

    localStorage.setItem(`senad_student_prior_gpa_${emailKey}`, String(newPriorGpa));
    localStorage.setItem(`senad_student_prior_credits_${emailKey}`, String(newPriorCredits));

    if (student.email) {
      student.previousGpa = newPriorGpa;
      student.previousCredits = newPriorCredits;
      localStorage.setItem('senad_universal_user_session', JSON.stringify(student));
    }

    this.updateGPACalculations();
    this.closeEditPriorModal();
    if (window.SOUNDS) window.SOUNDS.playSuccess();
    window.APP.showToast('تم تحديث الساعات والمعدل السابق وإعادة حساب التراكمي بنجاح 🎯', 'success');
  },

  /**
   * Realistic Mathematical Saudi University GPA Goal Simulator & Optimizer Engine
   */
  simulateTargetGPA() {
    const targetGpa = parseFloat(document.getElementById('target-gpa-input').value) || 4.95;
    const resultBox = document.getElementById('target-gpa-result');
    if (!resultBox) return;

    const prevGpa = this.previousGpa || 0.00;
    const prevCredits = this.previousCredits || 0;
    const maxScale = this.gpaScale || 5.00;
    
    let currentSemesterCredits = 0;
    this.courses.forEach(c => { currentSemesterCredits += (c.credits || 3); });
    if (currentSemesterCredits === 0) currentSemesterCredits = 16;

    const totalCredits = prevCredits + currentSemesterCredits;
    const prevPoints = prevGpa * prevCredits;
    const targetTotalPoints = targetGpa * totalCredits;
    const requiredSemesterPoints = targetTotalPoints - prevPoints;
    const requiredSemesterGpa = currentSemesterCredits > 0 ? (requiredSemesterPoints / currentSemesterCredits) : 0;

    const maxSemesterPoints = maxScale * currentSemesterCredits;
    const maxCumulativePoints = prevPoints + maxSemesterPoints;

    // Course by course realistic analysis
    let optimizedSemesterPoints = 0;
    const courseBreakdown = this.courses.map(c => {
      const credits = c.credits || 3;
      const currentWork = (parseFloat(c.midterm1) || 0) + (parseFloat(c.midterm2) || 0) + 
                          (parseFloat(c.quizzes) || 0) + (parseFloat(c.assignments) || 0) + 
                          (parseFloat(c.project) || 0);

      const currentMaxWork = (parseFloat(c.midterm1Max !== undefined ? c.midterm1Max : 20)) + 
                             (parseFloat(c.midterm2Max !== undefined ? c.midterm2Max : 20)) + 
                             (parseFloat(c.quizzesMax !== undefined ? c.quizzesMax : 10)) + 
                             (parseFloat(c.assignmentsMax !== undefined ? c.assignmentsMax : 10)) + 
                             (parseFloat(c.projectMax !== undefined ? c.projectMax : 10));

      const finalMax = parseFloat(c.finalExamMax !== undefined ? c.finalExamMax : 30);
      const totalCourseMax = currentMaxWork + finalMax;

      let targetGrade = "A+";
      let gradePoint = (maxScale === 4.00) ? 4.00 : 5.00;
      let minPercentage = 95;
      let targetScore = (minPercentage / 100) * totalCourseMax;
      let requiredFinal = targetScore - currentWork;

      if (requiredFinal > finalMax) {
        targetGrade = "A";
        gradePoint = (maxScale === 4.00) ? 3.75 : 4.75;
        minPercentage = 90;
        targetScore = (minPercentage / 100) * totalCourseMax;
        requiredFinal = targetScore - currentWork;
      }

      if (requiredFinal > finalMax) {
        targetGrade = "B+";
        gradePoint = (maxScale === 4.00) ? 3.50 : 4.50;
        minPercentage = 85;
        targetScore = (minPercentage / 100) * totalCourseMax;
        requiredFinal = targetScore - currentWork;
      }

      if (requiredFinal < 0) requiredFinal = 0;
      requiredFinal = Math.min(finalMax, Math.max(0, requiredFinal));

      const expectedTotalScore = currentWork + requiredFinal;
      const expectedTotalPercent = totalCourseMax > 0 ? ((expectedTotalScore / totalCourseMax) * 100) : 0;
      const earnedCoursePoints = gradePoint * credits;
      optimizedSemesterPoints += earnedCoursePoints;

      return {
        code: c.code,
        name: c.name,
        credits: credits,
        currentWork: currentWork,
        currentMaxWork: currentMaxWork,
        finalMax: finalMax,
        totalCourseMax: totalCourseMax,
        targetGrade: targetGrade,
        gradePoint: gradePoint,
        requiredFinal: requiredFinal,
        expectedTotalPercent: expectedTotalPercent,
        earnedCoursePoints: earnedCoursePoints
      };
    });

    const realisticSemesterGpa = currentSemesterCredits > 0 ? (optimizedSemesterPoints / currentSemesterCredits) : 0;
    const realisticNewCumulativeGpa = totalCredits > 0 ? ((prevPoints + optimizedSemesterPoints) / totalCredits) : 0;

    let simulationHtml = "";

    if (requiredSemesterGpa > maxScale) {
      const futureHoursNeeded = (targetGpa * totalCredits - maxCumulativePoints) / (maxScale - targetGpa);
      const futureSemesters = Math.max(1, Math.ceil(futureHoursNeeded / 16));

      simulationHtml = `
        <div style="background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.88)); border: 1.5px solid #f59e0b; padding: 20px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; font-size: 15px; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-chart-pie"></i>
              <span>الحساب الأكاديمي الواقعي والمفصل للمعدل المستهدف (${targetGpa.toFixed(2)} / ${maxScale.toFixed(2)}):</span>
            </div>
            <span style="font-size: 11px; background: rgba(245, 158, 11, 0.2); color: #fde047; padding: 4px 12px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.4);">
              ${this.escapeHtml(this.universityName)} (مقياس ${maxScale.toFixed(2)})
            </span>
          </div>

          <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-bottom: 16px; color: #fef08a;">
            <div style="font-weight: 700; margin-bottom: 4px; font-size: 14px;">📌 التحليل الرياضي الدقيق:</div>
            بناءً على سجلك الأكاديمي (معدل سابق <strong>${prevGpa.toFixed(2)}</strong> لـ <strong>${prevCredits}</strong> ساعة):<br>
            - للوصول لمعدل <strong>${targetGpa.toFixed(2)}</strong> في هذا الفصل وحده، ستحتاج معدلاً فصلياً قدره <strong>(${requiredSemesterGpa.toFixed(2)})</strong>، وهو أعلى من الحد الأقصى للنظام (${maxScale.toFixed(2)}).<br>
            - لذلك، قمنا بحساب <strong>خطة التميز القصوى الواقعية</strong> بناءً على درجات أعمال سنتك الفعلية وأوزان تقييم كل مادة.
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 18px;">
            <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 12px 14px; border-radius: 8px; text-align: center;">
              <div style="font-size: 11px; color: #6ee7b7;"><i class="fas fa-arrow-trend-up"></i> المعدل الفصلي المتوقع بالخطة:</div>
              <div style="font-size: 20px; font-weight: 800; color: #34d399; margin-top: 4px;">${realisticSemesterGpa.toFixed(2)} / ${maxScale.toFixed(2)}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">مجموع النقاط: ${optimizedSemesterPoints.toFixed(1)} من ${maxSemesterPoints.toFixed(1)}</div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); padding: 12px 14px; border-radius: 8px; text-align: center;">
              <div style="font-size: 11px; color: #7dd3fc;"><i class="fas fa-award"></i> المعدل التراكمي الجديد بنهاية الفصل:</div>
              <div style="font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${realisticNewCumulativeGpa.toFixed(2)} / ${maxScale.toFixed(2)}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">(إجمالي ${totalCredits} ساعة معتمدة)</div>
            </div>

            <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); padding: 12px 14px; border-radius: 8px; text-align: center;">
              <div style="font-size: 11px; color: #a5b4fc;"><i class="fas fa-graduation-cap"></i> الفصول القادمة لبلوغ ${targetGpa.toFixed(2)}:</div>
              <div style="font-size: 20px; font-weight: 800; color: #818cf8; margin-top: 4px;">${futureSemesters} فصول دراسية</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">مع مرتبة الشرف الأولى بإذن الله 🏆</div>
            </div>
          </div>

          ${this.courses.length > 0 ? `
            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-list-check" style="color: var(--primary);"></i> الدرجات الدقيقة المطلوبة في الاختبار النهائي لكل مقرر (بحسب وزن الفاينل المخصص):
            </div>
            <div style="display: grid; gap: 8px;">
              ${courseBreakdown.map(c => `
                <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="color: #38bdf8; font-family: var(--font-code); font-size: 13px;">${this.escapeHtml(c.code)}</strong>
                      <span style="color: #f1f5f9; font-size: 13px; font-weight: 600;">${this.escapeHtml(c.name)}</span>
                      <span style="font-size: 11px; background: rgba(255,255,255,0.08); color: #94a3b8; padding: 1px 6px; border-radius: 4px;">${c.credits} ساعات</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
                      أعمال السنة: <strong style="color: #fef08a;">${c.currentWork.toFixed(1)} / ${c.currentMaxWork}</strong> ➔ المجموع النهائي المتوقع: <strong style="color: #6ee7b7;">${c.expectedTotalPercent.toFixed(1)}%</strong>
                    </div>
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 12px; background: ${c.targetGrade === 'A+' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${c.targetGrade === 'A+' ? '#34d399' : '#60a5fa'}; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid ${c.targetGrade === 'A+' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};">
                      فاينل مطلوب لـ ${c.targetGrade}: <strong>${c.requiredFinal.toFixed(1)} / ${c.finalMax}</strong>
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      simulationHtml = `
        <div style="background: linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95)); border: 1.5px solid var(--primary); padding: 20px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="font-weight: 800; font-size: 15px; color: #34d399; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle"></i>
            <span>الهدف متاح وقابل للتحقيق هذا الفصل بنجاح في ${this.escapeHtml(this.universityName)}! 🎯</span>
          </div>
          <div style="color: #cbd5e1; margin-bottom: 14px;">
            للوصول إلى معدل تراكمي <strong>${targetGpa.toFixed(2)}</strong>، تحتاج إلى معدل فصلي قدره <strong>${requiredSemesterGpa.toFixed(2)} / ${maxScale.toFixed(2)}</strong> هذا الفصل.
          </div>
          
          ${this.courses.length > 0 ? `
            <div style="display: grid; gap: 8px;">
              ${courseBreakdown.map(c => `
                <div style="background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #38bdf8;">${this.escapeHtml(c.code)}</strong> - ${this.escapeHtml(c.name)} (${c.credits} ساعات)
                    <div style="font-size: 11px; color: #94a3b8;">أعمال السنة: ${c.currentWork.toFixed(1)} / ${c.currentMaxWork}</div>
                  </div>
                  <span style="font-size: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 10px; border-radius: 4px; font-weight: 700;">
                    فاينل مطلوب لـ ${c.targetGrade}: ${c.requiredFinal.toFixed(1)} / ${c.finalMax}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    resultBox.innerHTML = simulationHtml;
    resultBox.style.display = 'block';
    if (window.SOUNDS) window.SOUNDS.playClick();
    if (window.APP) window.APP.showToast('تم إجراء الحساب الأكاديمي الواقعي والمفصل للمعدل', 'info');
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  },

  exportTranscript() {
    const student = (window.AUTH && window.AUTH.currentUser) || window.APP_DATA.student || {};
    const univ = this.universityName || student.university || "الجامعة";
    const scale = this.gpaScale || 5.00;
    const currentGpa = document.getElementById('gpa-main-val') ? document.getElementById('gpa-main-val').textContent : '0.00';

    let text = `=======================================================\n`;
    text += `${univ} - السجل الأكاديمي الموحد\n`;
    text += `اسم الطالب: ${student.name || 'الطالب'}\n`;
    text += `الرقم الجامعي: ${student.studentId || ''}\n`;
    text += `الكلية: ${this.collegeName || student.college || 'كلية علوم الحاسب والمعلومات'}\n`;
    text += `المعدل التراكمي المحسوب: ${currentGpa} / ${scale.toFixed(2)}\n`;
    text += `الساعات السابقة: ${this.previousCredits} ساعة | المعدل السابق: ${this.previousGpa.toFixed(2)}\n`;
    text += `=======================================================\n\n`;
    text += `المقررات المسجلة والدرجات التفصيلية:\n`;
    if (this.courses.length === 0) {
      text += `(لا توجد مقررات مسجلة لهذا الفصل حتى الآن)\n`;
    } else {
      this.courses.forEach(c => {
        const total = this.calculateCourseTotal(c);
        const grade = this.getLetterGradeAndPoint(total);
        text += `- [${c.code}] ${c.name} (${c.credits} ساعات): ${total.toFixed(1)}% -> تقدير (${grade.letter})\n`;
      });
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Transcript_${Date.now()}.txt`;
    a.click();
    window.APP.showToast('تم تصدير السجل الأكاديمي بنجاح', 'success');
  }
};
