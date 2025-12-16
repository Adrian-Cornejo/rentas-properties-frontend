// src/app/shared/directives/has-feature.directive.ts

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {PlanFeature} from '../../core/models/planFeatures/plan-features.model';
import {PlanService} from '../../core/services/plan.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según features del plan
 *
 * Uso:
 * <button *hasFeature="'NOTIFICATIONS'">Configurar Notificaciones</button>
 * <div *hasFeature="'MAINTENANCE_PHOTOS'">
 *   <app-photo-uploader></app-photo-uploader>
 * </div>
 */
@Directive({
  selector: '[hasFeature]',
  standalone: true
})
export class HasFeatureDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() hasFeature!: string | PlanFeature;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private planService: PlanService
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios del plan
    this.planService.currentPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    // Actualizar vista inicial
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasFeature = this.planService.hasFeature(this.hasFeature);

    if (hasFeature && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasFeature && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
