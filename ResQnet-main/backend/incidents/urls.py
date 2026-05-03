from django.urls import path
from .views import CreateIncident

urlpatterns = [
    path('create/', CreateIncident.as_view()),
]