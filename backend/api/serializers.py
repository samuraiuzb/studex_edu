"""
MathTestUZ Serializers
DRF serializers for all models.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (User, Test, Question, Attempt, Answer,
                     Material, ChatSession, ChatMessage, MatchingPair, MaterialReadLog,
                     Classroom)


# ─── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'full_name', 'role', 'invite_code']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Parollar mos emas!")
            
        # Validate invite code for students
        if data.get('role') == 'student' and data.get('invite_code'):
            invite_code = data.get('invite_code')
            if not Classroom.objects.filter(invite_code=invite_code).exists():
                raise serializers.ValidationError({'invite_code': "Noto'g'ri taklif kodi!"})
                
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        invite_code = validated_data.pop('invite_code', None)
        password = validated_data.pop('password')
        
        classroom = None
        if validated_data.get('role') == 'student' and invite_code:
            classroom = Classroom.objects.filter(invite_code=invite_code).first()
            if classroom:
                validated_data['class_name'] = classroom.name
        
        user = User(**validated_data)
        user.set_password(password)  # Hash the password
        user.save()
        
        if classroom:
            classroom.students.add(user)
            
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'role', 'class_name', 'email', 'level', 'total_xp']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile info and/or password."""
    old_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True,
                                         validators=[validate_password])

    class Meta:
        model = User
        fields = ['full_name', 'class_name', 'old_password', 'new_password']

    def validate(self, data):
        old_pw = data.get('old_password', '')
        new_pw = data.get('new_password', '')
        if new_pw and not old_pw:
            raise serializers.ValidationError({'old_password': 'Yangi parol kiritish uchun avval eski parolni kiriting.'})
        if new_pw and old_pw:
            if not self.instance.check_password(old_pw):
                raise serializers.ValidationError({'old_password': 'Eski parol noto\'g\'ri.'})
        return data

    def update(self, instance, validated_data):
        validated_data.pop('old_password', None)
        new_pw = validated_data.pop('new_password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_pw:
            instance.set_password(new_pw)
        instance.save()
        return instance


# ─── Classroom ─────────────────────────────────────────────────────────────────

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    students_count = serializers.IntegerField(source='students.count', read_only=True)
    students_list = UserSerializer(source='students', many=True, read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'teacher', 'teacher_name', 'name', 'invite_code', 'students_count', 'students_list', 'created_at']
        read_only_fields = ['teacher', 'teacher_name', 'invite_code', 'students_count', 'students_list', 'created_at']


# ─── Material ──────────────────────────────────────────────────────────────────

class MaterialSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    # file is optional: teacher can upload a file OR provide a youtube_url
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Material
        fields = ['id', 'title', 'description', 'file', 'youtube_url', 'file_type',
                  'classroom', 'classroom_name', 'class_name', 'created_at', 'teacher_name']
        read_only_fields = ['teacher_name', 'classroom_name', 'created_at']

    def validate(self, data):
        file = data.get('file')
        youtube_url = data.get('youtube_url')
        if not file and not youtube_url:
            raise serializers.ValidationError(
                "Fayl yoki YouTube havolasidan birini kiritish shart!")
        return data

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Return relative path so Vite proxy (/media/ → :8000) can serve it.
        if instance.file:
            rep['file'] = instance.file.url   # e.g. /media/materials/algebra.pdf
        return rep


class MaterialReadLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialReadLog
        fields = ['id', 'material', 'read_at']
        read_only_fields = ['read_at']


# ─── MatchingPair ──────────────────────────────────────────────────────────────

class MatchingPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingPair
        fields = ['id', 'question', 'left_item', 'right_item', 'order']
        read_only_fields = ['question']


# ─── Question ──────────────────────────────────────────────────────────────────

class QuestionSerializer(serializers.ModelSerializer):
    matching_pairs = MatchingPairSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'test', 'question_type', 'text', 'image', 'file',
                  'option_a', 'option_b', 'option_c', 'option_d',
                  'correct_option', 'correct_answer_text', 'explanation', 'difficulty', 'order',
                  'matching_pairs']


class QuestionStudentSerializer(serializers.ModelSerializer):
    """Hides correct_option and explanation from students during active test."""
    matching_pairs = MatchingPairSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_type', 'text', 'image', 'file',
                  'option_a', 'option_b', 'option_c', 'option_d',
                  'difficulty', 'order', 'matching_pairs']


# ─── Test ──────────────────────────────────────────────────────────────────────

class TestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'name', 'description', 'time_limit', 'max_attempts',
                  'access_type', 'classroom', 'classroom_name', 'allowed_class', 'chatbot_mode', 'is_active',
                  'start_date', 'end_date',
                  'created_at', 'teacher_name', 'questions_count', 'material']
        read_only_fields = ['teacher_name', 'classroom_name', 'created_at', 'questions_count']


# ─── Attempt ───────────────────────────────────────────────────────────────────

class AttemptSerializer(serializers.ModelSerializer):
    percentage = serializers.FloatField(read_only=True)
    grade = serializers.IntegerField(read_only=True)
    test_name = serializers.CharField(source='test.name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Attempt
        fields = ['id', 'student', 'test', 'test_name', 'student_name',
                  'started_at', 'submitted_at', 'score', 'total_questions',
                  'percentage', 'grade', 'is_completed', 'question_order']
        read_only_fields = ['started_at', 'percentage', 'grade']


# ─── Answer ────────────────────────────────────────────────────────────────────

class AnswerSerializer(serializers.ModelSerializer):
    is_correct = serializers.BooleanField(read_only=True)
    explanation = serializers.CharField(source='question.explanation', read_only=True)
    selected_matching = serializers.JSONField(required=False, allow_null=True)
    selected_text = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    correct_option = serializers.CharField(source='question.correct_option', read_only=True)
    correct_answer_text = serializers.CharField(source='question.correct_answer_text', read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'attempt', 'question', 'selected_option',
                  'selected_matching', 'selected_text',
                  'is_correct', 'explanation', 'correct_option', 'correct_answer_text', 'answered_at']
        read_only_fields = ['is_correct', 'answered_at']


# ─── Chat ──────────────────────────────────────────────────────────────────────

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'attempt', 'created_at', 'messages']
