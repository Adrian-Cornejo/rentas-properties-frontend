import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { JoinOrganizationModalComponent } from '../../../shared/components/join-organization-modal/join-organization-modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    JoinOrganizationModalComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);

  // Signals
  currentUser = this.authService.currentUser;
  showJoinModal = signal<boolean>(false);

  // Computed
  hasOrganization = computed(() => !!this.currentUser()?.organizationId);
  isRegularUser = computed(() => this.currentUser()?.role === 'USER');
  shouldShowJoinButton = computed(() =>
    this.isRegularUser() && !this.hasOrganization()
  );

  ngOnInit(): void {
    console.log('Home - Usuario actual:', this.currentUser());
    console.log('Home - Tiene organización:', this.hasOrganization());
    console.log('Home - Mostrar botón:', this.shouldShowJoinButton());
  }

  openJoinModal(): void {
    this.showJoinModal.set(true);
  }

  closeJoinModal(): void {
    this.showJoinModal.set(false);
  }

  onOrganizationJoined(): void {
    this.showJoinModal.set(false);
  }
}
