import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Guard to redirect admin away from home
const homeGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    canActivate: [homeGuard],
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services').then(m => m.ServicesComponent)
  },
  {
    path: 'book/:serviceId',
    loadComponent: () =>
      import('./pages/book-appointment/book-appointment')
        .then(m => m.BookAppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-appointments',
    loadComponent: () =>
      import('./pages/my-appointments/my-appointments')
        .then(m => m.MyAppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/appointments',
    loadComponent: () =>
      import('./pages/admin/manage-appointments/manage-appointments')
        .then(m => m.ManageAppointmentsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/services',
    loadComponent: () =>
      import('./pages/admin/manage-services/manage-services')
        .then(m => m.ManageServicesComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];