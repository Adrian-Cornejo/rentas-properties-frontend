// src/app/features/dashboard/reports/reports.component.ts

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PlanService } from '../../../core/services/plan.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  private readonly planService = inject(PlanService);

  // Señales computadas para permisos
  hasReportAccess = computed(() => {
return true;
  });

  hasAdvancedReports = computed(() => {
    return this.planService.hasFeature('ADVANCED_REPORTS');
  });

  hasPdfReports = computed(() => {
    return this.planService.hasFeature('PDF_REPORTS');
  });

  hasDataExport = computed(() => {
    return this.planService.hasFeature('DATA_EXPORT');
  });

  // Información del plan para mostrar en UI
  planName = computed(() => {
    const plan = this.planService.planDataSignal();
    return plan?.planName || 'STARTER';
  });

  reportHistoryDays = computed(() => {
    const days = this.planService.getLimit('reportHistoryDays');
    return days === -1 ? 'Ilimitado' : `${days} días`;
  });

  // Lista de reportes disponibles
  reports = [
    {
      route: 'financial',
      icon: 'pi pi-dollar',
      label: 'Financiero',
      description: 'Ingresos, gastos y rentabilidad'
    },
    {
      route: 'occupancy',
      icon: 'pi pi-percentage',
      label: 'Ocupación',
      description: 'Tasas de ocupación y vacancia'
    },
    {
      route: 'payment',
      icon: 'pi pi-wallet',
      label: 'Pagos/Morosidad',
      description: 'Estado de pagos y cobranza'
    },
    {
      route: 'maintenance',
      icon: 'pi pi-wrench',
      label: 'Mantenimientos',
      description: 'Costos y frecuencia de mantenimiento'
    },
    {
      route: 'executive',
      icon: 'pi pi-briefcase',
      label: 'Ejecutivo',
      description: 'Vista estratégica del negocio',
      premium: true
    }
  ];

  // Filtrar reportes según el plan
  availableReports = computed(() => {
    return this.reports.filter(report => {
      if (report.premium) {
        return this.hasAdvancedReports();
      }
      return true;
    });
  });
}
