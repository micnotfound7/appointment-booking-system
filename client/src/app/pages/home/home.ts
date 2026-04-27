import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApiService } from '../../services/service-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  services: any[] = [];
  isLoggedIn = false;

  constructor(
    private serviceApi: ServiceApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.cdr.detectChanges();

    this.auth.currentUser$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      this.cdr.detectChanges();
    });

    this.serviceApi.getAll().subscribe({
      next: (data: any[]) => {
        this.services = [...data.slice(0, 3)];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err)
    });
  }
}