from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing1, name='landing'),
    path('more/', views.nav, name='nav'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('projects/', views.projects, name='projects'),
]
