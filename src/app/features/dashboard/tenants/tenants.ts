import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './tenants.html',
})
export class TenantsComponent {}
