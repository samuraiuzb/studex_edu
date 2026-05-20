"""MathTestUZ API URL patterns."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ─── Auth ───────────────────────────────────────────────────────
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),

    # ─── Teacher ─────────────────────────────────────────────────────
    path('teacher/dashboard/', views.TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('teacher/analytics/', views.TeacherAnalyticsView.as_view(), name='teacher-analytics'),

    # Classrooms
    path('teacher/classrooms/', views.ClassroomListCreateView.as_view(), name='teacher-classrooms'),
    path('teacher/classrooms/<int:pk>/', views.ClassroomDetailView.as_view(), name='teacher-classroom-detail'),
    path('teacher/classrooms/<int:pk>/leaderboard/', views.TeacherClassroomLeaderboardView.as_view(), name='teacher-classroom-leaderboard'),
    path('teacher/classrooms/<int:pk>/students/', views.ClassroomStudentsView.as_view(), name='teacher-classroom-students'),
    path('teacher/classrooms/<int:pk>/add-student/', views.AddStudentToClassroomView.as_view(), name='teacher-classroom-add-student'),
    path('teacher/classrooms/<int:pk>/remove-student/', views.RemoveStudentFromClassroomView.as_view(), name='teacher-classroom-remove-student'),
    path('teacher/students/', views.AllStudentsView.as_view(), name='teacher-students'),

    # Tests
    path('teacher/tests/', views.TeacherTestListCreateView.as_view(), name='teacher-tests'),
    path('teacher/tests/<int:pk>/', views.TeacherTestDetailView.as_view(), name='teacher-test-detail'),
    path('teacher/tests/<int:pk>/results/', views.TeacherTestResultsView.as_view(), name='teacher-test-results'),
    path('teacher/tests/<int:pk>/export/', views.ExportResultsExcelView.as_view(), name='teacher-export'),
    path('teacher/tests/<int:pk>/import-questions/', views.ImportQuestionsFromExcelView.as_view(), name='import-questions'),
    path('teacher/excel-template/', views.ExcelTemplateView.as_view(), name='excel-template'),

    # Questions
    path('teacher/tests/<int:test_id>/questions/', views.TeacherQuestionListCreateView.as_view(), name='teacher-questions'),
    path('teacher/questions/<int:pk>/', views.TeacherQuestionDetailView.as_view(), name='teacher-question-detail'),
    path('teacher/questions/<int:question_id>/matching-pairs/', views.MatchingPairListCreateView.as_view(), name='matching-pairs'),
    path('teacher/matching-pairs/<int:pk>/', views.MatchingPairDetailView.as_view(), name='matching-pair-detail'),

    # Materials
    path('teacher/materials/', views.TeacherMaterialListCreateView.as_view(), name='teacher-materials'),
    path('teacher/materials/<int:pk>/', views.TeacherMaterialDetailView.as_view(), name='teacher-material-detail'),

    # ─── Student ─────────────────────────────────────────────────────
    # Classrooms
    path('student/join-classroom/', views.JoinClassroomView.as_view(), name='student-join-classroom'),
    path('student/my-classrooms/', views.MyClassroomsView.as_view(), name='student-my-classrooms'),

    path('student/materials/', views.StudentMaterialsView.as_view(), name='student-materials'),
    path('student/materials/<int:material_id>/read/', views.StudentMarkMaterialReadView.as_view(), name='student-material-read'),
    path('student/tests/', views.StudentTestListView.as_view(), name='student-tests'),
    path('student/tests/<int:test_id>/start/', views.StudentStartAttemptView.as_view(), name='student-start'),
    path('student/attempts/<int:attempt_id>/answer/', views.StudentSubmitAnswerView.as_view(), name='student-answer'),
    path('student/attempts/<int:attempt_id>/finish/', views.StudentFinishAttemptView.as_view(), name='student-finish'),
    path('student/history/', views.StudentHistoryView.as_view(), name='student-history'),
    path('student/leaderboard/', views.StudentLeaderboardView.as_view(), name='student-leaderboard'),
    path('student/progress/', views.StudentProgressView.as_view(), name='student-progress'),
    path('student/analytics/', views.StudentAnalyticsView.as_view(), name='student-analytics'),

    # ─── Chatbot ──────────────────────────────────────────────────────
    path('chat/<int:attempt_id>/', views.ChatView.as_view(), name='chat'),
]
