// src/app/features/auth/register/register.component.ts
import {Component, computed, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RegisterRequest } from '../../../core/models/auth/register-request.model';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private themeService = inject(ThemeService);

  registerForm: FormGroup;
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      invitationCode: ['', [Validators.pattern('^[A-Z]{3}-[A-Z0-9]{2}[A-Z][0-9]$')]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  platformName = input<string>('ArriendaFacil');
  currentTheme = this.themeService.isDarkMode;
  logoUrl = computed(() => {

    if (this.currentTheme()) {
      return '/logo_dark.svg';
    } else {
      return '/logo_light.svg';
    }
  });

  // Validador personalizado para la fortaleza de la contraseña
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[@#$%^&+=!]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  // Validador para confirmar que las contraseñas coincidan
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.notification.warning(
        'Por favor completa todos los campos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    this.isLoading.set(true);

    const registerData: RegisterRequest = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phone: this.registerForm.value.phone || null,
      invitationCode: this.registerForm.value.invitationCode?.toUpperCase() || null
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.notification.success(
          'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
          'Registro exitoso'
        );

        if (registerData.invitationCode) {
          this.notification.info(
            'Has sido agregado a la organización exitosamente',
            'Organización asignada'
          );
        }

        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error?.error?.message || error?.message || 'Error al crear la cuenta';
        this.notification.error(errorMessage, 'Error en el registro');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  // Getters para validaciones
  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get invitationCode() {
    return this.registerForm.get('invitationCode');
  }

  get acceptTerms() {
    return this.registerForm.get('acceptTerms');
  }

  // Métodos de validación
  get isFullNameInvalid(): boolean {
    return !!(this.fullName?.invalid && this.fullName?.touched);
  }

  get isEmailInvalid(): boolean {
    return !!(this.email?.invalid && this.email?.touched);
  }

  get isPhoneInvalid(): boolean {
    return !!(this.phone?.invalid && this.phone?.touched);
  }

  get isPasswordInvalid(): boolean {
    return !!(this.password?.invalid && this.password?.touched);
  }

  get isConfirmPasswordInvalid(): boolean {
    const isInvalid = !!(this.confirmPassword?.invalid && this.confirmPassword?.touched);
    const hasMismatch = !!(this.confirmPassword?.touched && this.registerForm.hasError('passwordMismatch'));
    return isInvalid || hasMismatch;
  }

  get isInvitationCodeInvalid(): boolean {
    return !!(this.invitationCode?.invalid && this.invitationCode?.touched);
  }

  // Mensajes de error
  getFullNameErrorMessage(): string {
    if (this.fullName?.errors?.['required']) {
      return 'El nombre completo es obligatorio';
    }
    if (this.fullName?.errors?.['minlength']) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (this.fullName?.errors?.['maxlength']) {
      return 'El nombre no debe exceder 255 caracteres';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'El correo electrónico es obligatorio';
    }
    if (this.email?.errors?.['email']) {
      return 'Ingresa un correo válido';
    }
    if (this.email?.errors?.['maxlength']) {
      return 'El correo no debe exceder 255 caracteres';
    }
    return '';
  }

  getPhoneErrorMessage(): string {
    if (this.phone?.errors?.['pattern']) {
      return 'El teléfono debe tener exactamente 10 dígitos';
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
    if (this.password?.errors?.['passwordStrength']) {
      return 'Debe contener mayúscula, minúscula, número y carácter especial (@#$%^&+=!)';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return 'Debes confirmar tu contraseña';
    }
    if (this.registerForm.hasError('passwordMismatch') && this.confirmPassword?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  getInvitationCodeErrorMessage(): string {
    if (this.invitationCode?.errors?.['pattern']) {
      return 'Formato inválido. Debe ser ABC-12D3';
    }
    return '';
  }

  // Validador de fortaleza de contraseña para mostrar indicadores
  getPasswordStrength(): { level: number; text: string; color: string } {
    const value = this.password?.value || '';

    if (value.length === 0) {
      return { level: 0, text: '', color: '' };
    }

    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[@#$%^&+=!]/.test(value)) strength++;

    if (strength <= 2) {
      return { level: strength, text: 'Débil', color: 'bg-red-500' };
    } else if (strength <= 4) {
      return { level: strength, text: 'Media', color: 'bg-yellow-500' };
    } else {
      return { level: strength, text: 'Fuerte', color: 'bg-green-500' };
    }
  }
}
