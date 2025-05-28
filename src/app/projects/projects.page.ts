import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonContent, IonCardContent,
  IonGrid, IonRow, IonCol, IonButton, IonIcon, 
  IonLabel, IonHeader, IonToolbar, IonTitle, IonItem, IonList, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, folderOutline, briefcaseOutline, fastFoodOutline, bookOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ProjectsCompComponent } from '../components/projects-comp/projects-comp.component';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  standalone: true,
  imports: [
    IonCard,IonCardHeader, IonCardTitle, IonContent, IonCardContent, IonButton, IonIcon,
    IonLabel, IonItem, IonList, IonAvatar, CommonModule
  ]
})
export class ProjectsPage implements OnInit {

  userid = localStorage.getItem('userid');

  folders: any[] = [];
  projects: any[] = [];
  t_projects: any[] = [];

  constructor(
    private router: Router,
    private projectService: ProjectService
  ) { 
    addIcons({
      arrowBack, 
      folderOutline, 
      briefcaseOutline, 
      fastFoodOutline, 
      bookOutline
    });
  }

  ngOnInit() {
    if (this.userid) {
      this.LoadProjectsForOwner(this.userid, 6);
      this.LoadProjectsForTeam(this.userid, 6);
      this.LoadFoldersForUser(this.userid);
    }
  }

  UnlimitedProject(){
    if (this.userid) {
      this.LoadProjectsForOwner(this.userid, 0);
    }
  }

  LoadFoldersForUser(userid: string) {
    this.projectService.getFoldersForUser(userid).subscribe(folders => {
      this.folders = folders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // 🔹 Tri décroissant (récent → ancien)
      console.log(this.folders);
    });
  }

  LoadProjectsForOwner(userid: string, slice: number) {
    this.projectService.getProjectsForOwner(userid).subscribe(projects => {
      // 🔹 Trier du plus récent au plus ancien
      const sortedProjects = projects.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      // 🔹 Appliquer .slice() uniquement si slice > 0
      const limitedProjects = slice > 0 ? sortedProjects.slice(0, slice) : sortedProjects;
  
      // 🔹 Capitaliser certains champs
      this.projects = limitedProjects.map(project => {
        if (project.status) {
          project.status = project.status.charAt(0).toUpperCase() + project.status.slice(1);
        }
        if (project.title) {
          project.title = project.title.charAt(0).toUpperCase() + project.title.slice(1);
        }
        return project;
      });
    });
  }  

  LoadProjectsForTeam(userid: string, slice: number) {
    this.projectService.getProjectsForTeam(userid).subscribe(t_projects => {
      // 🔹 Trier du plus récent au plus ancien
      const sortedT_Projects = t_projects.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      // Appliquer .slice() uniquement si slice > 0
      const limitedT_Projects = slice > 0 ? t_projects.slice(0, slice) : sortedT_Projects;
  
      this.t_projects = limitedT_Projects.map(t_project => {
        if (t_project.status && t_project.status.length > 0) {
          t_project.status = t_project.status.charAt(0).toUpperCase() + t_project.status.slice(1);
        }
        if (t_project.title && t_project.title.length > 0) {
          t_project.title = t_project.title.charAt(0).toUpperCase() + t_project.title.slice(1);
        }
        return t_project;
      });
    });
  }

  goHome(){
    this.router.navigate(['/home']);
  }

}
