import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonItem, IonInput, IonIcon, IonCardSubtitle} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { Auth, createUserWithEmailAndPassword, User} from '@angular/fire/auth';
import { inject } from '@angular/core'; // Use Angular inject function to access auth service
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';

import { personOutline,mailOutline,lockClosedOutline,eyeOff, eyeOffOutline } from 'ionicons/icons';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonInput, IonIcon, IonCardSubtitle , CommonModule, FormsModule, RouterLink]
})
export class RegisterPage implements OnInit {

  name = '';
  numero!: number;  // Utiliser number pour le numéro
  email = '';
  password = '';
  confpassword = '';
  showPassword: boolean = false;  // Initialement masqué
  errorMessage = '';
  landingVue!: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService,  // Injecter Session service
  ) {
    addIcons({personOutline,mailOutline,lockClosedOutline,eyeOffOutline,eyeOff});
   }

   async ngOnInit() {
    this.checkSession();
  }

  // Méthode pour vérifier la session de l'utilisateur
  async checkSession() {
    const userData = await this.sessionService.getUserFromFirestore(); // Attend la réponse de checkSessionService()
    
    if (userData) {
      console.log('Données utilisateur récupérées:', userData);
      console.log('Données utilisateur récupérées:', userData);
      this.router.navigate(['/tabs/accueil']);
    }
  }

  async register() {
    if (this.password !== this.confpassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const user = await this.authService.registerService(this.email, this.password, this.name, this.numero); // Attend la réponse de registerService()
    if (user) {
      console.log('User registered:', user);
    } else {
      this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
    }
  }

  passwordToggler(){
    this.showPassword =!this.showPassword
  }

}
