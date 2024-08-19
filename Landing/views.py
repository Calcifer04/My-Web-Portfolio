from django.shortcuts import render

# Create your views here.


def landing1(request):
    return render(request, "landing.html")


def nav(request):
    return render(request, "nav.html")


def about(request):
    return render(request, "about.html")


def contact(request):
    return render(request, "contact.html")


def projects(request):
    return render(request, "projects.html")
