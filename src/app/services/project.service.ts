import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

import { Folder } from '../models/folder.model';

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
  

  private getUpdatesCollection() {
    return collection(this.firestore, 'update');
  }

  private getProjectsCollection() {
    return collection(this.firestore, 'projects');
  }

  /** 🔹 Récupérer la référence du document d'un projet par p_id */
  private async getProjectDocRefByPId(p_id: string | undefined): Promise<DocumentReference | null> {
    const q = query(this.getProjectsCollection(), where('p_id', '==', p_id));
    const snap = await getDocs(q);
    const docSnap = snap.docs[0];
    return docSnap ? doc(this.getProjectsCollection(), docSnap.id) : null;
  }

  /** 🔹 Récupérer le lien de mis à de l'app*/
  getUpdateApp(): Observable<any> {
    const updatesRef = this.getUpdatesCollection();
    const q = query(updatesRef, where('status', '==', 1)); // optionnel
  
    return collectionData(q, { idField: 'docId' }).pipe(
      map(updates => updates[0]) // Récupère uniquement le premier (unique) document
    );
  }

  /** 🔹 Ajouter un projet dans Firestore */
  addProject(project: Project) {
    const projectsRef = this.getProjectsCollection();
    return addDoc(projectsRef, project); // retourne bien une Promise
  }

  getProjectsForOwner(userid: string): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid));
    return collectionData(q, { idField: 'docId' }) as Observable<Project[]>;
  }

  getProjectsForTeam(userid: string): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(
      projectsRef,
      where('ownerId', '!=', userid),
      where('memberIds', 'array-contains', userid)
    );
    return collectionData(q, { idField: 'docId' }) as Observable<Project[]>;
  }

  getProjectsForOwnerNMember(userid: string): Observable<Project[]> {
    const projectsRef = this.getProjectsCollection();

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

  /** 🔹 Mettre à jour le statut d'une étape dans un projet */
  async updateProjectStatus(p_id: string | undefined, newStatus: string | undefined): Promise<void> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return;
  
    await updateDoc(projectRef, {
      status: newStatus,
      updatedAt: new Date().toISOString().slice(0, 19)
    });
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
  async addTeamMate(p_id: string | undefined, currentTeam: Project['team'], t_m_id: string, role: string): Promise<Project['team'] | null> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return null;
  
    const exists = currentTeam.some(member => member.t_m_id === t_m_id);
    if (exists) return null;
  
    const newMember = { t_m_id, role, name: '', avatarUrl: '' };
    const updatedTeam = [...currentTeam, newMember];
  
    // Récupérer memberIds actuel
    const projectSnap = await getDoc(projectRef);
    const project = projectSnap.data() as Project;
    const memberIds = Array.isArray(project.memberIds) ? [...project.memberIds] : [];
  
    if (!memberIds.includes(t_m_id)) {
      memberIds.push(t_m_id);
    }
  
    await updateDoc(projectRef, {
      team: updatedTeam,
      memberIds,
      updatedAt: new Date().toISOString().slice(0, 19)
    });
  
    return updatedTeam;
  }

  /** 🔹 Supprimer un membre de l'équipe d'un projet */
  async delTeamMate(p_id: string | undefined, currentTeam: Project['team'], t_m_id: string): Promise<Project['team'] | null> {
    const projectRef = await this.getProjectDocRefByPId(p_id);
    if (!projectRef) return null;
  
    const updatedTeam = currentTeam.filter(member => member.t_m_id !== t_m_id);
  
    // Mettre à jour memberIds également
    const projectSnap = await getDoc(projectRef);
    const project = projectSnap.data() as Project;
    const memberIds = Array.isArray(project.memberIds) ? project.memberIds.filter(id => id !== t_m_id) : [];
  
    await updateDoc(projectRef, {
      team: updatedTeam,
      memberIds,
      updatedAt: new Date().toISOString().slice(0, 19)
    });
  
    return updatedTeam;
  }  

  /** 🔹 Supprimer un projet par son ID et le supprimer de la collection de projets */
  async deleteProjectByPId(p_id: string): Promise<void> {
    try {
      // 🔹 Étape 1 : Supprimer le projet lui-même
      const projectRef = await this.getProjectDocRefByPId(p_id);
      if (projectRef) {
        await deleteDoc(projectRef);
        console.log(`Projet ${p_id} supprimé de la base`);
      }

      // 🔹 Étape 2 : Supprimer le p_id de tous les dossiers
      const foldersRef = collection(this.firestore, 'folders');
      const q = query(foldersRef, where('projects', 'array-contains', p_id));
      const folderSnapshots = await getDocs(q);

      for (const docSnap of folderSnapshots.docs) {
        const folderData = docSnap.data() as Folder;
        const updatedProjects = (folderData.projects || []).filter(id => id !== p_id);

        await updateDoc(docSnap.ref, {
          projects: updatedProjects,
          updatedAt: new Date().toISOString().slice(0, 19),
        });

        console.log(`Projet ${p_id} supprimé du dossier ${folderData.f_id}`);
      }

    } catch (error) {
      console.error('Erreur lors de la suppression complète du projet :', error);
    }
  }

  /** 🔹 START SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */  /** 🔹 SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */

  private getFoldersCollection() {
    return collection(this.firestore, 'projects');
  }

  /** 🔹 Récupérer la référence du document d'un projet par p_id */
  private async getFolderDocRefByPId(f_id: string | undefined): Promise<DocumentReference | null> {
    const q = query(this.getFoldersCollection(), where('f_id', '==', f_id));
    const snap = await getDocs(q);
    const docSnap = snap.docs[0];
    return docSnap ? doc(this.getFoldersCollection(), docSnap.id) : null;
  }
  
  getFoldersForUser(userid: string): Observable<Folder[]> {
    const foldersRef = collection(this.firestore, 'folders');
    const q = query(foldersRef, where('userid', '==', userid));
    return collectionData(q, { idField: 'docId' }) as Observable<Folder[]>;
  }

  getFoldersByPid(p_id: string): Observable<Folder[]> {
    const foldersRef = collection(this.firestore, 'folders');
    const q = query(foldersRef, where('projects', 'array-contains', p_id));
    return collectionData(q, { idField: 'docId' }) as Observable<Folder[]>;
  }

  /** 🔹 Ajouter un membre à l'équipe d'un projet */
  async addToFolder(f_id: string | undefined, p_id: string) {
    if (!f_id || !p_id) return null; // Vérification si f_id et p_id sont valides
    console.log('Folder id :', f_id, 'Project id :', p_id);
  
    try {
      const projectsRef = collection(this.firestore, 'folders');
      const q = query(projectsRef, where('f_id', '==', f_id));
  
      // Récupérer les documents correspondant à la query
      const folderRef = await getDocs(q);
      if (folderRef.empty) {
        console.log('Folder not found');
        return null; // Si aucun document n'a été trouvé
      } else {
        // Supposons qu'il y a un seul document, sinon il faut gérer plusieurs résultats
        const folderDoc = folderRef.docs[0];
  
        // Récupérer la liste des projets existants en typant explicitement le retour de .data()
        const folderData = folderDoc.data() as Folder; // Typage explicite
        const existingProjects = folderData.projects || []; // Accès à 'projects'
  
        // Vérifier si p_id existe déjà dans la liste des projets
        if (existingProjects.includes(p_id)) {
          console.log('Project id déjà existant dans le dossier');
          return existingProjects; // Retourner la liste existante sans modification
        }
  
        // Ajouter le p_id à la liste des projets
        const updatedProjects = [...existingProjects, p_id];
  
        // Mise à jour du document
        await updateDoc(folderDoc.ref, {
          projects: updatedProjects,
          updatedAt: new Date().toISOString().slice(0, 19),
        });
  
        return updatedProjects;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au dossier :', error);
      return null;
    }
  }

  async removeFromFolder(f_id: string | undefined, p_id: string) {
    if (!f_id || !p_id) return null;

    try {
      const foldersRef = collection(this.firestore, 'folders');
      const q = query(foldersRef, where('f_id', '==', f_id));

      const folderRef = await getDocs(q);
      if (folderRef.empty) {
        console.log('Folder not found');
      return null;
      }

    const folderDoc = folderRef.docs[0];
      const folderData = folderDoc.data() as Folder;
      const existingProjects = folderData.projects || [];

      // Vérifier si p_id est présent
      if (!existingProjects.includes(p_id)) {
        console.log('Project id non trouvé dans le dossier');
      return existingProjects;
      }

      // Filtrer pour supprimer le p_id
      const updatedProjects = existingProjects.filter(id => id !== p_id);

      // Mise à jour du document
      await updateDoc(folderDoc.ref, {
        projects: updatedProjects,
        updatedAt: new Date().toISOString().slice(0, 19),
    });

    return updatedProjects;
    } catch (error) {
    console.error('Erreur lors de la suppression du projet du dossier :', error);
    return null;
    }
  }
  
  

  // async addToFolder(f_id: string | undefined, folder: Folder['projects'], p_id: string): Promise<string[] | null> {
  //   if (!f_id || !p_id) return null; // Vérification si f_id et p_id sont valides

  //   try {
  //     const projectsRef = collection(this.firestore, 'projects');
  //     const q = query(projectsRef, where('f_id', '==', f_id));

  //     // Récupérer les documents correspondant à la query
  //     const folderRef = await getDocs(q);
  //     if (folderRef.empty) return null; // Si aucun document n'a été trouvé

  //     // Supposons qu'il y a un seul document, sinon il faut gérer plusieurs résultats
  //     const folderDoc = folderRef.docs[0];

  //     // Vérifie si le projet est déjà dans la liste
  //     const exists = folder.includes(p_id);
  //     if (exists) return null;

  //     // Mise à jour de la liste des projets
  //     const updatedProjects = [...folder, p_id];

  //     // Mise à jour du document
  //     await updateDoc(folderDoc.ref, {
  //       projects: updatedProjects,
  //       updatedAt: new Date().toISOString().slice(0, 19),
  //     });

  //     return updatedProjects;
  //   } catch (error) {
  //     console.error('Erreur lors de l\'ajout au dossier :', error);
  //     return null;
  //   }
  // }
  /** 🔹END SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */  /** 🔹 SECTION FOLDERS */   /** 🔹 SECTION FOLDERS */


  /** 🔹 Compter tous les projets de userid */
  countProjects(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }

  /** 🔹 Compter les projets en cours de userid */
  countProgressProjects(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid) && where('status', '==', 'En cours'));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }

  /** 🔹 Compter les projets terminés de userid */
  countProjectsDone(userid: string): Observable<number> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('ownerId', '==', userid) && where('status', '==', 'terminé'));
    return from(getCountFromServer(q).then(snapshot => snapshot.data().count));
  }
}