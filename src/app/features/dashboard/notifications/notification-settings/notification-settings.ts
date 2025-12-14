// src/app/features/dashboard/notifications/notification-settings/notification-settings.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationsHttpService } from '../../../../core/services/notifications-http.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { NotificationSettingsRequest } from '../../../../core/models/notification/notification-settings-request';
import { NotificationSettingsResponse } from '../../../../core/models/notification/notification-settings-response';
import { SendTestNotificationRequest } from '../../../../core/models/notification/send-test-notification-request';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.css'
})
export class NotificationSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationsHttp = inject(NotificationsHttpService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);

  // Computed
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  subscriptionPlan = computed(() => {
    return this.organizationService.currentOrganization()?.subscriptionPlan || 'BASIC';
  });

  // Signals
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isSendingTest = signal<boolean>(false);
  settings = signal<NotificationSettingsResponse | null>(null);
  showTestPanel = signal<boolean>(false);

  // Form
  settingsForm!: FormGroup;
  testForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadSettings();
  }

  private initForms(): void {
    this.settingsForm = this.fb.group({
      enabled: [false],
      channel: ['SMS'],
      adminNotifications: [true]
    });

    this.testForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      channel: ['SMS', Validators.required]
    });

    // Deshabilitar form si no es admin o plan BASICO
    if (!this.isAdmin() || this.subscriptionPlan() === 'BASICO') {
      this.settingsForm.disable();
    }
  }

  private loadSettings(): void {
    this.isLoading.set(true);
    this.notificationsHttp.getSettings().subscribe({
      next: (response) => {
        this.settings.set(response);
        this.settingsForm.patchValue({
          enabled: response.enabled,
          channel: response.channel,
          adminNotifications: response.adminNotifications
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar configuración');
        this.isLoading.set(false);
      }
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid || !this.isAdmin()) {
      this.notification.error('No tienes permisos para modificar esta configuración');
      return;
    }

    this.isSaving.set(true);

    const request: NotificationSettingsRequest = {
      enabled: this.settingsForm.value.enabled,
      channel: this.settingsForm.value.channel,
      adminNotifications: this.settingsForm.value.adminNotifications
    };

    this.notificationsHttp.updateSettings(request).subscribe({
      next: (response) => {
        this.settings.set(response);
        this.notification.success('Configuración actualizada correctamente');
        this.isSaving.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al guardar configuración');
        this.isSaving.set(false);
      }
    });
  }

  toggleTestPanel(): void {
    this.showTestPanel.update(val => !val);
    if (this.showTestPanel()) {
      this.testForm.reset({ channel: this.settingsForm.value.channel || 'SMS' });
    }
  }

  sendTestNotification(): void {
    if (this.testForm.invalid) {
      this.testForm.markAllAsTouched();
      this.notification.error('Por favor ingresa un número de teléfono válido');
      return;
    }

    this.isSendingTest.set(true);

    const request: SendTestNotificationRequest = {
      phoneNumber: this.testForm.value.phoneNumber,
      channel: this.testForm.value.channel
    };

    this.notificationsHttp.sendTestNotification(request).subscribe({
      next: (response) => {
        this.notification.success(`Notificación de prueba enviada a ${response.phoneNumber}`);
        this.isSendingTest.set(false);
        this.showTestPanel.set(false);
        this.testForm.reset();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al enviar notificación de prueba');
        this.isSendingTest.set(false);
      }
    });
  }

  get isPlanBasico(): boolean {
    return this.subscriptionPlan() === 'BASICO';
  }

  get isPlanIntermedio(): boolean {
    return this.subscriptionPlan() === 'INTERMEDIO';
  }

  get isPlanSuperior(): boolean {
    return this.subscriptionPlan() === 'SUPERIOR';
  }

  get canUseBothChannels(): boolean {
    return this.isPlanSuperior;
  }

  get progressPercentage(): number {
    const settings = this.settings();
    if (!settings || settings.monthlyLimit === 0) return 0;
    return Math.round((settings.sentThisMonth / settings.monthlyLimit) * 100);
  }

  get progressColor(): string {
    const percentage = this.progressPercentage;
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  }
}
