import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { LocationService } from '../../../../core/services/location.service';
import { SepomexService } from '../../../../core/services/sepomex.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateLocationRequest } from '../../../../core/models/location/location-request';
import { UpdateLocationRequest } from '../../../../core/models/location/update-location-request';
import { LocationDetailResponse } from '../../../../core/models/location/location-detail-response';
import {
  SepomexStateResponse,
  SepomexMunicipalityResponse,
  SepomexNeighborhoodDetailResponse
} from '../../../../core/models/sepomex/sepomex-response';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select
  ],
  templateUrl: './location-form.html',
  styleUrl: './location-form.css'
})
export class LocationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(LocationService);
  private sepomexService = inject(SepomexService);
  private notification = inject(NotificationService);

  locationForm!: FormGroup;
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  locationId = signal<string | null>(null);
  locationData = signal<LocationDetailResponse | null>(null);

  // SEPOMEX Data
  states = signal<SepomexStateResponse[]>([]);
  municipalities = signal<SepomexMunicipalityResponse[]>([]);
  neighborhoods = signal<SepomexNeighborhoodDetailResponse[]>([]);

  isLoadingStates = signal<boolean>(false);
  isLoadingMunicipalities = signal<boolean>(false);
  isLoadingNeighborhoods = signal<boolean>(false);

  // Signals para rastrear cambios en los campos
  selectedNeighborhood = signal<string>('');
  selectedMunicipality = signal<string>('');
  selectedState = signal<string>('');

  // Computed: generar nombre automáticamente
  generatedLocationName = computed(() => {
    const neighborhood = this.selectedNeighborhood();
    const municipality = this.selectedMunicipality();
    const state = this.selectedState();

    if (!neighborhood || !municipality || !state) {
      return 'Sin nombre definido';
    }

    return `${neighborhood}, ${municipality}, ${state}`;
  });

  ngOnInit(): void {
    this.initForm();
    this.loadStates();
    this.checkEditMode();
  }

  private initForm(): void {
    this.locationForm = this.fb.group({
      state: ['', Validators.required],
      stateCode: [''],
      municipality: ['', Validators.required],
      municipalityCode: [''],
      neighborhood: ['', Validators.required],
      neighborhoodCode: [''],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      neighborhoodType: [''],
      zoneType: [''],
      streetAddress: ['', Validators.maxLength(500)],
      description: ['', Validators.maxLength(1000)]
    });

    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    // Escuchar cambios en state para actualizar el signal
    this.locationForm.get('state')?.valueChanges.subscribe(state => {
      this.selectedState.set(state || '');
    });

    // Escuchar cambios en municipality para actualizar el signal
    this.locationForm.get('municipality')?.valueChanges.subscribe(municipality => {
      this.selectedMunicipality.set(municipality || '');
    });

    // Escuchar cambios en neighborhood para actualizar el signal
    this.locationForm.get('neighborhood')?.valueChanges.subscribe(neighborhood => {
      this.selectedNeighborhood.set(neighborhood || '');
    });

    // Cuando cambia el código del estado, cargar municipios
    this.locationForm.get('stateCode')?.valueChanges.subscribe(stateCode => {
      console.log('State code changed:', stateCode);

      if (stateCode) {
        this.loadMunicipalities(stateCode);

        this.locationForm.patchValue({
          municipality: '',
          municipalityCode: '',
          neighborhood: '',
          neighborhoodCode: '',
          postalCode: '',
          neighborhoodType: '',
          zoneType: ''
        }, { emitEvent: false });

        // Limpiar signals
        this.selectedMunicipality.set('');
        this.selectedNeighborhood.set('');

        this.municipalities.set([]);
        this.neighborhoods.set([]);
      }
    });

    // Cuando cambia el código del municipio, cargar colonias
    this.locationForm.get('municipalityCode')?.valueChanges.subscribe(municipalityCode => {
      console.log('Municipality code changed:', municipalityCode);

      if (municipalityCode) {
        const stateCode = this.locationForm.get('stateCode')?.value;

        if (stateCode) {
          this.loadNeighborhoods(stateCode, municipalityCode);
        }

        this.locationForm.patchValue({
          neighborhood: '',
          neighborhoodCode: '',
          postalCode: '',
          neighborhoodType: '',
          zoneType: ''
        }, { emitEvent: false });

        // Limpiar signal
        this.selectedNeighborhood.set('');

        this.neighborhoods.set([]);
      }
    });
  }

  private loadStates(): void {
    this.isLoadingStates.set(true);

    this.sepomexService.getAllStates().subscribe({
      next: (data) => {
        console.log('States loaded:', data);
        this.states.set(data);
        this.isLoadingStates.set(false);
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.notification.error('Error al cargar estados');
        this.isLoadingStates.set(false);
      }
    });
  }

  private loadMunicipalities(stateCode: string): void {
    console.log('Loading municipalities for state code:', stateCode);

    this.isLoadingMunicipalities.set(true);

    this.sepomexService.getMunicipalitiesByState(stateCode).subscribe({
      next: (data) => {
        console.log('Municipalities loaded:', data);
        this.municipalities.set(data);
        this.isLoadingMunicipalities.set(false);
      },
      error: (error) => {
        console.error('Error loading municipalities:', error);
        this.notification.error('Error al cargar municipios');
        this.isLoadingMunicipalities.set(false);
      }
    });
  }

  private loadNeighborhoods(stateCode: string, municipalityCode: string): void {
    console.log('Loading neighborhoods - stateCode:', stateCode, 'municipalityCode:', municipalityCode);

    this.isLoadingNeighborhoods.set(true);

    this.sepomexService.searchNeighborhoodsByMunicipalityCode(stateCode, municipalityCode).subscribe({
      next: (data) => {
        console.log('Neighborhoods loaded:', data);
        this.neighborhoods.set(data);
        this.isLoadingNeighborhoods.set(false);
      },
      error: (error) => {
        console.error('Error loading neighborhoods:', error);
        this.notification.error('Error al cargar colonias');
        this.isLoadingNeighborhoods.set(false);
      }
    });
  }

  onStateChange(event: any): void {
    console.log('State change event:', event);

    const selectedState = this.states().find(s => s.code === event.value);

    console.log('Selected state:', selectedState);

    if (selectedState) {
      this.locationForm.patchValue({
        state: selectedState.name
      }, { emitEvent: false });

      // Actualizar signal manualmente ya que usamos emitEvent: false
      this.selectedState.set(selectedState.name);
    }
  }

  onMunicipalityChange(event: any): void {
    console.log('Municipality change event:', event);

    const selectedMunicipality = this.municipalities().find(m => m.code === event.value);

    console.log('Selected municipality:', selectedMunicipality);

    if (selectedMunicipality) {
      this.locationForm.patchValue({
        municipality: selectedMunicipality.name
      }, { emitEvent: false });

      // Actualizar signal manualmente ya que usamos emitEvent: false
      this.selectedMunicipality.set(selectedMunicipality.name);
    }
  }

  onNeighborhoodChange(event: any): void {

    const selectedCode = this.locationForm.get('neighborhoodCode')?.value;

    const selectedNeighborhood = this.neighborhoods().find(n => n.code === selectedCode);

    if (selectedNeighborhood) {
      this.locationForm.patchValue({
        neighborhood: selectedNeighborhood.name,
        postalCode: selectedNeighborhood.postalCode,
        neighborhoodType: selectedNeighborhood.settlementType,
        zoneType: selectedNeighborhood.zoneType
      }, { emitEvent: false });

      // Actualizar signal manualmente ya que usamos emitEvent: false
      this.selectedNeighborhood.set(selectedNeighborhood.name);

      console.log('Form updated with:', {
        neighborhood: selectedNeighborhood.name,
        postalCode: selectedNeighborhood.postalCode,
        neighborhoodType: selectedNeighborhood.settlementType,
        zoneType: selectedNeighborhood.zoneType
      });
    }
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.locationId.set(id);
      this.isEditMode.set(true);
      this.loadLocation(id);
    }
  }

  private loadLocation(id: string): void {
    this.isLoading.set(true);

    this.locationService.getLocationById(id).subscribe({
      next: async (data) => {
        this.locationData.set(data);

        // Buscar el estado por nombre
        const state = this.states().find(s => s.name === data.state);

        // Establecer valores básicos
        this.locationForm.patchValue({
          state: data.state || '',
          stateCode: state?.code || '',
          streetAddress: data.streetAddress || '',
          description: data.description || ''
        }, { emitEvent: false });

        // Inicializar signal del estado
        this.selectedState.set(data.state || '');

        if (state?.code) {
          await this.loadMunicipalitiesAndWait(state.code);

          const municipality = this.municipalities().find(m => m.name === data.municipality);

          if (municipality) {
            this.locationForm.patchValue({
              municipality: data.municipality || '',
              municipalityCode: municipality.code
            }, { emitEvent: false });

            // Inicializar signal del municipio
            this.selectedMunicipality.set(data.municipality || '');

            // Cargar colonias si hay municipio
            await this.loadNeighborhoodsAndWait(state.code, municipality.code);

            // Después de cargar colonias, buscar el código de la colonia
            const neighborhood = this.neighborhoods().find(n => n.name === data.neighborhood);

            if (neighborhood) {
              this.locationForm.patchValue({
                neighborhood: data.neighborhood || '',
                neighborhoodCode: neighborhood.code,
                postalCode: data.postalCode || '',
                neighborhoodType: data.neighborhoodType || '',
                zoneType: data.zoneType || ''
              }, { emitEvent: false });

              // Inicializar signal de la colonia
              this.selectedNeighborhood.set(data.neighborhood || '');
            }
          }
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar ubicación');
        this.isLoading.set(false);
        this.router.navigate(['/dashboard/locations']);
      }
    });
  }

  private loadMunicipalitiesAndWait(stateCode: string): Promise<void> {
    return new Promise((resolve) => {
      this.isLoadingMunicipalities.set(true);

      this.sepomexService.getMunicipalitiesByState(stateCode).subscribe({
        next: (data) => {
          this.municipalities.set(data);
          this.isLoadingMunicipalities.set(false);
          resolve();
        },
        error: (error) => {
          console.error('Error loading municipalities:', error);
          this.isLoadingMunicipalities.set(false);
          resolve();
        }
      });
    });
  }

  private loadNeighborhoodsAndWait(stateCode: string, municipalityCode: string): Promise<void> {
    return new Promise((resolve) => {
      this.isLoadingNeighborhoods.set(true);

      this.sepomexService.searchNeighborhoodsByMunicipalityCode(stateCode, municipalityCode).subscribe({
        next: (data) => {
          this.neighborhoods.set(data);
          this.isLoadingNeighborhoods.set(false);
          resolve();
        },
        error: (error) => {
          console.error('Error loading neighborhoods:', error);
          this.isLoadingNeighborhoods.set(false);
          resolve();
        }
      });
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      this.locationForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.locationForm.value;

    if (this.isEditMode()) {
      this.updateLocation(formValue);
    } else {
      this.createLocation(formValue);
    }
  }

  private createLocation(formValue: any): void {
    const request: CreateLocationRequest = {
      name: this.generatedLocationName(), // Usar el nombre generado
      state: formValue.state,
      municipality: formValue.municipality,
      neighborhood: formValue.neighborhood,
      postalCode: formValue.postalCode,
      neighborhoodType: formValue.neighborhoodType || undefined,
      zoneType: formValue.zoneType || undefined,
      streetAddress: formValue.streetAddress || undefined,
      description: formValue.description || undefined
    };

    this.locationService.createLocation(request).subscribe({
      next: () => {
        this.notification.success('Ubicación creada exitosamente');
        this.router.navigate(['/dashboard/locations']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al crear ubicación');
        this.isSaving.set(false);
      }
    });
  }

  private updateLocation(formValue: any): void {
    const request: UpdateLocationRequest = {
      name: this.generatedLocationName(), // Usar el nombre generado
      state: formValue.state || undefined,
      municipality: formValue.municipality || undefined,
      neighborhood: formValue.neighborhood || undefined,
      postalCode: formValue.postalCode || undefined,
      neighborhoodType: formValue.neighborhoodType || undefined,
      zoneType: formValue.zoneType || undefined,
      streetAddress: formValue.streetAddress || undefined,
      description: formValue.description || undefined
    };

    this.locationService.updateLocation(this.locationId()!, request).subscribe({
      next: () => {
        this.notification.success('Ubicación actualizada exitosamente');
        this.router.navigate(['/dashboard/locations']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al actualizar ubicación');
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/locations']);
  }
}
