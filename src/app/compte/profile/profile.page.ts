import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router} from '@angular/router';

import { IonContent, IonLabel, IonItem, IonIcon, IonModal, IonToast, IonButton, IonInput, IonList
 } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, callOutline, peopleOutline, chevronForwardOutline, personOutline, createOutline ,logOut} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [ IonContent, IonLabel, IonItem, IonIcon, IonModal, IonToast, IonButton, IonInput, IonList, CommonModule, FormsModule]
  
})
export class ProfilePage implements OnInit {

  @ViewChild('editModal') editModal!: IonModal;
  isToastOpen = false;

  userid = localStorage.getItem('userid');
  name: string = '';
  totalProjets: number = 0;
  totalProjetsEnCours: number = 0;
  totalProjetsFini: number = 0;
  email: string = '';
  p_email: string = '';
  poste: string = '';
  numero!: number;
  userData: any;

  update: any;

  constructor(
    private authService:  AuthService,
    private userService: UserService,
    private sessionService:  SessionService,
    private projectService: ProjectService,
    private updateService: ProjectService,
     private router: Router
  )
  {
    addIcons({createOutline,mailOutline,callOutline,peopleOutline,chevronForwardOutline,personOutline,logOut}); 
  }

  ngOnInit() {
    // this.checkSession();
    this.getUpdate();
    if (this.userid) {
      this.loadUser(this.userid)
      this.countProjects(this.userid);
      this.countProjectsProgress(this.userid);
      this.countProjectsDone(this.userid);
    }
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     if (this.userid) {
  //       this.countProjects(this.userid);
  //       this.countProjectsProgress(this.userid);
  //       this.countProjectsDone(this.userid);
  //       this.loadUser(this.userid)
  //     }
  //     // this.checkSession()
  //     // this.setUserToUserData();
  //   }, 1300);
  // }

  // Méthode pour vérifier la session de l'utilisateur
  async checkSession() {
    const userData = await this.sessionService.getUserFromFirestore(); // Attend la réponse de checkSessionService()
    if (userData) {
      console.log('Données utilisateur récupérées:', userData);
      // Vous pouvez maintenant utiliser userData dans le profil
      this.userData = userData;
      this.name = this.userData.name || '';  // Si userData.name est undefined ou null, on assigne une chaîne vide
      this.numero = this.userData.numero || 0; // Si userData.numero est undefined ou null, on assigne 0
      this.email = this.userData.email;
      this.p_email = this.userData.p_email;
      this.poste = this.userData.poste;
      this.userid = this.userData.userid;
    } else {
      this.router.navigate(['/compte']);
    }
  }

  // Dans ton component.ts
  loadUser(userid: string) {
    this.userService.getUserById(userid).subscribe({
      next: (user) => {
        if (user) {
          this.userData = user; // Assure-toi d'avoir déclaré `userData` dans ton composant

          this.name = this.userData.name || '';  // Si userData.name est undefined ou null, on assigne une chaîne vide
          this.numero = this.userData.numero || 0; // Si userData.numero est undefined ou null, on assigne 0
          this.email = this.userData.email;
          this.p_email = this.userData.p_email;
          this.poste = this.userData.poste;
          this.userid = this.userData.userid;


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

  async updateUser(userid: string) {
    try {
      await this.authService.updateUserService(this.name, this.p_email, this.numero, userid);
      console.log('✅ Mise à jour réussie');
      this.isToastOpen = true;
      // Tu peux aussi afficher une alerte/toast ici
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur :', error);
      // Afficher une alerte/toast d'erreur ici
    }
  }
  
  getUpdate() {
    this.updateService.getUpdateApp().subscribe(data => {
      this.update = data;
    });
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  countProjects(userid: string) {
    this.projectService.countProjects(userid).subscribe(count => {
      console.log('Nombre de projets pour ce user :', count);
      this.totalProjets = count;
    });
  } 

  countProjectsProgress(userid: string) {
    this.projectService.countProgressProjects(userid).subscribe(count => {
      console.log('Nombre de projets en cours pour ce user :', count);
      this.totalProjetsEnCours = count;
    });
  }

  countProjectsDone(userid: string) {
    this.projectService.countProjectsDone(userid).subscribe(count => {
      console.log('Nombre de projets Terminé pour ce user :', count);
      this.totalProjetsFini = count;
    });
  }  

  openUpdateLink() {
    if (this.update?.lien) {
      window.open(this.update.lien, '_blank');
    }
  }
  

  signout() {
    this.authService.signoutService();
  }

  login() {
    this.router.navigate(['/client/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  expandModal() {
    this.editModal?.setCurrentBreakpoint(0.8);
  }

}
