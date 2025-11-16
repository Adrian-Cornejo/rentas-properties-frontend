import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    RouterOutlet,
    ToastModule
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('rental-properties-frontend');
}
