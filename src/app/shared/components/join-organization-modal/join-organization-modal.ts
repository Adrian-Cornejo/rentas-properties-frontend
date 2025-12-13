import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-organization-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-organization-modal.html',
  styleUrl: './join-organization-modal.css'
})
export class JoinOrganizationModalComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  isLoading = signal<boolean>(false);

  // Outputs
  closeModal = output<void>();
  organizationJoined = output<void>();

  // Form
  joinForm: FormGroup = this.fb.group({
    invitationCode: ['', [
      Validators.required,
    ]]
  });

  onSubmit(): void {
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.userService.joinOrganization({
      invitationCode: this.joinForm.value.invitationCode.toUpperCase()
    }).subscribe({
      next: (response) => {
        this.notification.success(
          'Te has unido exitosamente a la organización',
          'Organización unida'
        );

        this.authService.updateCurrentUser({
          id: response.id,
          fullName: response.fullName,
          email: response.email,
          phone: response.phone,
          role: response.role,
          accountStatus: response.accountStatus,
          organizationId: response.organizationDetails?.id,
          organizationName: response.organizationDetails?.name,
          active: response.organizationDetails?.active || true,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        });

        this.organizationJoined.emit();
        this.close();

        window.location.reload();
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error?.message || 'Error al unirse a la organización';
        this.notification.error(errorMessage, 'Error');
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  formatInvitationCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }

    if (value.length > 7) {
      value = value.slice(0, 7);
    }

    this.joinForm.patchValue({ invitationCode: value }, { emitEvent: false });
  }

  get invitationCode() {
    return this.joinForm.get('invitationCode');
  }

  get isInvitationCodeInvalid(): boolean {
    return !!(this.invitationCode?.invalid && this.invitationCode?.touched);
  }

  getInvitationCodeErrorMessage(): string {
    if (this.invitationCode?.errors?.['required']) {
      return 'El código de invitación es obligatorio';
    }
    if (this.invitationCode?.errors?.['pattern']) {
      return 'Formato inválido. Usa el formato ABC-12D3';
    }
    return '';
  }
}
