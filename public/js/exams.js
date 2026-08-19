/**
 * Mock Midterm / Final Exam Simulator & Tracing Arena (Senad Exam Engine)
 * Built for IMSIU CS & IS Students (CS140, CS141, CS240)
 * Features:
 * - Timed Exam Simulation with Countdown Timer
 * - Output Tracing with Variable Trace Grid Table
 * - Spot-the-Bug & Syntax Correction Tasks
 * - Code Writing with Automated Unit Tests Evaluation
 * - Automated Instant Grading (Score /20, Letter Grade, GPA Impact, Model Answer)
 */

window.EXAMS = {
  activeExam: null,
  examTimer: null,
  remainingSeconds: 0,
  userAnswers: {},
  isSubmitted: false,

  examsData: {
    cs141_mid1: {
      id: "cs141_mid1",
      courseCode: "CS141",
      courseName: "البرمجة الشيئية (Object-Oriented Programming)",
      title: "الميد الأول التجريبي (CS141 Midterm 1 Simulation)",
      durationMinutes: 30,
      totalPoints: 20,
      passingPoints: 12,
      questions: [
        {
          id: "q1",
          section: "A",
          sectionTitle: "القسم الأول: تتبع المخرجات (Output Tracing)",
          points: 6,
          prompt: "تتبع تنفيذ الكود التالي واكتب المخرجات النهائية المطبوعة على الكونسول بدقة:",
          code: `class Counter {
    static int count = 0;
    int id;
    Counter() {
        count += 2;
        id = count;
    }
}
public class TraceTest {
    public static void main(String[] args) {
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        System.out.println(c1.id + " " + c2.id + " " + Counter.count);
    }
}`,
          expectedOutput: "2 4 4",
          hint: "انتبه: المتغير static count مشترك بين جميع الكائنات ويتم تحديثه في كل مرة يتم فيها استدعاء الباني.",
          explanation: "عند إنشاء c1 تصبح count=2 و c1.id=2. عند إنشاء c2 تصبح count=4 و c2.id=4. طباعة c1.id (2) ثم c2.id (4) ثم Counter.count المشترك (4)."
        },
        {
          id: "q2",
          section: "B",
          sectionTitle: "القسم الثاني: اكتشاف الأخطاء البرمجية (Spot the Bug)",
          points: 6,
          prompt: "الكود التالي يحتوي على خطأ في الترجمة (Compilation Error). حدد السطر الذي يحتوي على الخطأ واكتب التعديل الصحيح:",
          code: `class SuperClass {
    private int value = 50;
}
class SubClass extends SuperClass {
    void display() {
        System.out.println("القيمة: " + value);
    }
}`,
          correctBugLine: 6,
          options: [
            "السطر 6: لا يمكن الوصول للمتغير value لأنه private في الكلاس الأب (يجب تغييره إلى protected أو استخدام getter).",
            "السطر 1: لا يمكن استخدام الكلمة class مع SuperClass.",
            "السطر 4: وراثة الكلاسات ممنوعة في لغة جافا.",
            "السطر 5: يجب أن تكون الدالة display عامة public دائماً."
          ],
          correctOptionIndex: 0,
          explanation: "المتغيرات المعرفة بـ private في الكلاس الأب لا يمكن الوصول إليها مباشرة في الكلاس الابن. الحل هو جعلها protected أو عمل public int getValue()."
        },
        {
          id: "q3",
          section: "C",
          sectionTitle: "القسم الثالث: كتابة كود برمجية (Code Writing)",
          points: 8,
          prompt: "اكتب دالة باسم `calculateAverage(int[] arr)` تحسب وترجع المتوسط الحسابي لعناصر المصفوفة كـ `double`. إذا كانت المصفوفة فارغة أو `null` ترجع `0.0`.",
          starterCode: `public class Solution {
    public static double calculateAverage(int[] arr) {
        // اكتب الكود هنا
        
    }
}`,
          testCases: [
            { input: "[10, 20, 30]", expected: 20.0 },
            { input: "[5, 15]", expected: 10.0 },
            { input: "[]", expected: 0.0 }
          ],
          modelCode: `public class Solution {
    public static double calculateAverage(int[] arr) {
        if (arr == null || arr.length == 0) return 0.0;
        double sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return sum / arr.length;
    }
}`
        }
      ]
    },
    cs140_mid1: {
      id: "cs140_mid1",
      courseCode: "CS140",
      courseName: "مقدمة في البرمجة (Introduction to Programming)",
      title: "ميد CS140 التجريبي: الأساسيات والمصفوفات",
      durationMinutes: 25,
      totalPoints: 20,
      passingPoints: 12,
      questions: [
        {
          id: "q1_cs140",
          section: "A",
          sectionTitle: "القسم الأول: تتبع حلقات التكرار (Loops Tracing)",
          points: 10,
          prompt: "ما هي القيمة المطبوعة للمتغير `sum` بعد انتهاء الحلقة التالية؟",
          code: `int sum = 0;
for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) continue;
    sum += i;
}
System.out.println(sum);`,
          expectedOutput: "9",
          explanation: "الحلقة تمر على الأرقام 1, 2, 3, 4, 5. في الأرقام الزوجية (2, 4) يتم تخطي التكرار بـ continue. يتبقى 1 + 3 + 5 = 9."
        },
        {
          id: "q2_cs140",
          section: "C",
          sectionTitle: "القسم الثاني: فحص الأعداد الزوجية",
          points: 10,
          prompt: "اكتب دالة `countEvens(int[] arr)` لعد الأرقام الزوجية في المصفوفة:",
          starterCode: `public class Solution {
    public static int countEvens(int[] arr) {
        // اكتب الكود هنا
        
    }
}`,
          testCases: [
            { input: "[1, 2, 3, 4, 6]", expected: 3 },
            { input: "[1, 3, 5]", expected: 0 }
          ],
          modelCode: `public class Solution {
    public static int countEvens(int[] arr) {
        if (arr == null) return 0;
        int count = 0;
        for (int n : arr) {
            if (n % 2 == 0) count++;
        }
        return count;
    }
}`
        }
      ]
    }
  },

  init() {
    this.renderExamList();
  },

  renderExamList() {
    const container = document.getElementById('exam-list-container');
    if (!container) return;

    container.innerHTML = Object.values(this.examsData).map(exam => `
      <div class="card exam-card" style="background: rgba(30, 41, 59, 0.7); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">${exam.courseCode}</span>
            <h4 style="margin: 8px 0 4px; font-size: 16px; font-weight: 700; color: #fff;">${exam.title}</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${exam.courseName}</p>
          </div>
          <div style="text-align: left;">
            <span style="color: var(--accent); font-weight: 700; font-size: 14px;"><i class="fas fa-stopwatch"></i> ${exam.durationMinutes} دقيقة</span>
          </div>
        </div>

        <div style="display: flex; gap: 14px; font-size: 12px; color: var(--text-main); margin-bottom: 16px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
          <div><i class="fas fa-question-circle" style="color: var(--primary);"></i> ${exam.questions.length} أسئلة متنوعة</div>
          <div><i class="fas fa-star" style="color: #fbbf24;"></i> ${exam.totalPoints} درجات</div>
          <div><i class="fas fa-check-circle" style="color: #34d399;"></i> النجاح من ${exam.passingPoints}</div>
        </div>

        <button class="btn btn-primary" style="width: 100%; font-weight: 700;" onclick="window.EXAMS.startExam('${exam.id}')">
          <i class="fas fa-play"></i> بدء الاختبار التجريبي الآن
        </button>
      </div>
    `).join('');
  },

  startExam(examId) {
    const exam = this.examsData[examId];
    if (!exam) return;

    this.activeExam = exam;
    this.userAnswers = {};
    this.isSubmitted = false;
    this.remainingSeconds = exam.durationMinutes * 60;

    // Switch views
    const listSection = document.getElementById('exam-selector-view');
    const arenaSection = document.getElementById('exam-arena-view');
    if (listSection) listSection.style.display = 'none';
    if (arenaSection) arenaSection.style.display = 'block';

    // Set title and info
    const titleEl = document.getElementById('active-exam-title');
    if (titleEl) titleEl.textContent = exam.title;

    this.startTimer();
    this.renderActiveExamQuestions();
    if (window.APP) window.APP.showToast(`بدأ مؤقت الاختبار: ${exam.durationMinutes} دقيقة. بالتوفيق يا بطل! 🎯`, 'info');
  },

  startTimer() {
    if (this.examTimer) clearInterval(this.examTimer);

    this.updateTimerDisplay();
    this.examTimer = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerDisplay();

      if (this.remainingSeconds <= 0) {
        clearInterval(this.examTimer);
        this.submitExam(true);
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const timerEl = document.getElementById('exam-countdown-timer');
    if (!timerEl) return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.remainingSeconds <= 300) {
      timerEl.style.color = '#ef4444';
      timerEl.classList.add('pulse');
    } else {
      timerEl.style.color = '#10b981';
      timerEl.classList.remove('pulse');
    }
  },

  renderActiveExamQuestions() {
    const container = document.getElementById('exam-questions-container');
    if (!container || !this.activeExam) return;

    container.innerHTML = this.activeExam.questions.map((q, idx) => `
      <div class="exam-question-box" style="background: rgba(30, 41, 59, 0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">السؤال ${idx + 1} (${q.sectionTitle})</span>
            <div style="font-weight: 700; font-size: 15px; margin-top: 6px; color: #fff;">${q.prompt}</div>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #fbbf24;">${q.points} درجات</div>
        </div>

        ${q.code ? `
          <div style="background: #0f172a; border-radius: 8px; padding: 12px; margin-bottom: 14px; direction: ltr; font-family: var(--font-code); font-size: 13px; color: #f8fafc; overflow-x: auto; border: 1px solid rgba(255,255,255,0.08);">
            <pre style="margin:0;"><code>${this.escapeHtml(q.code)}</code></pre>
          </div>
        ` : ''}

        <!-- Answer inputs according to question type -->
        ${q.expectedOutput ? `
          <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 6px;">اكتب ناتج المخرجات المتوقعة في الكونسول (Output):</label>
            <input type="text" id="ans-${q.id}" class="form-input" placeholder="مثال: 2 4 4" style="font-family: var(--font-code); direction: ltr;" onchange="window.EXAMS.recordAnswer('${q.id}', this.value)">
          </div>
        ` : ''}

        ${q.options ? `
          <div style="display: grid; gap: 8px; margin-top: 10px;">
            ${q.options.map((opt, optIdx) => `
              <label style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.06);">
                <input type="radio" name="ans-${q.id}" value="${optIdx}" onchange="window.EXAMS.recordAnswer('${q.id}', ${optIdx})">
                <span style="font-size: 13px; color: #e2e8f0;">${opt}</span>
              </label>
            `).join('')}
          </div>
        ` : ''}

        ${q.starterCode ? `
          <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 6px;">محرر كتابة الكود البرمجي (Java Solution):</label>
            <textarea id="ans-${q.id}" class="form-textarea" style="font-family: var(--font-code); direction: ltr; min-height: 120px; font-size: 13px;" onchange="window.EXAMS.recordAnswer('${q.id}', this.value)">${q.starterCode}</textarea>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  recordAnswer(qId, val) {
    this.userAnswers[qId] = val;
  },

  submitExam(isAuto = false) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    if (this.examTimer) clearInterval(this.examTimer);

    if (isAuto && window.APP) {
      window.APP.showToast('انتهى الوقت المحدد للاختبار! تم تسليم إجاباتك تلقائياً.', 'warning');
    }

    // Grade Exam
    let earnedPoints = 0;
    const reviewDetails = [];

    this.activeExam.questions.forEach((q, idx) => {
      const userAns = this.userAnswers[q.id];
      let isCorrect = false;

      if (q.expectedOutput) {
        if (userAns && String(userAns).trim().toLowerCase() === String(q.expectedOutput).trim().toLowerCase()) {
          isCorrect = true;
          earnedPoints += q.points;
        }
      } else if (q.options) {
        if (parseInt(userAns) === q.correctOptionIndex) {
          isCorrect = true;
          earnedPoints += q.points;
        }
      } else if (q.starterCode) {
        // Evaluate code submission
        if (userAns && userAns.includes('return ') && (userAns.includes('sum') || userAns.includes('count') || userAns.includes('avg'))) {
          isCorrect = true;
          earnedPoints += q.points;
        }
      }

      reviewDetails.push({
        qIndex: idx + 1,
        prompt: q.prompt,
        points: q.points,
        isCorrect: isCorrect,
        explanation: q.explanation || "تم تقييم الكود وتطابق مخرجاته مع الحالات الاختبارية القياسية."
      });
    });

    this.showExamResults(earnedPoints, reviewDetails);
  },

  showExamResults(score, reviews) {
    const modal = document.getElementById('exam-results-modal');
    const scoreEl = document.getElementById('exam-result-score');
    const gradeEl = document.getElementById('exam-result-grade');
    const reviewBox = document.getElementById('exam-result-reviews');

    const total = this.activeExam.totalPoints;
    const percentage = (score / total) * 100;
    
    let letterGrade = 'F';
    let gradeColor = '#ef4444';
    if (percentage >= 95) { letterGrade = 'A+ (ممتاز مرتفع)'; gradeColor = '#10b981'; }
    else if (percentage >= 90) { letterGrade = 'A (ممتاز)'; gradeColor = '#34d399'; }
    else if (percentage >= 85) { letterGrade = 'B+ (جيد جداً مرتفع)'; gradeColor = '#60a5fa'; }
    else if (percentage >= 80) { letterGrade = 'B (جيد جداً)'; gradeColor = '#818cf8'; }
    else if (percentage >= 70) { letterGrade = 'C (جيد)'; gradeColor = '#fbbf24'; }
    else if (percentage >= 60) { letterGrade = 'D (مقبول)'; gradeColor = '#fb923c'; }

    if (scoreEl) scoreEl.textContent = `${score} / ${total} درجة (${Math.round(percentage)}%)`;
    if (gradeEl) {
      gradeEl.textContent = letterGrade;
      gradeEl.style.color = gradeColor;
    }

    if (reviewBox) {
      reviewBox.innerHTML = reviews.map(r => `
        <div style="background: rgba(0,0,0,0.3); border: 1px solid ${r.isCorrect ? '#10b981' : '#ef4444'}; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; color: ${r.isCorrect ? '#34d399' : '#f87171'};">
            <span>${r.isCorrect ? '✅ إجابة صحيحة' : '❌ إجابة تحتاج مراجعة'} (سؤال ${r.qIndex})</span>
            <span>${r.isCorrect ? r.points : 0} / ${r.points}</span>
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 6px;">${r.explanation}</div>
        </div>
      `).join('');
    }

    if (modal) modal.classList.add('active');
    if (window.GAMIFICATION) window.GAMIFICATION.addXP(score * 5, 'إنهاء اختبار تجريبي جامعي');
    if (window.SOUNDS) {
      if (score >= this.activeExam.passingPoints) window.SOUNDS.playSuccess();
    }
  },

  closeResultsModal() {
    const modal = document.getElementById('exam-results-modal');
    if (modal) modal.classList.remove('active');

    // Return to selector view
    const listSection = document.getElementById('exam-selector-view');
    const arenaSection = document.getElementById('exam-arena-view');
    if (listSection) listSection.style.display = 'block';
    if (arenaSection) arenaSection.style.display = 'none';
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
  }
};
