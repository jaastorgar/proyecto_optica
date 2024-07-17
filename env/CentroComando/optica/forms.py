from django import forms
from .models import Cita
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CitaForm(forms.ModelForm):
    class Meta:
        model = Cita
        fields = ['nombre', 'email', 'telefono', 'fecha_hora', 'motivo']
        widgets = {
            'fecha_hora': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }


class RegistroForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password1', 'password2']


class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)