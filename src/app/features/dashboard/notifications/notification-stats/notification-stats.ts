// src/app/features/dashboard/notifications/notification-stats/notification-stats.ts
import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NotificationsHttpService } from '../../../../core/services/notifications-http.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationStatsResponse, ChartData, RecentNotification } from '../../../../core/models/notification/notification-stats-response';

Chart.register(...registerables);

@Component({
  selector: 'app-notification-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-stats.html',
  styleUrl: './notification-stats.css'
})
export class NotificationStatsComponent implements OnInit, AfterViewInit {
  private notificationsHttp = inject(NotificationsHttpService);
  private notification = inject(NotificationService);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  // Signals
  isLoading = signal<boolean>(false);
  stats = signal<NotificationStatsResponse | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Chart se creará después de cargar datos
  }

  private loadStats(): void {
    this.isLoading.set(true);
    this.notificationsHttp.getStats().subscribe({
      next: (response) => {
        this.stats.set(response);
        this.isLoading.set(false);
        // Crear gráfica después de cargar datos
        setTimeout(() => this.createChart(), 0);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar estadísticas');
        this.isLoading.set(false);
      }
    });
  }

  private createChart(): void {
    if (!this.chartCanvas || !this.stats()) return;

    const chartData = this.stats()!.chartData || [];

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.map(d => this.formatDate(d.date)),
        datasets: [
          {
            label: 'Enviadas',
            data: chartData.map(d => d.sent),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Entregadas',
            data: chartData.map(d => d.delivered),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Fallidas',
            data: chartData.map(d => d.failed),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'short' });
    return `${day} ${month}`;
  }

  refreshStats(): void {
    this.loadStats();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'badge-success';
      case 'SENT':
        return 'badge-info';
      case 'FAILED':
        return 'badge-error';
      case 'PENDING':
        return 'badge-warning';
      default:
        return 'badge-default';
    }
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'DELIVERED': 'Entregado',
      'SENT': 'Enviado',
      'FAILED': 'Fallido',
      'PENDING': 'Pendiente'
    };
    return statusMap[status] || status;
  }

  getChannelIcon(channel: string): string {
    return channel === 'WHATSAPP' ? 'pi-whatsapp' : 'pi-mobile';
  }

  getChannelText(channel: string): string {
    return channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS';
  }

  getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      'PAYMENT_REMINDER': 'Recordatorio de Pago',
      'CONTRACT_EXPIRY': 'Vencimiento de Contrato',
      'MAINTENANCE_ALERT': 'Alerta de Mantenimiento'
    };
    return typeMap[type] || type;
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
