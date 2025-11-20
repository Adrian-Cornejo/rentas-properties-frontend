import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationResponse } from '../../../../core/models/location/location-response';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-card.html',
  styleUrl: './location-card.css'
})
export class LocationCardComponent {
  location = input.required<LocationResponse>();

  edit = output<string>();
  delete = output<string>();

  onEdit(): void {
    this.edit.emit(this.location().id);
  }

  onDelete(): void {
    this.delete.emit(this.location().id);
  }
}
