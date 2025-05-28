import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';

import { Auth, User} from '@angular/fire/auth';
import { inject } from '@angular/core'; // Use Angular inject function to access auth service
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';



import { IonContent, IonItem, IonInput, IonIcon,IonButton,IonCardSubtitle,IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { mailOutline,lockClosedOutline, personOutline, logoGoogle, logoFacebook, logoGithub, logoLinkedin, eyeOffOutline, close, eyeOutline, lockOpenOutline, callOutline } from 'ionicons/icons';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonInput, IonIcon,IonButton,IonCardSubtitle,IonText,RouterLink, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  segment_value = 'login';

  name = '';
  numero!: number;  // Utiliser number pour le numéro
  email = '';
  password = '';
  confpassword = '';
  showPassword: boolean = false;  // Initialement masqué
  errorMessage = '';
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private auth: Auth,  // Injecter Auth service
    private sessionService: SessionService,  // Injecter Session service
  ) {
    addIcons({mailOutline,lockClosedOutline,close,logoGoogle,logoFacebook,logoGithub,logoLinkedin,personOutline,callOutline,lockOpenOutline,eyeOffOutline,eyeOutline});
   }

   async ngOnInit() {
    this.checkSession();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkSession();
    }, 1000);
  }

  async checkSession() {
    const userData = await this.sessionService.getUserFromFirestore(); // Attend la réponse de checkSessionService()
    
    if (userData) {
      this.router.navigate(['/tabs/accueil']);
    }
  }


  async login() {
    const user = await this.authService.loginService(this.email, this.password);
    if (user) {
      // this.router.navigate(['/tabs/accueil']);
      // console.log('User Loged In:', user);
    }
    else[this.errorMessage = 'Email ou mot de passe incorrect'];
  }

  async register() {
    if (this.name == '') {
      this.errorMessage = 'Le nom est obligatoire.';
      return;
    }
    if (this.email == '') {
      this.errorMessage = 'Email obligatoire.';
      return;
    }
    if (this.numero == null) {
      this.errorMessage = 'Numero obligatoire.';
      return;
    }
    if (this.password !== this.confpassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
  
    try {
      const user = await this.authService.registerService(this.email, this.password, this.name, this.numero);
  
      if (user) {
        console.log('User registered:', user);
        // Ajoute ici la logique à suivre si l'utilisateur est correctement inscrit
      }
    } catch (error) {
      // Attraper l'erreur et afficher un message d'erreur spécifique
      if (error instanceof Error) {
        this.errorMessage = error.message;  // Afficher le message d'erreur levé
      } else {
        this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      }
    }
  }  

  passwordToggler(){
    this.showPassword =!this.showPassword
  }

  changeSegment(value: string) {
    // console.log(event); // You can uncomment this to debug if needed
    this.segment_value = value;
    this.errorMessage = ''
  }
  
  closeError(){
    this.errorMessage = ''
  }
  

}
