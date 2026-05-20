"""MathTestUZ URL configuration."""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({'message': 'Studex API', 'version': '1.0', 'endpoints': {'admin': '/admin/', 'api': '/api/'}})

from django.views.generic import TemplateView
from django.urls import re_path

from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Serve media files in production (limited but works for simple setups)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    # Serve React App for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
] # Note: static(settings.MEDIA_URL) removed as re_path handles it now
        