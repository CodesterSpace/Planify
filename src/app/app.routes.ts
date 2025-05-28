import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.page').then( m => m.TasksPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/payments.page').then( m => m.PaymentsPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'add-project',
    loadComponent: () => import('./add-project/add-project.page').then( m => m.AddProjectPage)
  },
  {
    path: 'project/:id',
    loadComponent: () => import('./project/project.page').then( m => m.ProjectPage)
  },
  {
    path: 'task-detail',
    loadComponent: () => import('./task-detail/task-detail.page').then( m => m.TaskDetailPage)
  },
  {
    path: 'compte',
    loadChildren: () => import('./compte/compte.routes').then(m => m.routes)
  },
  {
    path: 'projects',
    loadComponent: () => import('./projects/projects.page').then( m => m.ProjectsPage)
  },
];

