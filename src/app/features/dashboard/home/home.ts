import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlanService } from '../../../core/services/plan.service';
import { JoinOrganizationModalComponent } from '../../../shared/components/join-organization-modal/join-organization-modal';
import { DashboardResponse } from '../../../core/models/dashboard/dashboad-response';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    JoinOrganizationModalComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private planService = inject(PlanService);

  // Signals
  currentUser = this.authService.currentUser;
  showJoinModal = signal<boolean>(false);
  dashboardData = signal<DashboardResponse | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  planCode = this.planService.planCode;
  planName = this.planService.planName;
  currentPlan = this.planService.currentPlan;
  isPlanLoaded = signal<boolean>(false);

  // Computed
  hasOrganization = computed(() => !!this.currentUser()?.organizationId);
  isRegularUser = computed(() => this.currentUser()?.role === 'USER');
  shouldShowJoinButton = computed(() =>
    this.isRegularUser() && !this.hasOrganization()
  );

  propertyUsage = computed(() => this.planService.getUsage('properties'));
  userUsage = computed(() => this.planService.getUsage('users'));
  notificationUsage = computed(() => this.planService.getNotificationUsage());

  hasNotifications = computed(() => this.planService.hasFeature('NOTIFICATIONS'));
  hasAdvancedReports = computed(() => this.planService.hasFeature('ADVANCED_REPORTS'));
  hasMaintenancePhotos = computed(() => this.planService.hasFeature('MAINTENANCE_PHOTOS'));
  allowsImages = computed(() => this.planService.hasFeature('ALLOWS_IMAGES'));

  // Charts instances
  private monthlyRevenueChart: Chart | null = null;
  private paymentStatusChart: Chart | null = null;
  private propertyStatusChart: Chart | null = null;
  private contractStatusChart: Chart | null = null;
  private maintenanceTypeChart: Chart | null = null;

  ngOnInit(): void {
    console.log('Home - Usuario actual:', this.currentUser());
    console.log('Home - Tiene organización:', this.hasOrganization());
    console.log('Home - Mostrar botón:', this.shouldShowJoinButton());

    if (this.hasOrganization()) {
      this.loadPlan();
      this.loadDashboardData();
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private loadPlan(): void {
    console.log('[Home] Loading plan...');

    if (this.planService.isLoaded()) {
      console.log('[Home] Plan already loaded from cache:', this.planCode());
      this.isPlanLoaded.set(true);
      this.logPlanInfo();
      return;
    }

    this.planService.loadPlanFeatures().subscribe({
      next: (plan) => {
        console.log('[Home] Plan loaded successfully:', plan.planCode);
        this.isPlanLoaded.set(true);
        this.logPlanInfo();
      },
      error: (err) => {
        console.error('[Home] Error loading plan:', err);
        this.isPlanLoaded.set(false);
      }
    });
  }

  private logPlanInfo(): void {
    console.log('[Home] Plan Info:', {
      code: this.planCode(),
      name: this.planName(),
      propertyUsage: this.propertyUsage(),
      userUsage: this.userUsage(),
      notificationUsage: this.notificationUsage(),
      features: {
        notifications: this.hasNotifications(),
        advancedReports: this.hasAdvancedReports(),
        maintenancePhotos: this.hasMaintenancePhotos(),
        allowsImages: this.allowsImages()
      }
    });
  }

  openJoinModal(): void {
    this.showJoinModal.set(true);
  }

  closeJoinModal(): void {
    this.showJoinModal.set(false);
  }

  onOrganizationJoined(): void {
    this.showJoinModal.set(false);
    // ✅ Recargar plan y dashboard después de unirse
    this.loadPlan();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
        // Wait for DOM update before creating charts
        setTimeout(() => this.createCharts(), 100);
      },
      error: (err) => {
        this.error.set('Error al cargar los datos del dashboard');
        this.isLoading.set(false);
        console.error('Error loading dashboard:', err);
      }
    });
  }

  private destroyCharts(): void {
    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.destroy();
    }
    if (this.paymentStatusChart) {
      this.paymentStatusChart.destroy();
    }
    if (this.propertyStatusChart) {
      this.propertyStatusChart.destroy();
    }
    if (this.contractStatusChart) {
      this.contractStatusChart.destroy();
    }
    if (this.maintenanceTypeChart) {
      this.maintenanceTypeChart.destroy();
    }
  }

  private createCharts(): void {
    const data = this.dashboardData();
    if (!data) return;

    this.createMonthlyRevenueChart(data.chartsData.monthlyRevenue);
    this.createPaymentStatusChart(data.chartsData.paymentStatus);
    this.createPropertyStatusChart(data.chartsData.propertyStatus);
    this.createContractStatusChart(data.chartsData.contractStatus);
    this.createMaintenanceTypeChart(data.chartsData.maintenanceTypes);
  }

  private createMonthlyRevenueChart(data: any): void {
    const canvas = document.getElementById('monthlyRevenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.monthlyRevenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.months,
        datasets: [
          {
            label: 'Ingresos ($)',
            data: data.revenue,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Cantidad de Pagos',
            data: data.paymentsCount,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Ingresos Mensuales 2024'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Ingresos ($)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cantidad'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  private createPaymentStatusChart(data: any): void {
    const canvas = document.getElementById('paymentStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.paymentStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pagados', 'Pendientes', 'Atrasados'],
        datasets: [{
          data: [data.paid, data.pending, data.overdue],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Estado de Pagos'
          }
        }
      }
    });
  }

  private createPropertyStatusChart(data: any): void {
    const canvas = document.getElementById('propertyStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.propertyStatusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Disponibles', 'Rentadas', 'Mantenimiento'],
        datasets: [{
          label: 'Propiedades',
          data: [data.available, data.rented, data.maintenance],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 191, 36, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(251, 191, 36)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Estado de Propiedades'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  private createContractStatusChart(data: any): void {
    const canvas = document.getElementById('contractStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.contractStatusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Activos', 'Vencidos', 'Por Vencer', 'Renovados', 'Cancelados'],
        datasets: [{
          label: 'Contratos',
          data: [data.active, data.expired, data.expiringSoon, data.renewed, data.canceled],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)',
            'rgb(251, 191, 36)',
            'rgb(59, 130, 246)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Estado de Contratos'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  private createMaintenanceTypeChart(data: any): void {
    const canvas = document.getElementById('maintenanceTypeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.maintenanceTypeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Preventivo', 'Correctivo', 'Emergencia'],
        datasets: [{
          data: [data.preventivo, data.correctivo, data.emergencia],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Tipos de Mantenimiento'
          }
        }
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  getAlertClass(alertType: string): string {
    switch (alertType) {
      case 'OVERDUE':
        return 'alert-danger';
      case 'DUE_TODAY':
        return 'alert-warning';
      case 'DUE_THIS_WEEK':
        return 'alert-info';
      case 'EXPIRING_SOON':
        return 'alert-warning';
      case 'DEPOSIT_PENDING':
        return 'alert-info';
      case 'MAINTENANCE_REQUIRED':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }

  getPlanBadgeClass(): string {
    const code = this.planCode().toLowerCase();
    return `badge-${code}`;
  }

  getUsagePercentageClass(percentage: number): string {
    if (percentage >= 90) return 'text-danger';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  }
}
