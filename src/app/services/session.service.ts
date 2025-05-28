import { inject, Injectable } from '@angular/core';
import { Auth, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, getDocs, getDoc, query, where, writeBatch  } from '@angular/fire/firestore';
import { UserModel } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  userData: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private auth: Auth,  // Injecter Auth service
    private firestore: Firestore  // Injecter Firestore service
  ) {}

  

  // Méthode pour vérifier la session de l'utilisateur
  async checkSessionService() {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        this.userData = JSON.parse(storedUserData);
        console.log(this.userData);
        return this.userData;  // Retourne les données de l'utilisateur
      } else {
        this.userData = '';
        console.log('Aucune donnée utilisateur trouvée dans localStorage.');
        return null; // Retourne null si aucune donnée n'est trouvée
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      return null; // En cas d'erreur, retourne null
    }
  }

  async getUserFromFirestore(): Promise<any> {
    try {
      const storedUserid = localStorage.getItem('userid');
      if (storedUserid) {
        const userUid = localStorage.getItem('userid');
        console.log(userUid);
        // Créer une référence à la collection des utilisateurs
        const usersCollection = collection(this.firestore, 'users');

        // Créer une requête pour obtenir les documents où userid = userUid
        const q = query(usersCollection, where('userid', '==', userUid));

        // Récupérer les documents correspondant à la requête
        const querySnapshot = await getDocs(q);
        let noUserData = null;

        if (!querySnapshot.empty) {
          // Si la requête renvoie des documents, retourner le premier utilisateur trouvé
          const userData = querySnapshot.docs[0].data();
          console.log(userData)
          noUserData = null
          return userData;
        } else {
          console.log('Aucun utilisateur trouvé avec cet UID.');
          noUserData = true
          return noUserData;
        }
      } else {
        console.log('Aucun utilisateur authentifié.');
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur dans Firestore:", error);
      return null;
    }
  }

  // ✅ Méthode pour se déconnecter
  async signoutService(): Promise<void> {
    try {
      await signOut(this.auth);
      // Supprimer les données dans localStorage
      localStorage.removeItem('userid');
      this.router.navigate(['/tabs/accueil']).then(() => {
        // Forcer le rechargement de la page après la navigation
        setTimeout(() => {
            window.location.reload();
        }, 100); // Délai pour s'assurer que la navigation est terminée
      });
      console.log('User signed out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  

}
