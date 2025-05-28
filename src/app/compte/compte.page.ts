import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  IonContent,IonButton,IonIcon,IonModal,
  IonItem,IonLabel,IonInput,IonText,IonCheckbox,IonInputPasswordToggle
 } from '@ionic/angular/standalone';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { addIcons } from 'ionicons';
import {homeOutline, logoFacebook, logoTwitter, logoGoogle, logoApple } from 'ionicons/icons';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.page.html',
  styleUrls: ['./compte.page.scss'],
  standalone: true,
  imports: [IonContent,IonButton,IonIcon,IonModal,IonItem,IonLabel,IonInput,IonText,IonCheckbox,IonInputPasswordToggle, CommonModule, FormsModule,]
})
export class ComptePage implements OnInit {
  @ViewChild('signupModal', { static: false }) signupModal!: IonModal;
  @ViewChild('signinModal', { static: false }) signinModal!: IonModal;

  email = '';
  name = '';
  numero!: number;  // Utiliser number pour le numéro
  s_email = '';
  confpassword = '';
  showPassword: boolean = false;  // Initialement masqué
  errorMessage = '';

  nameError = '';
  emailError = '';
  s_emailError = '';

  passError = '';
  password = '';
  s_password = '';
  s_passError = '';
  confpassError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({homeOutline,logoFacebook,logoTwitter,logoGoogle,logoApple});
  }

  reset(){
    this.errorMessage = '';
    this.nameError = '';
    this.emailError = '';
    this.s_emailError = '';
    this.s_passError = '';
    this.confpassError = '';
  }

  verifyEmail(field: 'email' | 's_email') {
    const emailValue = this[field];
    const errorKey = field === 'email' ? 'emailError' : 's_emailError';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailValue || !emailRegex.test(emailValue)) {
      this[errorKey] = 'Format d\'email invalide';
    } else {
      this[errorKey] = '';
    }
  }
  
  
  verifyPass(field: 'password' | 's_password') {
    const passValue = this[field];
    const errorKey = field === 'password' ? 'passError' : 's_passError';
  
    if (!passValue || passValue.length < 6) {
      this[errorKey] = 'Le mot de passe doit contenir au moins 6 caractères';
    } else {
      this[errorKey] = '';
    }
  }

  verifyName() {
    if (!this.name || this.name.trim().length < 3) {
      this.nameError = 'Le nom doit contenir au moins 3 caractères';
    } else {
      this.nameError = '';
    }
  }
  
  verifySEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.s_email || !emailRegex.test(this.s_email)) {
      this.s_emailError = 'Format d\'email invalide';
    } else {
      this.s_emailError = '';
    }
  }

  verifySPass() {
    if (!this.s_password || this.s_password.length < 6) {
      this.s_passError = 'Le mot de passe doit contenir au moins 6 caractères';
    } else {
      this.s_passError = '';
    }
  }

  verifyConfPass() {
    if (this.s_password !== this.confpassword) {
      this.confpassError = 'Les mots de passe ne correspondent pas';
    } else {
      this.confpassError = '';
    }
  }

  async register(s_email :'email', s_pass :'password') {
    // Exécuter les validations avant l'inscription
    this.verifyName();
    this.verifyEmail(s_email);
    this.verifyPass(s_pass);
    this.verifyConfPass();
  
    // Vérifier s'il y a des erreurs
    if (this.nameError || this.s_emailError || this.s_passError) {
      console.log("Veuillez corriger les erreurs avant de continuer.");
      return;  // Stoppe l'exécution si une erreur est détectée
    }
  
    try {
      const user = await this.authService.registerService(this.s_email, this.s_password, this.name, this.numero);
  
      if (user) {
        console.log('User registered:', user);
        this.signupModal.dismiss();
        this.router.navigate(['compte/profile']);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur d\'inscription:', error.message);
      } else {
        console.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  }

  async login(email :'email', pass :'password', ) {
    //verification de remplissage
    this.verifyEmail(email);
    this.verifyPass(pass);

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir les champs email et mot de passe';
    }

    const user = await this.authService.loginService(this.email, this.password);
    if (user) {
      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });      
    } else {
      this.errorMessage = 'Email ou mot de passe incorrect';
    }
  }

  async loginWithGoogle() {
    const user = await this.authService.signInWithGoogle();
    if (user) {
      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
    } else {
      this.errorMessage = 'Échec de connexion avec Google.';
    }
  }

  openSignUp() {
    this.signupModal.present();
  }

  openSignIn() {
    this.signinModal.present();
  }

  ngOnInit() {
  }

  goHome() {
    this.router.navigate(['/home']);
  }

}
