/**
 * Enhanced Course & Multi-Semester Saudi GPA Tracker
 * Saudi 5.00 / 4.00 scale, cumulative calculations, and transcript exporter.
 */

window.TRACKER = {
  courses: [],
  gpaScale: 5.00,
  previousGpa: 4.78,
  previousCredits: 48,
  universityName: "الجامعة",
  collegeName: "كلية علوم الحاسب والمعلومات",

  init() {
    this.courses = [...window.APP_DATA.courses];
    this.syncWithCurrentStudent();
    this.renderCoursesTable();
    this.updateGPACalculations();
  },

  syncWithCurrentStudent() {
    const student = (window.AUTH && window.AUTH.currentUser) || window.APP_DATA.student || (window.APP_DATA.profiles && window.APP_DATA.profiles.imsiu_cs) || {};
    this.universityName = student.university || "جامعة الإمام محمد بن سعود الإسلامية";
    this.collegeName = student.college || "كلية علوم الحاسب والمعلومات";
    this.gpaScale = student.gpaScale || 5.00;
    this.previousGpa = (typeof student.previousGpa !== 'undefined') ? student.previousGpa : (student.gpa || (this.gpaScale === 4.00 ? 3.85 : 4.78));
    this.previousCredits = student.previousCredits || (this.gpaScale === 4.00 ? 64 : 48);

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
    return (c.midterm1 || 0) + (c.midterm2 || 0) + (c.quizzes || 0) + 
           (c.assignments || 0) + (c.project || 0) + (c.finalExam || 0);
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

    tbody.innerHTML = this.courses.map((c, index) => {
      const total = this.calculateCourseTotal(c);
      const gradeInfo = this.getLetterGradeAndPoint(total);
      const badgeClass = `grade-${gradeInfo.letter.replace('+', '-plus')}`;

      return `
        <tr>
          <td style="font-weight: 700;">
            <div style="font-family: var(--font-code); color: var(--primary);">${c.code}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${c.name}</div>
          </td>
          <td>${c.credits} ساعات</td>
          <td>${c.midterm1}/20</td>
          <td>${c.midterm2}/20</td>
          <td>${c.quizzes}/10</td>
          <td>${c.assignments}/10</td>
          <td>${c.project}/10</td>
          <td>${c.finalExam}/30</td>
          <td style="font-weight: 800; font-size: 14px;">${total.toFixed(1)}%</td>
          <td>
            <span class="grade-badge ${badgeClass}">${gradeInfo.letter} (${gradeInfo.points.toFixed(2)})</span>
          </td>
          <td>
            <button class="icon-btn btn-sm" onclick="window.TRACKER.deleteCourse(${index})" title="حذف المادة">
              <i class="fas fa-trash" style="color: var(--danger); font-size: 11px;"></i>
            </button>
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
      currentSemesterPoints += gradeInfo.points * c.credits;
      currentSemesterCredits += c.credits;
    });

    const semesterGpa = currentSemesterCredits > 0 ? (currentSemesterPoints / currentSemesterCredits) : 0;

    // Cumulative calculation:
    const prevPoints = this.previousGpa * this.previousCredits;
    const totalCumulativePoints = prevPoints + currentSemesterPoints;
    const totalCumulativeCredits = this.previousCredits + currentSemesterCredits;
    const cumulativeGpa = totalCumulativeCredits > 0 ? (totalCumulativePoints / totalCumulativeCredits) : 0;
    
    // Update DOM
    const gpaValEl = document.getElementById('gpa-main-val');
    const gpaSemesterEl = document.getElementById('gpa-semester-val');
    const gpaTotalCreditsEl = document.getElementById('gpa-total-credits');
    const gpaPercentEl = document.getElementById('gpa-progress-ring');
    const headerGpaEl = document.getElementById('header-gpa-badge');

    if (gpaValEl) gpaValEl.textContent = cumulativeGpa.toFixed(2);
    if (gpaSemesterEl) gpaSemesterEl.textContent = `المعدل الفصلي الحالي: ${semesterGpa.toFixed(2)}`;
    if (gpaTotalCreditsEl) gpaTotalCreditsEl.textContent = `${totalCumulativeCredits} ساعة إجمالية (${currentSemesterCredits} الفصل الحالي)`;
    if (headerGpaEl) headerGpaEl.textContent = `${cumulativeGpa.toFixed(2)} / ${this.gpaScale.toFixed(2)}`;

      // Update SVG stroke offset
      if (gpaPercentEl) {
        const maxGpa = this.gpaScale;
        const progress = (cumulativeGpa / maxGpa);
        const circumference = 2 * Math.PI * 54;
        gpaPercentEl.style.strokeDashoffset = circumference * (1 - progress);
      }

      // Persist courses locally and to server-side database
      try {
        localStorage.setItem('senad_student_courses', JSON.stringify(this.courses));
        const student = (window.AUTH && window.AUTH.currentUser) || {};
        if (student.email && window.API && typeof window.API.saveCoursesToDB === 'function') {
          window.API.saveCoursesToDB(student.email, this.courses);
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

  openAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) modal.classList.add('active');
  },

  closeAddCourseModal() {
    const modal = document.getElementById('add-course-modal');
    if (modal) modal.classList.remove('active');
  },

  saveNewCourse() {
    const code = document.getElementById('new-course-code').value.trim();
    const name = document.getElementById('new-course-name').value.trim();
    const credits = parseInt(document.getElementById('new-course-credits').value) || 3;
    const m1 = parseFloat(document.getElementById('new-course-m1').value) || 0;
    const m2 = parseFloat(document.getElementById('new-course-m2').value) || 0;
    const q = parseFloat(document.getElementById('new-course-quizzes').value) || 0;
    const assign = parseFloat(document.getElementById('new-course-assign').value) || 0;
    const proj = parseFloat(document.getElementById('new-course-project').value) || 0;
    const finalEx = parseFloat(document.getElementById('new-course-final').value) || 0;

    if (!code || !name) {
      window.APP.showToast('يرجى كتابة رمز واسم المادة', 'warning');
      return;
    }

    const newCourse = {
      id: `course_${Date.now()}`,
      code: code,
      name: name,
      credits: credits,
      midterm1: m1,
      midterm2: m2,
      quizzes: q,
      assignments: assign,
      project: proj,
      finalExam: finalEx
    };

    this.courses.push(newCourse);
    this.renderCoursesTable();
    this.updateGPACalculations();
    this.closeAddCourseModal();
    window.GAMIFICATION.addXP(30, 'إضافة مادة أكاديمية جديدة');
    if (window.SOUNDS) window.SOUNDS.playSuccess();
    if (window.CONFETTI) window.CONFETTI.launch(30);
    window.APP.showToast('تمت إضافة المادة وحساب المعدل بنجاح! (+30 XP)', 'success');
  },

  /**
   * Realistic Mathematical Saudi University GPA Goal Simulator & Optimizer Engine
   */
  simulateTargetGPA() {
    const targetGpa = parseFloat(document.getElementById('target-gpa-input').value) || 4.95;
    const resultBox = document.getElementById('target-gpa-result');
    if (!resultBox) return;

    const prevGpa = this.previousGpa || 4.78;
    const prevCredits = this.previousCredits || 48;
    const maxScale = this.gpaScale || 5.00;
    
    let currentSemesterCredits = 0;
    this.courses.forEach(c => { currentSemesterCredits += (c.credits || 3); });
    if (currentSemesterCredits === 0) currentSemesterCredits = 16;

    const totalCredits = prevCredits + currentSemesterCredits;
    const prevPoints = prevGpa * prevCredits;
    const targetTotalPoints = targetGpa * totalCredits;
    const requiredSemesterPoints = targetTotalPoints - prevPoints;
    const requiredSemesterGpa = requiredSemesterPoints / currentSemesterCredits;

    const maxSemesterPoints = maxScale * currentSemesterCredits;
    const maxCumulativePoints = prevPoints + maxSemesterPoints;
    const maxAchievableGpaThisSemester = maxCumulativePoints / totalCredits;

    // Course by course realistic analysis based on actual coursework (out of 70)
    let optimizedSemesterPoints = 0;
    const courseBreakdown = this.courses.map(c => {
      const credits = c.credits || 3;
      const currentWork = (c.midterm1 || 0) + (c.midterm2 || 0) + (c.quizzes || 0) + (c.assignments || 0) + (c.project || 0);
      
      // Calculate realistic target letter grade & required final exam score
      let targetGrade = "A+";
      let gradePoint = (maxScale === 4.00) ? 4.00 : 5.00;
      let minTotalForGrade = 95;
      let requiredFinal = minTotalForGrade - currentWork;

      if (requiredFinal > 30) {
        // A+ not possible, target A (90+)
        targetGrade = "A";
        gradePoint = (maxScale === 4.00) ? 3.75 : 4.75;
        minTotalForGrade = 90;
        requiredFinal = minTotalForGrade - currentWork;
      }

      if (requiredFinal > 30) {
        // A not possible, target B+ (85+)
        targetGrade = "B+";
        gradePoint = (maxScale === 4.00) ? 3.50 : 4.50;
        minTotalForGrade = 85;
        requiredFinal = minTotalForGrade - currentWork;
      }

      if (requiredFinal < 0) requiredFinal = 0;
      requiredFinal = Math.min(30, Math.max(0, requiredFinal));

      const expectedTotal = currentWork + requiredFinal;
      const earnedCoursePoints = gradePoint * credits;
      optimizedSemesterPoints += earnedCoursePoints;

      return {
        code: c.code,
        name: c.name,
        credits: credits,
        currentWork: currentWork,
        targetGrade: targetGrade,
        gradePoint: gradePoint,
        requiredFinal: requiredFinal,
        expectedTotal: expectedTotal,
        earnedCoursePoints: earnedCoursePoints
      };
    });

    const realisticSemesterGpa = optimizedSemesterPoints / currentSemesterCredits;
    const realisticNewCumulativeGpa = (prevPoints + optimizedSemesterPoints) / totalCredits;

    let simulationHtml = "";

    if (requiredSemesterGpa > maxScale) {
      // Mathematically impossible in one semester alone -> provide multi-semester trajectory
      const futureHoursNeeded = (targetGpa * totalCredits - maxCumulativePoints) / (maxScale - targetGpa);
      const futureSemesters = Math.max(1, Math.ceil(futureHoursNeeded / 16));

      simulationHtml = `
        <div style="background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.88)); border: 1.5px solid #f59e0b; padding: 20px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Status -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; font-size: 15px; color: #fbbf24; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-chart-pie"></i>
              <span>الحساب الأكاديمي الواقعي والمفصل للمعدل المستهدف (${targetGpa.toFixed(2)} / ${maxScale.toFixed(2)}):</span>
            </div>
            <span style="font-size: 11px; background: rgba(245, 158, 11, 0.2); color: #fde047; padding: 4px 12px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.4);">
              ${this.escapeHtml(this.universityName)} (مقياس ${maxScale.toFixed(2)})
            </span>
          </div>

          <!-- Mathematical Reality Alert -->
          <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-bottom: 16px; color: #fef08a;">
            <div style="font-weight: 700; margin-bottom: 4px; font-size: 14px;">📌 التحليل الرياضي الدقيق:</div>
            بناءً على سجلك الأكاديمي (معدل سابق <strong>${prevGpa.toFixed(2)}</strong> لـ <strong>${prevCredits}</strong> ساعة):<br>
            - للوصول لمعدل <strong>${targetGpa.toFixed(2)}</strong> في هذا الفصل وحده، ستحتاج معدلاً فصلياً قدره <strong>(${requiredSemesterGpa.toFixed(2)})</strong>، وهو أعلى من الحد الأقصى للنظام (${maxScale.toFixed(2)}).<br>
            - لذلك، قمنا بحساب <strong>خطة التميز القصوى الواقعية</strong> بناءً على درجات أعمال سنتك الفعلية في كل مادة.
          </div>

          <!-- Summary Metric Cards -->
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

          <!-- Detailed Course Final Exam Targets Table -->
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-list-check" style="color: var(--primary);"></i> الدرجات الدقيقة المطلوبة في الاختبار النهائي (من 30) لكل مادة:
          </div>

          <div style="display: grid; gap: 8px;">
            ${courseBreakdown.map(c => `
              <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #38bdf8; font-family: var(--font-code); font-size: 13px;">${c.code}</strong>
                    <span style="color: #f1f5f9; font-size: 13px; font-weight: 600;">${c.name}</span>
                    <span style="font-size: 11px; background: rgba(255,255,255,0.08); color: #94a3b8; padding: 1px 6px; border-radius: 4px;">${c.credits} ساعات</span>
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
                    أعمال السنة الحالية: <strong style="color: #fef08a;">${c.currentWork.toFixed(1)} / 70</strong> ➔ المجموع النهائي المتوقع: <strong style="color: #6ee7b7;">${c.expectedTotal.toFixed(1)}%</strong>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-size: 12px; background: ${c.targetGrade === 'A+' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${c.targetGrade === 'A+' ? '#34d399' : '#60a5fa'}; padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid ${c.targetGrade === 'A+' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};">
                    فاينل مطلوب لـ ${c.targetGrade}: <strong>${c.requiredFinal.toFixed(1)} / 30</strong>
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Fully achievable in this current semester
      simulationHtml = `
        <div style="background: linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95)); border: 1.5px solid var(--primary); padding: 20px; border-radius: var(--radius-md); font-size: 13px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="font-weight: 800; font-size: 15px; color: #34d399; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle"></i>
            <span>الهدف متاح وقابل للتحقيق هذا الفصل بنجاح في ${this.escapeHtml(this.universityName)}! 🎯</span>
          </div>
          <div style="color: #cbd5e1; margin-bottom: 14px;">
            للوصول إلى معدل تراكمي <strong>${targetGpa.toFixed(2)}</strong>، تحتاج إلى معدل فصلي قدره <strong>${requiredSemesterGpa.toFixed(2)} / ${maxScale.toFixed(2)}</strong> هذا الفصل.
          </div>
          
          <!-- Detailed Course Final Targets -->
          <div style="display: grid; gap: 8px;">
            ${courseBreakdown.map(c => `
              <div style="background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #38bdf8;">${c.code}</strong> - ${c.name} (${c.credits} ساعات)
                  <div style="font-size: 11px; color: #94a3b8;">أعمال السنة: ${c.currentWork.toFixed(1)}/70</div>
                </div>
                <span style="font-size: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 4px 10px; border-radius: 4px; font-weight: 700;">
                  فاينل مطلوب لـ ${c.targetGrade}: ${c.requiredFinal.toFixed(1)} / 30
                </span>
              </div>
            `).join('')}
          </div>
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
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  exportTranscript() {
    const student = (window.AUTH && window.AUTH.currentUser) || window.APP_DATA.student || {};
    const univ = this.universityName || student.university || "الجامعة";
    const scale = this.gpaScale || 5.00;

    let text = `=======================================================\n`;
    text += `${univ} - السجل الأكاديمي الموحد\n`;
    text += `اسم الطالب: ${student.name || 'الطالب'}\n`;
    text += `الرقم الجامعي: ${student.studentId || ''}\n`;
    text += `الكلية: ${this.collegeName || student.college || 'كلية علوم الحاسب والمعلومات'}\n`;
    text += `المعدل التراكمي: ${document.getElementById('gpa-main-val').textContent} / ${scale.toFixed(2)}\n`;
    text += `=======================================================\n\n`;
    text += `المقررات المسجلة والدرجات التفصيلية:\n`;
    this.courses.forEach(c => {
      const total = this.calculateCourseTotal(c);
      const grade = this.getLetterGradeAndPoint(total);
      text += `- [${c.code}] ${c.name} (${c.credits} ساعات): ${total.toFixed(1)}% -> تقدير (${grade.letter})\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Transcript_${Date.now()}.txt`;
    a.click();
    window.APP.showToast('تم تصدير السجل الأكاديمي بنجاح', 'success');
  }
};
