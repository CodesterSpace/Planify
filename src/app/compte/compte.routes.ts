import { Routes } from "@angular/router";
import { ComptePage } from "./compte.page";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./compte.page').then(m => m.ComptePage) // Affiché pour "/client/register"
    },
    /*
    {
        path: 'login',
        loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) // Affiché pour "/client/register"
    },
    */ 
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
    }
];
