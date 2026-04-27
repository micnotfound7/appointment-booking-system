import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  stats = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, users: 0, services: 0 };
  recentAppointments: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/api/appointments').subscribe({
      next: (data) => {
        this.stats.total = data.length;
        this.stats.pending = data.filter(a => a.status === 'pending').length;
        this.stats.confirmed = data.filter(a => a.status === 'confirmed').length;
        this.stats.completed = data.filter(a => a.status === 'completed').length;
        this.stats.cancelled = data.filter(a => a.status === 'cancelled').length;
        this.recentAppointments = data.slice(0, 5);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });

    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => { this.stats.users = data.length; this.cdr.markForCheck(); }
    });

    this.http.get<any[]>('http://localhost:3000/api/services').subscribe({
      next: (data) => { this.stats.services = data.length; this.cdr.markForCheck(); }
    });
  }
}