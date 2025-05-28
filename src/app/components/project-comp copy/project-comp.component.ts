import { Component, Input, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project.model';

import { CommonModule } from '@angular/common';

import {
   IonContent, IonHeader, IonToolbar, IonCard, IonButtons, IonThumbnail, IonAvatar,IonBackButton, IonList, 
  IonItem, IonLabel, IonChip, IonText, IonRow, IonCol, IonSegment, IonSegmentButton, IonButton, IonIcon,
  IonListHeader,IonCardContent,IonCardTitle,IonCardHeader,IonSelect,IonSelectOption
 } from '@ionic/angular/standalone';


import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-comp',
  templateUrl: './project-comp.component.html',
  styleUrls: ['./project-comp.component.scss'],
  imports: [
    IonContent, IonHeader, IonToolbar, IonCard, IonButtons, IonThumbnail,IonAvatar, IonBackButton,
    IonList, IonItem, IonLabel, IonChip, IonText, IonRow, IonCol, IonSegment,
    IonSegmentButton, IonButton, IonIcon, CommonModule,RouterModule,IonListHeader,IonCardContent,IonCardTitle,IonCardHeader,IonSelect,IonSelectOption
  ]
})
export class ProjectCompComponent  implements OnInit {

  @Input() project: Project | null = null;

  constructor() { }

  segment_value = 'description';

  changeSegment(event: any) {
    this.segment_value = event.detail.value;
  }

  toggleStepStatus(step: any) {
    step.status = step.status === 'Terminé' ? 'pending' : 'Terminé';
  }

  updateStepStatusInLocalStorage(projectId: string | undefined, stepId: string | undefined, newStatus: '' | 'En cours' | 'Terminé') {
    if (!projectId || !stepId) return; // sécurité
  
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
  
    const updatedProjects = storedProjects.map((project: any) => {
      if (project.p_id === projectId) {
        project.steps = project.steps.map((step: any) => {
          if (step.s_id === stepId) {
            return { ...step, status: newStatus };
          }
          return step;
        });
        project.updatedAt = new Date();
      }
      return project;
    });
  
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  
    // const updatedProject = updatedProjects.find((p: any) => p.p_id === projectId);
    // if (updatedProject) {
    //   this.project = updatedProject;
    // }
  } 
  
  deleteProjectById(p_id: string) {
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
  
    const updatedProjects = storedProjects.filter((project: any) => project.p_id !== p_id);
  
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  
    alert('Projet supprimé avec succès !');
  
    // Optionnel : recharger ou rediriger
    // this.router.navigate(['/projects']); ou window.location.reload();
  }  
  


  ngOnInit() {}

}
