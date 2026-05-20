"""Django admin configuration for MathTestUZ."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Test, Question, Attempt, Answer, Material, 
    ChatSession, ChatMessage, MatchingPair, Classroom, MaterialReadLog
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'full_name', 'role', 'class_name', 'email']
    list_filter = ['role']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Studex', {'fields': ('role', 'class_name', 'full_name')}),
    )


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['name', 'teacher', 'allowed_class', 'time_limit', 'is_active', 'created_at']
    list_filter = ['is_active', 'access_type']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['test', 'question_type', 'text', 'correct_option', 'difficulty']
    list_filter = ['difficulty', 'question_type']


@admin.register(MatchingPair)
class MatchingPairAdmin(admin.ModelAdmin):
    list_display = ['question', 'left_item', 'right_item', 'order']
    list_filter = ['question__test']


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'test', 'score', 'total_questions', 'is_completed', 'submitted_at']
    list_filter = ['is_completed']


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'file_type', 'class_name', 'created_at']


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'teacher', 'invite_code', 'created_at']
    search_fields = ['name', 'invite_code', 'teacher__username']


@admin.register(MaterialReadLog)
class MaterialReadLogAdmin(admin.ModelAdmin):
    list_display = ['student', 'material', 'read_at']
    search_fields = ['student__username', 'material__title']


admin.site.register(Answer)
admin.site.register(ChatSession)
admin.site.register(ChatMessage)
