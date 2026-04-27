import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceApiService } from '../../../services/service-api.service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './manage-services.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageServicesComponent implements OnInit {
  services: any[] = [];
  loading = true;
  showForm = false;
  editingId: number | null = null;
  form: FormGroup;
  saving = false;
  error = '';

  constructor(
    private serviceApi: ServiceApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      duration_minutes: ['', Validators.required],
      price: ['', Validators.required],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.serviceApi.getAll().subscribe({
      next: (data: any[]) => {
        this.services = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form.reset();
    this.showForm = true;
    this.error = '';
    this.cdr.markForCheck();
  }

  openEdit(service: any): void {
    this.editingId = service.id;
    this.form.patchValue(service);
    this.showForm = true;
    this.error = '';
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset();
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error = '';

    const obs = this.editingId
      ? this.serviceApi.update(this.editingId, this.form.value)
      : this.serviceApi.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.load();
      },
      error: (err: any) => {
        this.saving = false;
        this.error = err.error?.message || 'Error saving service';
        this.cdr.markForCheck();
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this service?')) return;
    this.serviceApi.delete(id).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err.error?.message || 'Error')
    });
  }
}