/**
 * Enhanced Data Store for Smart Java University Tutor (IMSIU)
 * Contains student profiles, curriculums, sample codes, mock exams, and security policies.
 */

window.APP_DATA = {
  // Multi-University Demo Student Profiles
  profiles: {
    imsiu_cs: {
      name: "عبدالرحمن الشمري",
      studentId: "441019284",
      email: "441019284@sm.imamu.edu.sa",
      university: "جامعة الإمام محمد بن سعود الإسلامية",
      college: "كلية علوم الحاسب والمعلومات",
      major: "علوم الحاسب (Computer Science)",
      level: "المستوى الرابع",
      gpa: 4.82,
      previousGpa: 4.78,
      previousCredits: 48,
      currentCredits: 16,
      gpaScale: 5.00,
      xp: 2850,
      levelNumber: 7,
      streakDays: 12,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "أكملت 20 تحليلاً برمجياً ناجحاً", unlocked: true },
        { id: "oop_master", name: "مهندس الكائنات OOP", icon: "🏛️", desc: "أتقنت مفاهيم الوراثة والبوليمورفيزم", unlocked: true },
        { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في 10 كويزات متتالية", unlocked: true },
        { id: "slide_guru", name: "قاهر السلايدات", icon: "📚", desc: "لخصت 5 محاضرات جامعية كاملة", unlocked: true },
        { id: "security_sentinel", name: "حارس الخصوصية PDPL", icon: "🛡️", desc: "فعلت التحقق الثنائي والمصادقة الموحدة", unlocked: true }
      ]
    },
    ksu_swe: {
      name: "فيصل بن سلطان الدوسري",
      studentId: "442018392",
      email: "faisal@ksu.edu.sa",
      university: "جامعة الملك سعود (KSU)",
      college: "كلية علوم الحاسب والمعلومات",
      major: "هندسة البرمجيات (Software Engineering)",
      level: "المستوى الخامس",
      gpa: 4.91,
      previousGpa: 4.88,
      previousCredits: 64,
      currentCredits: 15,
      gpaScale: 5.00,
      xp: 3200,
      levelNumber: 8,
      streakDays: 15,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "أكملت 20 تحليلاً برمجياً ناجحاً", unlocked: true },
        { id: "oop_master", name: "مهندس الكائنات OOP", icon: "🏛️", desc: "أتقنت مفاهيم الوراثة والبوليمورفيزم", unlocked: true },
        { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في 10 كويزات متتالية", unlocked: true }
      ]
    },
    kfupm_ai: {
      name: "عمر بن خالد الغامدي",
      studentId: "202148290",
      email: "omar@kfupm.edu.sa",
      university: "جامعة الملك فهد للبترول والمعادن (KFUPM)",
      college: "كلية علوم وهندسة الحاسب",
      major: "الذكاء الاصطناعي (Artificial Intelligence)",
      level: "السنة الثالثة",
      gpa: 3.94,
      previousGpa: 3.90,
      previousCredits: 70,
      currentCredits: 16,
      gpaScale: 4.00,
      xp: 3850,
      levelNumber: 9,
      streakDays: 21,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "أكملت 20 تحليلاً برمجياً ناجحاً", unlocked: true },
        { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في 10 كويزات متتالية", unlocked: true }
      ]
    },
    pnu_is: {
      name: "نورة بنت فهد السبيعي",
      studentId: "442091823",
      email: "noura@pnu.edu.sa",
      university: "جامعة الأميرة نورة (PNU)",
      college: "كلية علوم الحاسب والمعلومات",
      major: "نظم المعلومات (Information Systems)",
      level: "المستوى السادس",
      gpa: 4.96,
      previousGpa: 4.94,
      previousCredits: 78,
      currentCredits: 17,
      gpaScale: 5.00,
      xp: 3600,
      levelNumber: 8,
      streakDays: 18,
      badges: [
        { id: "java_pioneer", name: "رائد لغة جافا", icon: "☕", desc: "أكملت 20 تحليلاً برمجياً ناجحاً", unlocked: true },
        { id: "slide_guru", name: "قاهر السلايدات", icon: "📚", desc: "لخصت 5 محاضرات جامعية كاملة", unlocked: true }
      ]
    },
    kau_cyber: {
      name: "روان بنت هاني الزهراني",
      studentId: "2104928",
      email: "rawan@kau.edu.sa",
      university: "جامعة الملك عبدالعزيز (KAU)",
      college: "كلية الحاسبات وتقنية المعلومات",
      major: "الأمن السيبراني (Cybersecurity)",
      level: "السنة الرابعة",
      gpa: 4.88,
      previousGpa: 4.82,
      previousCredits: 88,
      currentCredits: 15,
      gpaScale: 5.00,
      xp: 3100,
      levelNumber: 7,
      streakDays: 14,
      badges: [
        { id: "security_sentinel", name: "حارس الخصوصية PDPL", icon: "🛡️", desc: "فعلت التحقق الثنائي والمصادقة الموحدة", unlocked: true },
        { id: "quiz_champ", name: "بطل الكويزات", icon: "🎯", desc: "حققت 100% في 10 كويزات متتالية", unlocked: true }
      ]
    }
  },

  student: null, // Initialized dynamically on auth

  // Sample Java Codes for Analysis & Execution
  sampleCodes: [
    {
      id: "bank_account_oop",
      title: "1. نظام الحساب البنكي (OOP & Encapsulation)",
      topic: "CS141 - البرمجة الشيئية",
      complexity: "O(1) وقت | O(1) ذاكرة",
      variables: [
        { name: "accountNumber", type: "String", val: '"SA98IMSIU1001"' },
        { name: "balance", type: "double", val: "1200.0" },
        { name: "ownerName", type: "String", val: '"عبدالرحمن"' }
      ],
      code: `public class BankAccount {
    private String accountNumber;
    private double balance;
    private String ownerName;

    public BankAccount(String accNum, String name, double initialBalance) {
        this.accountNumber = accNum;
        this.ownerName = name;
        if (initialBalance >= 0) {
            this.balance = initialBalance;
        } else {
            this.balance = 0.0;
        }
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("تم إيداع " + amount + " ريال. الرصيد الجديد: " + balance);
        } else {
            System.out.println("خطأ: مبلغ الإيداع يجب أن يكون موجباً!");
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("تم سحب " + amount + " ريال بنجاح. المتبقي: " + balance);
            return true;
        }
        System.out.println("عملية مرفوضة: الرصيد غير كافٍ أو المبلغ غير صالح!");
        return false;
    }

    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("SA98IMSIU1001", "عبدالرحمن", 1500.0);
        acc.deposit(500.0);
        acc.withdraw(800.0);
        System.out.println("الرصيد النهائي: " + acc.getBalance() + " ريال");
    }
}`
    },
    {
      id: "polymorphism_shapes",
      title: "2. تعدد الأشكال (Polymorphism & Abstract Class)",
      topic: "CS141 - تعدد الأشكال والوراثة",
      complexity: "O(N) وقت | O(N) ذاكرة",
      variables: [
        { name: "shapes[0]", type: "Circle", val: "Radius: 5.0, Color: أخضر" },
        { name: "shapes[1]", type: "Rectangle", val: "4.0x6.0, Color: أزرق" }
      ],
      code: `abstract class Shape {
    protected String color;

    public Shape(String color) {
        this.color = color;
    }

    public abstract double calculateArea();
    public abstract void draw();
}

class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }

    @Override
    public void draw() {
        System.out.println("رسم دائرة لونها " + color + " بنصف قطر: " + radius);
    }
}

class Rectangle extends Shape {
    private double width, height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return width * height;
    }

    @Override
    public void draw() {
        System.out.println("رسم مستطيل " + width + "x" + height + " لونه " + color);
    }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle("أخضر", 5.0),
            new Rectangle("أزرق", 4.0, 6.0)
        };

        for (Shape s : shapes) {
            s.draw();
            System.out.printf("المساحة: %.2f\\n", s.calculateArea());
        }
    }
}`
    },
    {
      id: "bst_data_structure",
      title: "3. شجرة البحث الثنائية (Binary Search Tree)",
      topic: "IS211 / CS212 - هياكل البيانات",
      complexity: "O(log N) بحث وإضافة | O(N) تكرار",
      variables: [
        { name: "root", type: "TreeNode", val: "Key: 50" },
        { name: "nodesCount", type: "int", val: "7" }
      ],
      code: `class TreeNode {
    int key;
    TreeNode left, right;

    public TreeNode(int item) {
        key = item;
        left = right = null;
    }
}

public class BinarySearchTree {
    TreeNode root;

    public void insert(int key) {
        root = insertRec(root, key);
    }

    private TreeNode insertRec(TreeNode root, int key) {
        if (root == null) {
            root = new TreeNode(key);
            return root;
        }
        if (key < root.key)
            root.left = insertRec(root.left, key);
        else if (key > root.key)
            root.right = insertRec(root.right, key);
        return root;
    }

    public void inorder() {
        inorderRec(root);
        System.out.println();
    }

    private void inorderRec(TreeNode root) {
        if (root != null) {
            inorderRec(root.left);
            System.out.print(root.key + " ");
            inorderRec(root.right);
        }
    }

    public static void main(String[] args) {
        BinarySearchTree bst = new BinarySearchTree();
        bst.insert(50);
        bst.insert(30);
        bst.insert(20);
        bst.insert(40);
        bst.insert(70);
        bst.insert(60);
        bst.insert(80);

        System.out.print("الترتيب التصاعدي (Inorder Traversal): ");
        bst.inorder();
    }
}`
    },
    {
      id: "recursion_fibonacci",
      title: "4. خوارزميات الاستدعاء الذاتي (Recursion & Memoization)",
      topic: "CS140 / CS141 - الخوارزميات المتقدمة",
      complexity: "O(N) وقت | O(N) ذاكرة",
      variables: [
        { name: "n", type: "int", val: "10" },
        { name: "fibResult", type: "long", val: "55" }
      ],
      code: `public class FibonacciCalculator {
    public static long fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        int terms = 8;
        System.out.print("متتالية فيبوناتشي لأول " + terms + " أرقام: ");
        for (int i = 0; i < terms; i++) {
            System.out.print(fib(i) + " ");
        }
        System.out.println();
    }
}`
    }
  ],

  // Registered University Courses
  courses: [
    {
      id: "CS141",
      code: "CS 141",
      name: "البرمجة الشيئية بلغة جافا (Object-Oriented Programming)",
      credits: 4,
      instructor: "د. خالد السعيد",
      midterm1: 19.5,
      midterm2: 18.0,
      quizzes: 9.5,
      assignments: 10.0,
      project: 10.0,
      finalExam: 28.5,
      letterGrade: "A+",
      gradePoint: 5.00
    },
    {
      id: "IS211",
      code: "IS 211",
      name: "هياكل البيانات والخوارزميات (Data Structures & Algorithms)",
      credits: 3,
      instructor: "د. محمد القحطاني",
      midterm1: 18.0,
      midterm2: 17.5,
      quizzes: 9.0,
      assignments: 9.5,
      project: 9.5,
      finalExam: 27.0,
      letterGrade: "A",
      gradePoint: 4.75
    },
    {
      id: "CS240",
      code: "CS 240",
      name: "قواعد البيانات ونظم إدارتها (Database Systems)",
      credits: 3,
      instructor: "د. عبدالمحسن العتيبي",
      midterm1: 19.0,
      midterm2: 19.0,
      quizzes: 10.0,
      assignments: 10.0,
      project: 9.5,
      finalExam: 29.0,
      letterGrade: "A+",
      gradePoint: 5.00
    },
    {
      id: "CS310",
      code: "CS 310",
      name: "هندسة البرمجيات (Software Engineering)",
      credits: 3,
      instructor: "د. سارة المنصور",
      midterm1: 17.5,
      midterm2: 18.5,
      quizzes: 8.5,
      assignments: 9.0,
      project: 10.0,
      finalExam: 26.5,
      letterGrade: "A",
      gradePoint: 4.75
    },
    {
      id: "MATH150",
      code: "MATH 150",
      name: "الرياضيات المتقطعة (Discrete Mathematics)",
      credits: 3,
      instructor: "د. إبراهيم الزهراني",
      midterm1: 18.5,
      midterm2: 17.0,
      quizzes: 9.0,
      assignments: 9.0,
      project: 10.0,
      finalExam: 27.0,
      letterGrade: "A",
      gradePoint: 4.75
    }
  ],

  // Sample Slide Lectures with Mock Exams
  sampleSlides: [
    {
      id: "slide_cs141_ch3",
      course: "CS 141 - برمجة 2 (جافا)",
      title: "الفصل الثالث: مفاهيم الوراثة والـ Polymorphism وتعدد الأشكال",
      slidesCount: 38,
      uploadDate: "2026-08-15",
      summary: "يغطي هذا الفصل كيفية إعادة استخدام الأكواد عبر الوراثة (Inheritance) باستخدام الكلمة المحجوزة `extends`، وكيفية استدعاء دوال وبواني الكلاس الأب عبر `super`، وفروقات الـ Overloading مقابل الـ Overriding، والربط الديناميكي (Dynamic Method Dispatch).",
      keyPoints: [
        "الوراثة في جافا وراثة أحادية فقط (Single Inheritance) للكلاسات، ومتعددة عبر الواجهات (Interfaces).",
        "الكلمة المحجوزة `super()` يجب أن تكون أول سطر في باني الكلاس الابن (Child Constructor).",
        "الـ Method Overriding يتطلب نفس الاسم ونفس المدخلات تماماً في الكلاس الابن.",
        "الكلاسات المجردة (Abstract Classes) لا يمكن إنشاء كائنات مباشرة منها وتُستخدم كقوالب أساسية."
      ],
      examQuestions: [
        {
          q: "ما هو الفرق الرئيسي بين الـ Overloading والـ Overriding في لغة جافا؟",
          answer: "الـ Overloading يحدث في نفس الكلاس بنفس الاسم لكن بمعاملات مختلفة، بينما الـ Overriding يحدث بين الكلاس الأب والابن بنفس التوقيع تماماً لتغيير سلوك الدالة."
        },
        {
          q: "ماذا يحدث إذا تم استدعاء `super()` في السطر الثالث من الباني؟",
          answer: "سيحدث خطأ تجميعي (Compilation Error) لأن جافا تشترط أن يكون استدعاء `super()` أول تعليمة داخل الباني."
        },
        {
          q: "هل يمكن تعريف دالة `final` ومن ثم عمل Override لها في كلاس مشتق؟",
          answer: "لا، الدوال المعرفة بـ `final` محصنة من إعادة التعريف والـ Overriding في أي كلاس ابن."
        }
      ],
      flashcards: [
        { id: "fc1", front: "ما هي الكلمة المحجوزة للوراثة من كلاس في جافا؟", back: "extends", mastered: false },
        { id: "fc2", front: "ما فائدة Dynamic Method Binding؟", back: "تحديد الدالة المراد تنفيذها وقت التشغيل (Runtime) بناءً على نوع الكائن الحقيقي وليس نوع المرجع.", mastered: false },
        { id: "fc3", front: "هل يمكن وراثة أكثر من كلاس (Multiple Inheritance) في جافا؟", back: "لا للكلاسات، ولكن نعم من خلال تطبيق أكثر من Interface باستخدام implements.", mastered: false },
        { id: "fc4", front: "ما هو الغرض من الوسم @Override؟", back: "إبلاغ المترجم بالتأكد من أن الدالة تعيد كتابة دالة موجودة فعلاً في الكلاس الأب لتجنب أخطاء الإملاء.", mastered: false }
      ],
      mockExam: [
        {
          id: "me1",
          question: "أي من العبارات التالية صحيحة تماماً بخصوص الوراثة في لغة جافا؟",
          options: [
            "تدعم جافا الوراثة المتعددة للكلاسات مباشرة باستخدام الفاصلة.",
            "الكلاس الابن يرث الخصائص والدوال العامة والمحمية (public & protected) من الكلاس الأب.",
            "البواني (Constructors) يتم توريثها تلقائياً مثل باقي الدوال العادية.",
            "لا يمكن للكلاس الابن إضافة متغيرات جديدة خاصة به."
          ],
          correct: 1,
          explanation: "الكلاس الابن يرث الدوال والخصائص ذات محدد الوصول public و protected، ولا يرث البواني مباشرة بل يستدعيها عبر super()."
        },
        {
          id: "me2",
          question: "ما هي الكلمة المحجوزة التي تمنع الكلاس من أن يتم وراثته نهائياً؟",
          options: ["static", "abstract", "final", "private"],
          correct: 2,
          explanation: "الكلمة `final` عند وضعها قبل تعريف الكلاس تمنع أي كلاس آخر من أن يمتد منه (extends)."
        },
        {
          id: "me3",
          question: "ما هو ناتج تجميع الكود الذي يحتوي على دالة مجردة `abstract method` داخل كلاس غير مجرد؟",
          options: [
            "Compilation Error: يجب أن يكون الكلاس الحاوي لدالة مجردة معرفاً بـ abstract.",
            "يعمل البرنامج بشكل طبيعي دون مشاكل.",
            "Runtime Exception: NullPointerException.",
            "يتم تحويل الدالة إلى static تلقائياً."
          ],
          correct: 0,
          explanation: "إذا احتوى أي كلاس على دالة مجردة واحدة على الأقل، يجب وجوباً تعريف الكلاس كـ abstract class."
        },
        {
          id: "me4",
          question: "في مبدأ الـ Dynamic Binding، متى يتم تحديد الدالة المنفذة؟",
          options: ["أثناء التجميع (Compile-time)", "أثناء التشغيل (Runtime)", "أثناء كتابة الكود", "أثناء تحميل المكتبات"],
          correct: 1,
          explanation: "الربط الديناميكي يحدد الدالة بناءً على نوع الكائن الحقيقي في الذاكرة أثناء التشغيل (Runtime)."
        }
      ]
    }
  ]
};
