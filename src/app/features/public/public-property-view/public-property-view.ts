import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicPropertyService } from '../../../core/services/public-property.service';
import { PublicPropertyResponse } from '../../../core/models/properties/public-property-response';

@Component({
  selector: 'app-public-property-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-property-view.html',
  styleUrl: './public-property-view.css',
})
export class PublicPropertyViewComponent implements OnInit {
  private publicPropertyService = inject(PublicPropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  property = signal<PublicPropertyResponse | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentImageIndex = signal<number>(0);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const propertyId = params['id'];
      if (propertyId) {
        this.loadPublicProperty(propertyId);
      } else {
        this.error.set('ID de propiedad no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  private loadPublicProperty(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.publicPropertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.isLoading.set(false);

        // Aplicar colores de la organización si están disponibles
        if (data.organizationPrimaryColor) {
          this.applyOrganizationTheme(data.organizationPrimaryColor);
        }
      },
      error: (err) => {
        console.error('Error al cargar propiedad pública:', err);
        this.error.set('No se pudo cargar la información de la propiedad');
        this.isLoading.set(false);
      }
    });
  }

  private applyOrganizationTheme(primaryColor: string): void {
    document.documentElement.style.setProperty('--org-primary-color', primaryColor);
  }

  nextImage(): void {
    const images = this.property()?.imageUrls || [];
    if (images.length > 0) {
      this.currentImageIndex.update(i => (i + 1) % images.length);
    }
  }

  previousImage(): void {
    const images = this.property()?.imageUrls || [];
    if (images.length > 0) {
      this.currentImageIndex.update(i => (i - 1 + images.length) % images.length);
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  getServicesList(): string[] {
    const property = this.property();
    if (!property) return [];

    const services: string[] = [];
    if (property.includesWater) services.push('Agua');
    if (property.includesElectricity) services.push('Electricidad');
    if (property.includesGas) services.push('Gas');
    if (property.includesInternet) services.push('Internet');

    return services;
  }

  getFeaturesList(): string[] {
    const property = this.property();
    if (!property) return [];

    const features: string[] = [];
    if (property.hasLivingRoom) features.push('Sala');
    if (property.hasDiningRoom) features.push('Comedor');
    if (property.hasKitchen) features.push('Cocina');
    if (property.hasServiceArea) features.push('Área de servicio');

    return features;
  }
}
