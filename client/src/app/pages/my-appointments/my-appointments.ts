import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-appointments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  paginatedItems: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { 
    this.loadAppointments(); 
  }

  loadAppointments(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.appointmentService.getMyAppointments().subscribe({
      next: (data: any[]) => {
        this.appointments = [...data];
        this.filtered = [...data];
        this.loading = false;
        this.updatePagination();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filter(): void {
    this.filtered = this.appointments.filter((a: any) => {
      const matchSearch = !this.search ||
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
    this.paginatedItems = this.filtered.slice(start, start + this.itemsPerPage);
    this.cdr.markForCheck();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.appointmentService.delete(id).subscribe({
      next: () => this.loadAppointments(),
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
}
