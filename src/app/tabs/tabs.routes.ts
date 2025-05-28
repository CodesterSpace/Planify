import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'home',
        loadComponent: () => import('../home/home.page').then( m => m.HomePage)
      },
      {
        path: 'tasks',
        loadComponent: () => import('../tasks/tasks.page').then( m => m.TasksPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then( m => m.ProfilePage)
      },
      {
        path: 'payments',
        loadComponent: () => import('../payments/payments.page').then( m => m.PaymentsPage)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
