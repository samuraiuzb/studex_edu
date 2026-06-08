"""
MathTestUZ Database Models
All models for users, tests, questions, attempts, materials, and chat.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# ─── User ──────────────────────────────────────────────────────────────────────

class User(AbstractUser):
    """Extended user with role (teacher / student) and class info."""
    email = models.EmailField(unique=True)
    ROLE_CHOICES = [
        ('teacher', 'O\'qituvchi'),
        ('student', 'O\'quvchi'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    class_name = models.CharField(max_length=20, blank=True, null=True,
                                  help_text="e.g. '6A', '7B' — for students")
    full_name = models.CharField(max_length=150, blank=True)
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ─── Classroom ─────────────────────────────────────────────────────────────────

class Classroom(models.Model):
    """A virtual classroom managed by a teacher."""
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_classes')
    name = models.CharField(max_length=100, help_text="e.g. '6A', '7B Matematika'")
    invite_code = models.CharField(max_length=6, unique=True, help_text="Auto-generated 6-char code")
    students = models.ManyToManyField(User, related_name='classrooms', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.teacher.username})"


# ─── Material ──────────────────────────────────────────────────────────────────

class Material(models.Model):
    """Educational material: PDF, video or image uploaded by teacher."""
    TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('youtube', 'YouTube'),
        ('image', 'Rasm'),
        ('word', 'Word'),
        ('ppt', 'PPTX'),
    ]
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materials')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='materials')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='materials/', blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True,
                                  help_text="YouTube video havolasi (fayl o'rniga)")
    file_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    class_name = models.CharField(max_length=20, blank=True,
                                  help_text="Which class can see this material")
    access_type = models.CharField(max_length=10, choices=[('public', 'Ochiq'), ('class', 'Faqat sinf')], default='class')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class MaterialReadLog(models.Model):
    """Tracks that a student has confirmed reading/watching a material."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='material_reads')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='read_logs')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'material')

    def __str__(self):
        return f"{self.student.username} → {self.material.title}"


# ─── Test ──────────────────────────────────────────────────────────────────────

class Test(models.Model):
    """A test created by a teacher."""
    ACCESS_CHOICES = [
        ('public', 'Hammaga ochiq'),
        ('class', 'Faqat sinf'),
    ]
    CHATBOT_CHOICES = [
        ('OFF', 'O\'chirilgan'),
        ('HINT_ONLY', 'Faqat yo\'naltirish'),
        ('FULL_EXPLAIN', 'To\'liq tushuntirish'),
    ]
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tests')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='tests')
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='tests')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    time_limit = models.PositiveIntegerField(help_text="Minutes. 0=unlimited")
    max_attempts = models.PositiveIntegerField(default=3)
    access_type = models.CharField(max_length=10, choices=ACCESS_CHOICES, default='class')
    allowed_class = models.CharField(max_length=20, blank=True,
                                     help_text="Class name if access_type='class'")
    chatbot_mode = models.CharField(max_length=15, choices=CHATBOT_CHOICES, default='HINT_ONLY')
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True,
                                      help_text="Testni boshlash vaqti (bo'sh=darhol)")
    end_date = models.DateTimeField(null=True, blank=True,
                                    help_text="Testni yopish vaqti (bo'sh=cheksiz)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ─── Question ──────────────────────────────────────────────────────────────────

class Question(models.Model):
    """A question supporting multiple-choice, matching pairs, or other types."""
    DIFFICULTY_CHOICES = [
        ('easy', 'Oson'),
        ('medium', "O'rtacha"),
        ('hard', 'Qiyin'),
    ]
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Koʻp variantli'),
        ('matching_pairs', 'Juftlashtirish'),
        ('draw_graph', 'Grafik chizish'),
        ('find_equation', 'Funksiyani topish'),
    ]
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, 
                                     default='multiple_choice')
    text = models.TextField(help_text="Question text (supports LaTeX-like notation)")
    topic = models.CharField(max_length=100, blank=True, null=True, 
                             help_text="Mavzu nomi (Analytics uchun kerak)")
    image = models.ImageField(upload_to='questions/', blank=True, null=True,
                             help_text="Optional image for the question")
    file = models.FileField(upload_to='questions/', blank=True, null=True,
                           help_text="Optional supporting file (PDF, etc.)")
    
    # Multiple-choice fields (required for multiple_choice type)
    option_a = models.CharField(max_length=500, blank=True)
    option_b = models.CharField(max_length=500, blank=True)
    option_c = models.CharField(max_length=500, blank=True)
    option_d = models.CharField(max_length=500, blank=True)
    correct_option = models.CharField(max_length=1, choices=[
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')
    ], blank=True)
    correct_answer_text = models.CharField(max_length=255, blank=True,
                                           help_text="Used for text input or graph math equations.")
    explanation = models.TextField(blank=True,
                                   help_text="Shown when student answers incorrectly")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.text[:60]}"


# ─── MatchingPair ──────────────────────────────────────────────────────────────

class MatchingPair(models.Model):
    """A pair of items to match for matching_pairs question type."""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='matching_pairs')
    left_item = models.TextField(help_text="Left side item to match")
    right_item = models.TextField(help_text="Right side item to match")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Pair: {self.left_item[:30]} ← → {self.right_item[:30]}"


# ─── Attempt ───────────────────────────────────────────────────────────────────

class Attempt(models.Model):
    """A student's test attempt session."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0, help_text="Number of correct answers")
    total_questions = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    question_order = models.JSONField(default=list,
                                      help_text="Randomized question IDs for this attempt")
    ai_feedback = models.TextField(blank=True, null=True, help_text="AI feedback on student performance")

    @property
    def percentage(self):
        if not self.total_questions or self.total_questions == 0:
            return 0
        try:
            return round((self.score / self.total_questions) * 100, 1)
        except Exception:
            return 0

    @property
    def grade(self):
        """Uzbekistan 2-5 grading system."""
        p = self.percentage
        if p >= 86:
            return 5
        elif p >= 71:
            return 4
        elif p >= 56:
            return 3
        else:
            return 2

    def __str__(self):
        return f"{self.student.username} → {self.test.name} ({self.percentage}%)"


# ─── Answer ────────────────────────────────────────────────────────────────────

class Answer(models.Model):
    """Student's answer to a single question in an attempt."""
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    # for multiple choice we still use a one-letter option
    selected_option = models.CharField(max_length=1, choices=[
        ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')
    ], null=True, blank=True)
    # new field to store arbitrary payloads (matching pairs, etc.)
    selected_matching = models.JSONField(null=True, blank=True)
    selected_text = models.CharField(max_length=255, blank=True, null=True,
                                     help_text="Used for graph or text input answers")
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def save(self, *args, **kwargs):
        # determine correctness differently depending on question type
        if self.question.question_type == 'matching_pairs':
            # selected_matching is {leftPairId: rightPairId} – JSON can deliver either
            # str or int for keys/values, so we normalize everything to str for comparison.
            if not self.selected_matching:
                self.is_correct = False
            else:
                pairs = list(self.question.matching_pairs.all())
                # All pairs must be present and each left_id must map to its own right_id
                correct = True
                for p in pairs:
                    # Look up with both str and int key variants
                    student_val = (self.selected_matching.get(str(p.id))
                                   or self.selected_matching.get(p.id))
                    if student_val is None or str(student_val) != str(p.id):
                        correct = False
                        break
                self.is_correct = correct and (len(self.selected_matching) == len(pairs))
        elif self.question.question_type in ['find_equation', 'draw_graph']:
            ans_str = str(self.selected_text or '').strip()
            corr_str = str(self.question.correct_answer_text or '').strip()
            
            if self.question.question_type == 'draw_graph':
                try:
                    # Parse "m=1.00,c=2.00"
                    def parse_mc(s):
                        s_clean = s.replace(' ', '')
                        parts = s_clean.split(',')
                        m_val = float(parts[0].split('=')[1])
                        c_val = float(parts[1].split('=')[1])
                        return m_val, c_val
                    
                    ans_m, ans_c = parse_mc(ans_str)
                    cor_m, cor_c = parse_mc(corr_str)
                    
                    # Tolerance check
                    self.is_correct = abs(ans_m - cor_m) < 0.15 and abs(ans_c - cor_c) < 0.15
                except Exception:
                    self.is_correct = ans_str.replace(' ', '') == corr_str.replace(' ', '')
            else: # find_equation
                # Clean equation prefixes
                def clean_eq(s):
                    s = s.replace(' ', '')
                    for prefix in ['y=', 'f(x)=', 'g(x)=', 'y-']:
                        if s.lower().startswith(prefix):
                            s = s[len(prefix):]
                    return s
                
                cleaned_ans = clean_eq(ans_str)
                cleaned_cor = clean_eq(corr_str)
                
                if cleaned_ans == cleaned_cor:
                    self.is_correct = True
                else:
                    try:
                        import sympy
                        from sympy.abc import x
                        expr_ans = sympy.sympify(cleaned_ans)
                        expr_cor = sympy.sympify(cleaned_cor)
                        test_values = [-3, -1, 0, 1, 2, 3, 0.5, -0.5]
                        self.is_correct = all(
                            abs(float(expr_ans.subs(x, v)) - float(expr_cor.subs(x, v))) < 1e-6
                            for v in test_values
                        )
                    except Exception:
                        self.is_correct = False
        else:
            self.is_correct = (self.selected_option == self.question.correct_option)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{'✓' if self.is_correct else '✗'} {self.attempt} → Q{self.question.id}"


# ─── Chat ──────────────────────────────────────────────────────────────────────

class ChatSession(models.Model):
    """AI chatbot session tied to a test attempt."""
    attempt = models.OneToOneField(Attempt, on_delete=models.CASCADE,
                                   related_name='chat_session')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat: {self.attempt}"


class ChatMessage(models.Model):
    """A single message in a chat session."""
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
