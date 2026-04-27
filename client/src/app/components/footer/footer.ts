import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-0">

      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <!-- Brand -->
          <div class="col-span-1">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">🏥</span>
              <span class="text-xl font-bold text-white">BookEase</span>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Professional healthcare appointment booking system. 
              Fast, secure, and reliable.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Quick Links
            </h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/" class="text-gray-400 hover:text-white text-sm transition">
                  🏠 Home
                </a>
              </li>
              <li>
                <a routerLink="/services" class="text-gray-400 hover:text-white text-sm transition">
                  🏥 Services
                </a>
              </li>
              <li>
                <a routerLink="/my-appointments" class="text-gray-400 hover:text-white text-sm transition">
                  📅 My Appointments
                </a>
              </li>
              <li>
                <a routerLink="/profile" class="text-gray-400 hover:text-white text-sm transition">
                  👤 Profile
                </a>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Contact
            </h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center gap-2">
                <span>📧</span> bookease&#64;gmail.com
              </li>
              <li class="flex items-center gap-2">
                <span>📞</span> +63 9939782042
              </li>
              <li class="flex items-center gap-2">
                <span>📍</span> ILoilo City, Philippines
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-gray-500 text-xs sm:text-sm">
            © 2026 BookEase. All rights reserved.
          </p>
         
        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {}