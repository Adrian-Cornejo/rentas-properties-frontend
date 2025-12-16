// src/app/shared/components/plan-badge/plan-badge.component.ts

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PlanService} from '../../../core/services/plan.service';


@Component({
  selector: 'app-plan-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-badge.html',
  styleUrl: './plan-badge.css'
})
export class PlanBadgeComponent {
  constructor(public planService: PlanService) {}

  badgeClass = computed(() => {
    const planCode = this.planService.planCode().toLowerCase();
    return `plan-${planCode}`;
  });
}
