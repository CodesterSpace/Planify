import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';import { CommonModule } from '@angular/common';
import { ProjectCompComponent } from '../components/project-comp/project-comp.component';

import { of, forkJoin, from } from 'rxjs';
import { UserService } from '../services/user.service';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';


import { Project } from 'src/app/models/project.model';
import { AlertController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonText, IonRow, IonCol, IonButtons,
  IonButton, IonIcon, IonAvatar, IonList, IonItem, IonCheckbox, IonLabel,
  IonProgressBar, IonCard, IonCardContent, IonSelect, IonSelectOption,
  IonInput, IonModal, IonImg
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline, chevronDownOutline, createOutline, trashOutline, folder } from 'ionicons/icons';
import { Folder } from 'src/app/models/folder.model';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonText, IonRow, IonCol, IonButtons,
    IonButton, IonIcon, IonAvatar, IonList, IonItem, IonCheckbox, IonLabel,
    IonProgressBar, IonCard, IonCardContent, IonSelect, IonSelectOption,
    IonInput, IonModal, IonImg]
})
export class ProjectPage implements OnInit {

  project: Project | null = null;
  teamWithUsers: any[] = [];
  folders: any[] = [];
  mesDossiers: any[] = [];
  ownedfolders: any[] = [];
  ownerUser: any = null;
  myuserid: any = null;

  t_m_id: string = '';
  p_id: string = '';
  role: string = '';
  expandedIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private alertController: AlertController,
    private userService: UserService
  ) {
    addIcons({createOutline,trashOutline,folder,addOutline,calendarOutline,chevronDownOutline});
  }

  ngOnInit() {
    const p_id = this.route.snapshot.paramMap.get('id');
    if (p_id) {
      this.loadProjetById(p_id);
      this.LoadFoldersByPid(p_id);
    }
    const userid = localStorage.getItem('userid');
    this.myuserid = userid;
    if (userid) {
      this.LoadFolders(userid);
    }
  }
  
  // project.page.ts
  loadProjetById(p_id: string) {
    this.projectService.getProjectById(p_id).subscribe(
      (project) => {
        if (project) {
          this.project = project;
  
          const ownerId = project.ownerId;
          const ownerObservable = ownerId ? this.userService.getUserById(ownerId) : of(null);
  
          const ids = project.team?.map(m => m.t_m_id).filter((id): id is string => !!id) || [];
          const teamObservables = ids.length > 0
            ? forkJoin(ids.map(id => this.userService.getUserById(id)))
            : of([]); // <- important !
  
          forkJoin([teamObservables, ownerObservable]).subscribe(([users, owner]) => {
            this.ownerUser = owner;
  
            this.teamWithUsers = (users as any[]).map((user, index) => ({
              ...project.team?.[index],
              ...user,
            }));
          });
        } else {
          console.log('Projet non trouvé');
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération du projet :', error);
      }
    );
  }

  LoadFoldersByPid(p_id: string) {
    this.projectService.getFoldersByPid(p_id).subscribe(folders => {
      this.mesDossiers = folders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log('mesDossiers', this.mesDossiers);

      // Appelle la fusion une fois que les deux listes sont chargées
      this.mergeFolderStates();
    });
  }


  LoadFolders(userid: string) {
    this.projectService.getFoldersForUser(userid).subscribe(folders => {
      this.folders = folders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log('folders', this.folders);

      // Appelle la fusion une fois que les deux listes sont chargées
      this.mergeFolderStates();
    });
  }

    mergeFolderStates() {
    if (!this.folders || !this.mesDossiers) return;

    const mesIds = this.mesDossiers.map(f => f.f_id);

    this.folders = this.folders.map(folder => {
      return {
        ...folder,
        existe: mesIds.includes(folder.f_id) ? 'oui' : 'non'
      };
    });
  }



  reload(){
    this.ngOnInit();
  }

  toggleDetail(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  get formattedPriority(): string {
    const p = this.project?.priority || '';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  async updateProjectStatus(p_id: string | undefined, newStatus: string | undefined) {
    if (!this.project) return;
  
    try {
      await this.projectService.updateProjectStatus(p_id, newStatus);
      this.project.status = newStatus; // Met à jour localement le statut
      this.reload(); // Recharge les données si nécessaire
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du projet :', error);
    }
  }  

  async updateStepStatus(p_id: string | undefined, stepId: string | undefined, newStatus: '' | 'En cours' | 'Terminé') {
    if (!this.project) return;
  
    const updatedSteps = this.project.steps.map(step =>
      step.s_id === stepId ? { ...step, status: newStatus } : step
    );
  
    await this.projectService.updateStepStatus(p_id, stepId, newStatus);  // Passer uniquement newStatus ici.
  
    this.project.steps = updatedSteps;
    this.reload();
  }  

  async addTeamMate(p_id: string | undefined , team: Project['team']| undefined, t_m_id: string, role: string) {
    if (!this.project || !t_m_id) return;

    const updatedTeam = await this.projectService.addTeamMate(p_id, this.project.team, t_m_id, role);

    if (updatedTeam) {
      this.project.team = updatedTeam;
      this.reload();
      this.t_m_id = '';
    } else {
      alert('Ce membre est déjà dans l’équipe.');
    }
  }

  async delTeamMate(p_id: string | undefined, team: Project['team']| undefined, t_m_id: string| undefined) {
    if (!this.project || !t_m_id) return;

    const updatedTeam = await this.projectService.delTeamMate(p_id, this.project.team, t_m_id);

    if (updatedTeam) {
      this.project.team = updatedTeam;
      this.reload();
    }
  }

  async deleteProjectById(p_id: string) {
    const alert = await this.alertController.create({
      message: 'Êtes-vous sûr de vouloir supprimer ?',
      buttons: [
        {
          text: 'Oui',
          role: 'continue',
          handler: async () => {
            await this.projectService.deleteProjectByPId(p_id);
            this.router.navigate(['/home']);
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }
  
  /** 🔹 START SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */  /** 🔹 SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */
  /** 🔹 SECTION Add To FOLDERS */
  async addToFolder(f_id: string | undefined, p_id: string) {
    console.log('Clicked')
    if (!f_id || !p_id) return;
    // Appel à addToFolder pour ajouter le projet au dossier
    const updatedFolder = await this.projectService.addToFolder(f_id, p_id);
    if (updatedFolder) {
       this.p_id = '';
     } else {
      alert('Ce membre est déjà dans l’équipe.');
    }
  }

  /** 🔹 SECTION Remove From FOLDERS */
  async RemoveFromFolder(f_id: string | undefined, p_id: string) {
    console.log('Clicked')
    if (!f_id || !p_id) return;
    // Appel à addToFolder pour ajouter le projet au dossier
    const updatedFolder = await this.projectService.removeFromFolder(f_id, p_id);
    if (updatedFolder) {
       this.p_id = '';
     } else {
      alert('Ce project n’est pas dans le dossier.');
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
  
}
