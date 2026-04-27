import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { ServiceApiService } from '../../services/service-api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './book-appointment.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookAppointmentComponent implements OnInit {
  form: FormGroup;
  service: any = null;
  loading = false;
  checkingSlot = false;
  success = '';
  error = '';
  slotWarning = '';
  bookedSlots: string[] = [];

  timeSlots = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private serviceApi: ServiceApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      appointment_date: ['', Validators.required],
      appointment_time: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('serviceId');
    this.serviceApi.getAll().subscribe({
      next: (services: any[]) => {
        this.service = services.find((s: any) => s.id == serviceId);
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });

    this.form.get('appointment_date')?.valueChanges.subscribe(date => {
      if (date) this.checkBookedSlots(date);
    });

    this.form.get('appointment_time')?.valueChanges.subscribe(() => {
      this.checkSlotConflict();
    });
  }

  checkBookedSlots(date: string): void {
    this.checkingSlot = true;
    this.bookedSlots = [];
    this.slotWarning = '';
    this.cdr.markForCheck();

    this.http.get<any[]>(
      `http://localhost:3000/api/appointments/check?date=${date}&service_id=${this.service?.id}`
    ).subscribe({
      next: (data: any[]) => {
        this.bookedSlots = data.map((a: any) => a.appointment_time.substring(0, 5));
        this.checkingSlot = false;
        this.checkSlotConflict();
        this.cdr.markForCheck();
      },
      error: () => {
        this.checkingSlot = false;
        this.cdr.markForCheck();
      }
    });
  }

  checkSlotConflict(): void {
    const time = this.form.get('appointment_time')?.value;
    if (time && this.bookedSlots.includes(time)) {
      this.slotWarning = `This time slot (${this.formatTime(time)}) is already booked.`;
    } else {
      this.slotWarning = '';
    }
    this.cdr.markForCheck();
  }

  isSlotBooked(time: string): boolean {
    return this.bookedSlots.includes(time);
  }

  getTimeSlotClass(time: string): string {
    const selected = this.form.get('appointment_time')?.value === time;
    const booked = this.isSlotBooked(time);

    if (booked) return 'py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition bg-red-50 text-red-400 border-2 border-red-200 cursor-not-allowed opacity-60';
    if (selected) return 'py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition bg-blue-600 text-white border-2 border-blue-600 shadow-md';
    return 'py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600';
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.slotWarning) { this.error = 'Please select an available time slot.'; return; }
    this.loading = true;
    this.error = '';
    const data = { service_id: this.service.id, ...this.form.value };
    this.appointmentService.create(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Appointment booked successfully!';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/my-appointments']), 2000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Booking failed';
        this.cdr.markForCheck();
      }
    });
  }
}