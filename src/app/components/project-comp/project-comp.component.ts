import { Component, Input, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project.model';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonText, IonRow, IonCol, IonButtons,
  IonButton, IonIcon, IonAvatar, IonList, IonItem, IonCheckbox, IonLabel,
  IonProgressBar, IonCard, IonCardContent, IonSelect, IonSelectOption,
  IonInput, IonModal, IonImg, IonNote
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline, chevronDownOutline, createOutline, trashOutline } from 'ionicons/icons';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectPage } from 'src/app/project/project.page';
import { Folder } from 'src/app/models/folder.model';

@Component({
  selector: 'app-project-comp',
  templateUrl: './project-comp.component.html',
  styleUrls: ['./project-comp.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonText, IonRow, IonCol, IonButtons,
    IonButton, IonIcon, IonAvatar, IonList, IonItem, IonCheckbox, IonLabel,
    IonProgressBar, IonCard, IonCardContent, IonSelect, IonSelectOption,
    IonInput, IonModal, IonImg, IonNote
  ]
})
export class ProjectCompComponent implements OnInit {

  @Input() project: Project | null = null;
  @Input() folder: Folder | null = null;
  @Input() teamWithUsers: any[] = [];
  @Input() folders: Folder[] = [];
  @Input() ownedfolders: Folder[] = [];
  @Input() ownerUser: any;
  @Input() myuserid: any;

  t_m_id: string = '';
  p_id: string = '';
  role: string = '';
  expandedIndex: number | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private projectService: ProjectService,
    private projectPage: ProjectPage,

  ) {
    addIcons({
      chevronDownOutline, addOutline, createOutline, calendarOutline,trashOutline
    });
  }

  ngOnInit() {}

  reload(){
    this.projectPage.ngOnInit();
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
  /** 🔹 SECTION FOLDERS */
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
  
  // async remove(f_id: string | undefined, p_id: string) {
  //   if (!f_id || !p_id) return null;

  //   try {
  //     const foldersRef = collection(this.firestore, 'folders');
  //     const q = query(foldersRef, where('f_id', '==', f_id));

  //     const folderRef = await getDocs(q);
  //     if (folderRef.empty) {
  //       console.log('Folder not found');
  //       return null;
  //     }

  //     const folderDoc = folderRef.docs[0];
  //     const folderData = folderDoc.data() as Folder;
  //     const existingProjects = folderData.projects || [];

  //     // Vérifier si p_id est présent
  //     if (!existingProjects.includes(p_id)) {
  //       console.log('Project id non trouvé dans le dossier');
  //       return existingProjects;
  //     }

  //     // Filtrer pour supprimer le p_id
  //     const updatedProjects = existingProjects.filter(id => id !== p_id);

  //     // Mise à jour du document
  //     await updateDoc(folderDoc.ref, {
  //       projects: updatedProjects,
  //       updatedAt: new Date().toISOString().slice(0, 19),
  //     });

  //     return updatedProjects;
  //   } catch (error) {
  //     console.error('Erreur lors de la suppression du projet du dossier :', error);
  //     return null;
  //   }
  // }


  goHome() {
    this.router.navigate(['/home']);
  }
}
