// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationSeverity = 'success' | 'error' | 'warn' | 'info';

export interface NotificationOptions {
  severity: NotificationSeverity;
  summary: string;
  detail: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  styleClass?: string;
  contentStyleClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  private readonly DEFAULT_LIFE = {
    success: 3000,
    info: 3000,
    warn: 4000,
    error: 5000
  };

  private readonly SEVERITY_CLASSES = {
    success: 'notification-success',
    error: 'notification-error',
    warn: 'notification-warning',
    info: 'notification-info'
  };

  success(detail: string, summary: string = 'Éxito', life?: number): void {
    this.show({
      severity: 'success',
      summary,
      detail,
      life: life || this.DEFAULT_LIFE.success
    });
  }

  error(detail: string, summary: string = 'Error', life?: number): void {
    this.show({
      severity: 'error',
      summary,
      detail,
      life: life || this.DEFAULT_LIFE.error
    });
  }

  warning(detail: string, summary: string = 'Advertencia', life?: number): void {
    this.show({
      severity: 'warn',
      summary,
      detail,
      life: life || this.DEFAULT_LIFE.warn
    });
  }

  info(detail: string, summary: string = 'Información', life?: number): void {
    this.show({
      severity: 'info',
      summary,
      detail,
      life: life || this.DEFAULT_LIFE.info
    });
  }

  show(options: NotificationOptions): void {
    const styleClass = this.buildStyleClass(options);

    this.messageService.add({
      severity: options.severity,
      summary: options.summary,
      detail: options.detail,
      life: options.life,
      sticky: options.sticky ?? false,
      closable: options.closable ?? true,
      styleClass,
      contentStyleClass: options.contentStyleClass
    });
  }

  clear(): void {
    this.messageService.clear();
  }

  clearBySeverity(severity: NotificationSeverity): void {
    this.messageService.clear(severity);
  }

  private buildStyleClass(options: NotificationOptions): string {
    const classes: string[] = [
      'custom-notification',
      this.SEVERITY_CLASSES[options.severity]
    ];

    if (options.styleClass) {
      classes.push(options.styleClass);
    }

    return classes.join(' ');
  }
}
