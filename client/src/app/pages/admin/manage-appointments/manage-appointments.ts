import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-appointments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filtered: any[] = [];
  users: any[] = [];
  loading = true;
  loadingUsers = true;
  search = '';
  statusFilter = '';
  activeTab: 'appointments' | 'users' = 'appointments';
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  paginatedAppointments: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadUsers();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.appointmentService.getAllAppointments().subscribe({
      next: (data: any[]) => {
        this.appointments = [...data];
        this.filtered = [...data];
        this.loading = false;
        this.updatePagination();
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.http.get<any[]>('https://bookease-backend-9p4b.onrender.com/api/users').subscribe({
      next: (data) => {
        this.users = data;
        this.loadingUsers = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingUsers = false; this.cdr.markForCheck(); }
    });
  }

  filter(): void {
    this.filtered = this.appointments.filter((a: any) => {
      const matchSearch = !this.search ||
        a.user_name?.toLowerCase().includes(this.search.toLowerCase()) ||
        a.service_name?.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = !this.statusFilter || a.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.markForCheck();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAppointments = this.filtered.slice(start, start + this.itemsPerPage);
    this.cdr.markForCheck();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  updateStatus(id: number, status: string): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err.error?.message || 'Error')
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getRoleClass(role: string): string {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  }
}