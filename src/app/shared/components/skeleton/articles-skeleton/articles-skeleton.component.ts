import { Component } from '@angular/core';

@Component({
  selector: 'app-articles-skeleton',
  standalone: true,
  template: `
    <section class="overflow-x-hidden">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-11 items-start">
          <!-- Main Content Skeleton -->
          <div class="xl:col-span-9 xl:text-justify order-2 xl:order-1">
            <!-- Article Cards Skeleton -->
            @for (item of [1, 2, 3]; track item) {
            <div class="mb-8 animate-pulse">
              <div class="bg-white rounded-lg overflow-hidden">
                <!-- Image Skeleton -->
                <div class="aspect-[16/9] bg-gray-200 rounded-lg"></div>

                <!-- Content Skeleton -->
                <div class="p-6">
                  <!-- Title -->
                  <div class="h-8 bg-gray-200 w-3/4 mb-4 rounded"></div>

                  <!-- Description -->
                  <div class="space-y-3 mb-4">
                    <div class="h-4 bg-gray-200 w-full rounded"></div>
                    <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
                    <div class="h-4 bg-gray-200 w-4/6 rounded"></div>
                  </div>

                  <!-- Meta Info -->
                  <div class="flex items-center gap-4">
                    <div class="h-6 bg-gray-200 w-32 rounded"></div>
                    <div class="h-6 bg-gray-200 w-24 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            }

            <!-- Pagination Skeleton -->
            <div class="flex justify-center mt-8 animate-pulse">
              <div class="flex items-center gap-2">
                @for (item of [1, 2, 3]; track item) {
                <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar Skeleton -->
          <div class="xl:col-span-3 order-1 xl:order-2">
            <!-- Popular Section Skeleton -->
            <div class="mb-3 animate-pulse">
              <div class="h-8 bg-gray-200 w-48 rounded mb-4"></div>
              @for (item of [1, 2, 3, 4]; track item) {
              <div class="p-3 mb-3 bg-gray-200 rounded-[15px] h-12"></div>
              }
            </div>

            <!-- Best Selling Section Skeleton -->
            <div class="mb-[60px] animate-pulse">
              <div class="h-8 bg-gray-200 w-48 rounded mb-4"></div>
              @for (item of [1, 2, 3, 4]; track item) {
              <div class="flex gap-2 items-center mb-[23px]">
                <!-- Thumbnail -->
                <div class="w-[99px] h-[99px] bg-gray-200 rounded-[15px]"></div>
                <!-- Content -->
                <div class="flex-1">
                  <div class="h-5 bg-gray-200 w-full rounded mb-2"></div>
                  <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
                </div>
              </div>
              }
            </div>

            <!-- Talent Image Card Skeleton -->
            <div class="hidden xl:block animate-pulse">
              <div class="aspect-[3/4] bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class ArticlesSkeletonComponent {}
