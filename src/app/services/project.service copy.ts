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
import { map, combineLatest, from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  constructor(private firestore: Firestore) {}

  private getProjectsCollection() {
    return collection(this.firestore, 'projects');
  }

  /** 🔹 Ajouter un projet dans Firestore */
  addProject(project: Project) {
    const projectsRef = this.getProjectsCollection();
    return addDoc(projectsRef, project); // retourne bien une Promise
  }

  getProjectsForOwnerNMember(userid: string): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects');

    // 🔹 Projets où l'utilisateur est propriétaire
    const ownerQuery = query(projectsRef, where('ownerId', '==', userid));
    const owner$ = collectionData(ownerQuery, { idField: 'docId' }) as Observable<Project[]>;

    // 🔹 Projets où il est membre (via memberIds à maintenir à jour)
    const memberQuery = query(projectsRef, where('memberIds', 'array-contains', userid));
    const member$ = collectionData(memberQuery, { idField: 'docId' }) as Observable<Project[]>;

    // 🔹 Fusionner les deux flux et supprimer les doublons
    return combineLatest([owner$, member$]).pipe(
      map(([ownerProjects, memberProjects]) => {
        const allProjects = [...ownerProjects, ...memberProjects];
        const unique = allProjects.filter(
          (p, i, self) => self.findIndex(q => q.docId === p.docId) === i
        );
        return unique;
      })
    );
  }


  // getProjects(userid: string): Observable<Project[]> {
  //   const projectsRef = collection(this.firestore, 'projects');
  //   const q = query(projectsRef, where('ownerId', '==', userid));
  //   return collectionData(q, { idField: 'docId' }) as Observable<Project[]>;
  // }

  // /** 🔹 Récupérer tous les projets depuis Firestore */
  // getProjects(p_id: string): Observable<Project[]> {
  //   const projectsRef = this.getProjectsCollection();
  //   return collectionData(projectsRef, { idField: 'docId' }) as Observable<Project[]>; 
  // }

  /** 🔹 Récupérer un projet par son ID */
  getProjectById(p_id: string): Observable<Project | undefined> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('p_id', '==', p_id));
    
    return new Observable((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            observer.next(undefined);
          } else {
            const doc = querySnapshot.docs[0]; 
            const project = doc.data() as Project;
            observer.next(project);
          }
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /** 🔹 Récupérer la référence du document d'un projet par p_id */
  private async getProjectDocRefByPId(p_id: string | undefined): Promise<DocumentReference | null> {
    const q = query(this.getProjectsCollection(), where('p_id', '==', p_id));
    const snap = await getDocs(q);
    const docSnap = snap.docs[0];
    return docSnap ? doc(this.getProjectsCollection(), docSnap.id) : null;
  }

  /** 🔹 Mettre à jour le statut d'une étape dans un projet */
  async updateStepStatus(p_id: string| undefined, stepId: string | undefined, newStatus: '' | 'En cours' | 'Terminé'): Promise<void> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return;

    const projectDoc = await getDoc(projectRef);
    const project = projectDoc.data() as Project;

    if (project) {
      const updatedSteps = project.steps.map(step =>
        step.s_id === stepId ? { ...step, status: newStatus } : step
      );

      await updateDoc(projectRef, {
        steps: updatedSteps,
        updatedAt: new Date().toISOString().slice(0, 19) // Mettez à jour la date de modification
      });
    }
  }

  /** 🔹 Ajouter un membre à l'équipe d'un projet */
  async addTeamMate(p_id: string | undefined, currentTeam: Project['team'], t_m_id: string): Promise<Project['team'] | null> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return null;

    const exists = currentTeam.some(member => member.t_m_id === t_m_id);
    if (exists) return null;

    const newMember = { t_m_id, name: '', role: '', avatarUrl: '' };
    const updatedTeam = [...currentTeam, newMember];

    await updateDoc(projectRef, {
      team: updatedTeam,
      updatedAt: new Date().toISOString().slice(0, 19) // Mettez à jour la date de modification
    });

    return updatedTeam;
  }

  /** 🔹 Supprimer un membre de l'équipe d'un projet */
  async delTeamMate(p_id: string | undefined, currentTeam: Project['team'], t_m_id: string): Promise<Project['team'] | null> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return null;

    const updatedTeam = currentTeam.filter(member => member.t_m_id !== t_m_id);

    await updateDoc(projectRef, {
      team: updatedTeam,
      updatedAt: new Date().toISOString().slice(0, 19) // Mettez à jour la date de modification
    });

    return updatedTeam;
  }

  /** 🔹 Supprimer un projet par son ID */
  async deleteProjectByPId(p_id: string): Promise<void> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (projectRef) {
      await deleteDoc(projectRef);
    }
  }

  /** 🔹 Compter tous les projets de userid */
  countProjects(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }

  /** 🔹 Compter les projets en cours de userid */
  countProgressProjects(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid) && where('status', '==', 'en cours'));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }

  /** 🔹 Compter les projets terminés de userid */
  countProjectsDone(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid) && where('status', '==', 'terminé'));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }
}