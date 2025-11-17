import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginRequest } from '../../../core/models/auth/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  loginForm: FormGroup;
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  returnUrl = signal<string>('/dashboard/home');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.returnUrl.set(
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard/home'
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notification.warning(
        'Por favor completa todos los campos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    this.isLoading.set(true);

    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.notification.success(
          `¡Bienvenido, ${response.user.fullName}!`,
          'Inicio de sesión exitoso'
        );
        // Redirigir a la URL de retorno o al dashboard
        this.router.navigateByUrl(this.returnUrl());
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error?.error?.message || 'Error al iniciar sesión';
        this.notification.error(errorMessage, 'Error de autenticación');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get isEmailInvalid(): boolean {
    return !!(this.email?.invalid && this.email?.touched);
  }

  get isPasswordInvalid(): boolean {
    return !!(this.password?.invalid && this.password?.touched);
  }

  getEmailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'El correo electrónico es obligatorio';
    }
    if (this.email?.errors?.['email']) {
      return 'Ingresa un correo válido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'La contraseña es obligatoria';
    }
    if (this.password?.errors?.['minlength']) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }
}
