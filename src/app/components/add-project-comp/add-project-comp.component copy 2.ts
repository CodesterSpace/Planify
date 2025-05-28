

  import { Component, OnInit, ViewChild } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import {
    IonItem, IonLabel, IonInput, IonTextarea, IonDatetime, IonSelect, IonSelectOption,
    IonButton, IonList,IonCard,IonCardHeader,IonCardTitle,IonCardContent,
  } from '@ionic/angular/standalone';

  import {
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
  } from '@ionic/angular/standalone';
  import { OverlayEventDetail } from '@ionic/core/components';


  import { ProjectService } from '../../services/project.service';
  import { Project } from '../../models/project.model';
import { Router } from '@angular/router';

  
  @Component({
    imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      IonItem, IonLabel, IonInput, IonTextarea, IonDatetime,
      IonSelect, IonSelectOption, IonButton, IonList,IonCard,IonCardHeader,IonCardTitle,IonCardContent,
      IonButtons,
      IonContent,
      IonHeader,
      IonModal,
      IonTitle,
      IonToolbar,
    ],
    selector: 'app-add-project-comp',
    templateUrl: './add-project-comp.component.html',
    styleUrls: ['./add-project-comp.component.scss'],
    standalone: true,
    })
    
export class AddProjectCompComponent implements OnInit {

  @ViewChild(IonModal) modal!: IonModal;

  userid: string = '';

  projectForm: FormGroup;
  steps: { s_id: string; title: string; description: string; status: '' | 'En cours' | 'Terminé'; dueDate?: Date; assigneeId?: string; }[] = [
    { s_id: this.generateId(), title: '', description: '', status: '' }
  ];

  team: { t_m_id: string; }[] = [
    // { t_m_id: this.userid}
  ];
  
  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private projectService: ProjectService
  ) {
    // Formulaire réactif pour le projet
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      priority: ['moyen'],
      startDate: [null],
      endDate: [null],
      budget: [0],
      clientId: [''],
      location: [''],
      mainImage: ['assets/img/default-project.jpg'],
    });
  }
  
  ngOnInit() {
    const userid = localStorage.getItem('userid');
    if(userid){
      this.userid = userid;
      console.log(this.userid)
    }
  }

  confirm() {
    this.modal.dismiss('confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
    }
  }

  addProject() {
    if (this.projectForm.valid) {
      const values = this.projectForm.value;
      const now = new Date().toISOString().slice(0, 19);
      const newProject: Project = {
        ...values,
        p_id: this.generateId(),
        createdAt: now,
        updatedAt: now,
        slug: this.slugify(values.title),
        status: 'planifié',
        steps: this.steps,
        team: this.team,
        ownerId: this.userid,
        tags: [],
        memberIds: this.userid,
        progress: 0,
        documents: [],
      };
    
      this.projectService.addProject(newProject) // Doit retourner une Promise
        .then((docRef: any) => {
          alert('Projet enregistré dans Firebase avec succès !');
          this.router.navigate(['/project/', newProject.p_id]);
        })
        .catch((error: any) => {
          console.error('Erreur lors de l\'ajout du projet :', error);
          alert('Erreur lors de l\'enregistrement.');
        });
    }
  }

  addStep() {
    this.steps.push({
      s_id: this.generateId(),
      title: '',
      description: '',
      status: '',
      dueDate: undefined,
      assigneeId: ''
    });
  }

  addTeamMember() {
    this.team.push({
      t_m_id: this.generateId(),
    });
  }

  removeStep(index: number) {
    this.steps.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private generateId(): string {
    return '_' + Math.random().toString(36).substring(2, 9);
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }

  // saveProject() {
  //   const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
  //   const p_id = this.generateId()
  //   savedProjects.push({
  //     ...this.projectForm.value,
  //     steps: this.steps,  // Associer les étapes
  //     team: this.team,  // Associer les equipes
  //     p_id: p_id,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     slug: this.slugify(this.projectForm.value.title)
  //   });
  //   localStorage.setItem('projects', JSON.stringify(savedProjects));
  //   alert('Projet enregistré avec succès !');
  //   this.router.navigate(['/project/', p_id]);
  // }

  saveProject() {
    const values = this.projectForm.value;
    const now = new Date().toISOString().slice(0, 19);
    const newProject: Project = {
      ...values,
      p_id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      slug: this.slugify(values.title),
      status: 'planifié',
      steps: this.steps,
      team: this.team,
      ownerId: this.userid,
      tags: [],
      progress: 0,
      documents: [],
    };
  
    this.projectService.addProject(newProject) // Doit retourner une Promise
      .then((docRef: any) => {
        alert('Projet enregistré dans Firebase avec succès !');
        this.router.navigate(['/project/', newProject.p_id]);
      })
      .catch((error: any) => {
        console.error('Erreur lors de l\'ajout du projet :', error);
        alert('Erreur lors de l\'enregistrement.');
      });
  }  
  
}

