import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonContent, IonCardContent,
  IonGrid, IonRow, IonCol, IonButton,IonIcon
} from '@ionic/angular/standalone';
  
import { ProjectCardComponent } from '../components/project-card/project-card.component';

import { ProjectService } from '../services/project.service'; // adapte le chemin

import { addIcons } from 'ionicons';
import { apps } from 'ionicons/icons';
import { Router } from '@angular/router';
import { TabsComponent } from '../components/tabs/tabs.component';
import { using } from 'rxjs';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonContent, IonCardContent, 
    IonGrid, IonRow, IonCol, IonButton,IonIcon, CommonModule, 
    FormsModule,ProjectCardComponent, TabsComponent]
})
export class HomePage implements OnInit {

  projects: any[] = [];

  userid = localStorage.getItem('userid');
  userData: any; // ou un type plus précis si tu en as un (ex: User)
  name: any;
  
  constructor(
    private router: Router,
    private userService: UserService,
    private projectService: ProjectService
  ) {
    addIcons({apps,});
  }
  

  ngOnInit() {
    if (this.userid) {
      this.loadUser(this.userid)
      this.LoadProjectsForOwnerNMember(this.userid)
    }
  }
  
  LoadProjectsForOwnerNMember(userid: string) {
    this.projectService.getProjectsForOwnerNMember(userid).subscribe(projects => {
      this.projects = projects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // 🔹 Tri décroissant (récent → ancien)
        .slice(0, 6); // 🔹 Limiter à 6 projets
    });
  }

  // Dans ton component.ts
  loadUser(userid: string) {
    this.userService.getUserById(userid).subscribe({
      next: (user) => {
        if (user) {
          this.userData = user; // Assure-toi d'avoir déclaré `userData` dans ton composant
          this.name = this.userData.name || 'Utilisateur';  // Si userData.name est undefined ou null, on assigne une chaîne vide

          console.log('Utilisateur chargé :', user);
        } else {
          console.warn('Aucun utilisateur trouvé avec l\'ID:', userid);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'utilisateur :', err);
      }
    });
  }

  goToProfile() {
    this.router.navigate(['compte/profile']);
  }

  goToProjects() {
    this.router.navigate(['projects']);
  }

}
