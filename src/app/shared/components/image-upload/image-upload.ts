import {Component, input, output, signal, effect, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUploadComponent {
  private readonly cloudinaryService = inject(CloudinaryService);
  // private readonly toastService = inject(ToastService);

  // Inputs
  imageUrl = input<string>('');
  altText = input<string>('Uploaded image');
  folder = input<string>('rentmaster');

  // Outputs
  imageUrlChange = output<string>();
  uploadComplete = output<string>();
  uploadError = output<string>();

  // Signals
  currentImageUrl = signal<string>('');
  isUploading = signal<boolean>(false);
  previousPublicId = signal<string>('');

  constructor() {
    effect(() => {
      this.currentImageUrl.set(this.imageUrl());
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tamaño
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      // this.toastService.showError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    // Validar formato
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      // this.toastService.showError('Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.');
      return;
    }

    this.uploadImage(file);
    input.value = ''; // Reset input
  }

  private uploadImage(file: File): void {
    this.isUploading.set(true);

    this.cloudinaryService.uploadImage(file, this.folder()).subscribe({
      next: (response) => {
        this.currentImageUrl.set(response.url);
        this.previousPublicId.set(response.publicId);
        this.imageUrlChange.emit(response.url);
        this.uploadComplete.emit(response.url);
        this.isUploading.set(false);
        // this.toastService.showSuccess('Imagen subida correctamente');
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.isUploading.set(false);
        const errorMessage = error.error?.message || 'Error al subir la imagen';
        // this.toastService.showError(errorMessage);
        this.uploadError.emit(errorMessage);
      }
    });
  }

  removeImage(): void {
    if (!this.currentImageUrl()) return;

    this.currentImageUrl.set('');
    this.imageUrlChange.emit('');
    // this.toastService.showSuccess('Imagen eliminada');
  }
}
