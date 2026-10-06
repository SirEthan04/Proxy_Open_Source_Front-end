import { Component, inject, signal } from '@angular/core';

import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { IamStore } from '../../../iam/application/iam.store';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(false);

  readonly currentUser = this.iamStore.currentUser;
  readonly isAdmin = this.iamStore.isAdmin;
  readonly isEmployee = this.iamStore.isEmployee;

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  signOut(): void {
    this.iamStore.signOut();

    this.closeSidebar();

    this.router.navigate(['/sign-in']);
  }
}
