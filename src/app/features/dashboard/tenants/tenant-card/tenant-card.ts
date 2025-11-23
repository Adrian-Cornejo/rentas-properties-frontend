import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantResponse } from '../../../../core/models/tenents/tenant-response';

@Component({
  selector: 'app-tenant-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-card.html',
  styleUrl: '../tenants.css',
})
export class TenantCardComponent {
  @Input({ required: true }) tenant!: TenantResponse;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onEdit(): void {
    this.edit.emit(this.tenant.id);
  }

  onDelete(): void {
    this.delete.emit(this.tenant.id);
  }

  getStatusLabel(): string {
    return this.tenant.isActive ? 'Activo' : 'Inactivo';
  }

  getStatusClass(): string {
    return this.tenant.isActive ? 'status-active' : 'status-inactive';
  }

  hasActiveContracts(): boolean {
    return this.tenant.activeContractsCount > 0;
  }

  getContractsText(): string {
    const count = this.tenant.activeContractsCount;
    return count === 1 ? '1 contrato activo' : `${count} contratos activos`;
  }
}
