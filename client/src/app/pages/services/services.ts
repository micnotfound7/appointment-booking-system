import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceApiService } from '../../services/service-api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  search = '';
  loading = true;

  constructor(
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.serviceApi.getAll().subscribe({
      next: (data: any[]) => {
        this.services = [...data];
        this.filteredServices = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterServices(): void {
    if (!this.search.trim()) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter((s: any) =>
        s.name.toLowerCase().includes(this.search.toLowerCase()) ||
        s.description.toLowerCase().includes(this.search.toLowerCase())
      );
    }
    this.cdr.markForCheck();
  }
}
