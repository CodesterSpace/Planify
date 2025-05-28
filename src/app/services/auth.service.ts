import { Injectable, inject, NgZone } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
  updateProfile
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  updateDoc
} from '@angular/fire/firestore';

import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface Users {
  name: string;
  email: string;
  userid: string;
  numero: number;
  membre_date: string;
  last_conn: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private firestore: Firestore = inject(Firestore);

  currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // this.auth.onAuthStateChanged(user => this.currentUser.next(user));
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Vérifie si l'utilisateur existe déjà dans Firestore
      const q = query(collection(this.firestore, 'users'), where('userid', '==', user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Nouvel utilisateur → enregistrer dans Firestore
        const date = new Date();
        const userData: Users = {
          name: user.displayName || '',
          email: user.email || '',
          userid: user.uid,
          numero: 0,  // par défaut si pas de numéro
          membre_date: date.toISOString(),
          last_conn: date.toISOString()
        };
        await setDoc(doc(this.firestore, 'users', user.uid), userData);
      } else {
        await this.setDate(user.email); // mettre à jour la date de dernière connexion
      }

      localStorage.setItem('userid', user.uid);
      return user;
    } catch (error) {
      console.error('Erreur Google login:', error);
      return null;
    }
  }


  // ✅ Inscription avec email/mot de passe
  async registerService(email: string, password: string, name: string, numero: number): Promise<User | null> {
    try {
      const date = new Date();
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: name });

        const userData: Users = {
          name,
          email,
          userid: user.uid,
          numero,
          membre_date: date.toISOString(),
          last_conn: date.toISOString(),
        };

        await setDoc(doc(this.firestore, 'users', user.uid), userData);
        localStorage.setItem('userid', user.uid);
        return user;
      }

      return null;
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Email déjà utilisé.');
        }
      }
      console.error('Erreur inscription:', error);
      throw new Error('Erreur inconnue.');
    }
  }

  async loginService(email: string, password: string): Promise<any | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential) {
        await this.setDate(userCredential.user.email);
        localStorage.setItem('userid', userCredential.user.uid);
        return userCredential.user; // Retourner l'utilisateur connecté
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return null;
    }
  }  

  // ✅ Récupérer infos utilisateur connecté depuis Firestore
  async getUserFromFirestore(): Promise<any> {
    const user = this.auth.currentUser;
    if (!user) return null;

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('userid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      localStorage.setItem('userid', user.uid);
      // Redirection + reload
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => window.location.reload(), 100);
      });

      return userData;
    } else {
      return null;
    }
  }

  // ✅ Mettre à jour la date de dernière connexion
  async setDate(email: string | null) {
    if (!email) return;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      const docRef = doc(this.firestore, 'users', docId);
      await updateDoc(docRef, { last_conn: new Date().toISOString() });
    }
  }

  // ✅ Mettre à jour les infos utilisateur
  async updateUserService(name: string, p_email: string, numero: number, userid: string) {
    const q = query(collection(this.firestore, 'users'), where('userid', '==', userid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      const docRef = doc(this.firestore, 'users', docId);
      await updateDoc(docRef, {
        name,
        p_email,
        numero,
        last_edit: new Date().toISOString()
      });
    }
  }

  // ✅ Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Email de réinitialisation envoyé');
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    }
  }

  // ✅ Récupérer l'utilisateur connecté
  getUser(): User | null {
    return this.auth.currentUser;
  }

  // ✅ Déconnexion
  async signoutService(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('userid');
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => window.location.reload(), 100);
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }
}
