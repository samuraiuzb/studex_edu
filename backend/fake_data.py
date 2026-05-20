import os
import django
import random
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from api.models import User, Test, Attempt

def create_fake_data():
    test = Test.objects.filter(name__icontains="Kvadrat").first()
    if not test:
        test = Test.objects.last()
        if not test:
            print("Bazada hech qanday test topilmadi.")
            return

    print(f"Tanlangan test: {test.name}")

    names = [
        "Malika Karimova",
        "Jasur Maxmudov",
        "Nodira Qodirova",
        "Azizbek Rustamov",
        "Shahzod Oripov",
        "Zarina Ismoilova",
        "Rustam Xamroyev",
    ]

    students = []
    for i, name in enumerate(names):
        username = f"fakestudent_{i}"
        student, created = User.objects.get_or_create(username=username, defaults={
            'role': 'student',
            'full_name': name,
            'class_name': '9A',
        })
        if not created:
            student.full_name = name
            student.class_name = '9A'
            student.save()
        else:
            student.set_password("pass123")
            student.save()
        students.append(student)

    print(f"{len(students)} ta soxta (fake) o'quvchi yaratildi yoki olindi.")

    # Jadvalda jami savollar (Ball) 14 ta ekanligi ko'rinib turibdi (8/14)
    total_questions = 14

    for student in students:
        # Eski urinishlarni tozalash (agar bo'lsa)
        Attempt.objects.filter(student=student, test=test).delete()
        
        score = random.randint(5, 14) # Random ball: 5 dan 14 gacha
        start_time = timezone.now() - timedelta(hours=random.randint(2, 48), minutes=random.randint(15, 45))
        
        limit = test.time_limit if test.time_limit else 20
        submit_time = start_time + timedelta(minutes=random.randint(5, limit))
        
        attempt = Attempt.objects.create(
            student=student,
            test=test,
            score=score,
            total_questions=total_questions,
            is_completed=True,
        )
        
        # update query directly avoids auto_now_add overwriting started_at
        Attempt.objects.filter(id=attempt.id).update(started_at=start_time, submitted_at=submit_time)

    print("Barcha fake ma'lumotlar muvaffaqiyatli qo'shildi! Sahifani yangilab tekshirishingiz mumkin.")

if __name__ == '__main__':
    create_fake_data()
