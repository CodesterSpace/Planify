

  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import {
    IonItem, IonLabel, IonInput, IonTextarea, IonDatetime, IonSelect, IonSelectOption,
    IonButton, IonList,IonCard,IonCardHeader,IonCardTitle,IonCardContent,
  } from '@ionic/angular/standalone';

  import { IonContent, IonGrid, IonRow, IonCol, IonIcon, IonHeader } from '@ionic/angular/standalone';



  import { ProjectService } from '../../services/project.service';
  import { Project } from '../../models/project.model';

  
  @Component({
    imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      IonItem, IonLabel, IonInput, IonTextarea, IonDatetime,IonContent, IonGrid, IonRow, IonCol, IonIcon,
      IonSelect, IonSelectOption, IonButton, IonList,IonCard,IonCardHeader,IonCardTitle,IonCardContent,
    ],
    selector: 'app-add-project-comp',
    templateUrl: './add-project-comp.component.html',
    styleUrls: ['./add-project-comp.component.scss'],
    standalone: true,
    })
    
export class AddProjectCompComponent {
  projectForm: FormGroup;
  steps: { id: string; title: string; description: string; status: '' | 'En cours' | 'Terminé'; dueDate?: Date; assigneeId?: string; }[] = [
    { id: this.generateId(), title: '', description: '', status: '' }
  ];

  startDate!: string;
  endDate!: string;

  s_day!: number | null;
  s_month!: number | null;
  s_year!: number | null;

  e_day!: number | null;
  e_month!: number | null;
  e_year!: number | null;

  days: number[] = [];
  months: { value: number; name: string }[] = [];
  years: number[] = [];

  constructor(private fb: FormBuilder, private projectService: ProjectService) {
    // Formulaire réactif pour le projet
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      priority: ['medium'],
      startDate: [null],
      endDate: [null],
      budget: [0],
      clientId: [''],
      location: [''],
      mainImage: ['assets/img/default-project.jpg'],
      ownerId: ['admin123'] // ou récupéré dynamiquement
    });
    this.initDays();
    this.initMonths();
    this.initYears();
  }

  initDays() {
    this.days = Array.from({ length: 31 }, (_, i) => i + 1);
  }
  
  initMonths() {
    this.months = [
      { value: 1, name: 'Janvier' }, { value: 2, name: 'Février' }, { value: 3, name: 'Mars' },
      { value: 4, name: 'Avril' }, { value: 5, name: 'Mai' }, { value: 6, name: 'Juin' },
      { value: 7, name: 'Juillet' }, { value: 8, name: 'Août' }, { value: 9, name: 'Septembre' },
      { value: 10, name: 'Octobre' }, { value: 11, name: 'Novembre' }, { value: 12, name: 'Décembre' }
    ];
  }
  
  initYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 2001 }, (_, i) => currentYear - 1000 + i);
  }  

  updateStartDate() {
    if (this.s_year && this.s_month && this.s_day) {
      const date = new Date(this.s_year, this.s_month - 1, this.s_day);
      this.projectForm.patchValue({ startDate: date.toISOString() });
    }
  }
  
  updateEndDate() {
    if (this.e_year && this.e_month && this.e_day) {
      const date = new Date(this.e_year, this.e_month - 1, this.e_day);
      this.projectForm.patchValue({ endDate: date.toISOString() });
    }
  }  

  addProject() {
    if (this.projectForm.valid) {
      const values = this.projectForm.value;
      const newProject: Project = {
        ...values,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: this.slugify(values.title),
        status: 'planned',
        steps: this.steps,  // Ajout des étapes du projet
        team: [],
        tags: [],
        progress: 0,
        documents: [],
      };

      this.projectService.addProject(newProject);
      this.projectForm.reset();
      this.steps = []; // Réinitialiser les étapes après soumission du projet
      alert('Projet ajouté avec succès !');
    }
  }

  addStep() {
    this.steps.push({
      id: this.generateId(),
      title: '',
      description: '',
      status: '',
      dueDate: undefined,
      assigneeId: ''
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

  saveProject() {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    savedProjects.push({
      ...this.projectForm.value,
      steps: this.steps,  // Associer les étapes
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: this.slugify(this.projectForm.value.title)
    });
    localStorage.setItem('projects', JSON.stringify(savedProjects));
    alert('Projet enregistré avec succès !');
  }
}

