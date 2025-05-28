import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  DocumentReference,
  query,
  where,
  getDoc,
  getCountFromServer
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) {}

  // user.service.ts
  getUserById(userid: string): Observable<any> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('userid', '==', userid));

    return new Observable((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            observer.next({ userid, ...userData });
            console.log('Données:',userData)
          } else {
            observer.next(null);
          }
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
