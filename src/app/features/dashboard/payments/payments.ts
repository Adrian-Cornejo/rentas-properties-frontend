import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class PaymentsComponent {}
