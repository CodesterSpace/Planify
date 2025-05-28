import { Injectable } from '@angular/core';
import { Training } from '../models/training.model';
import { Exercice } from '../models/exercice.model';
import { Observable, of } from 'rxjs';  // Importer 'of' pour créer un Observable
@Injectable({
  providedIn: 'root'
})
export class TrainingsService {
  private trainings!: any[]; // Declare the trainings property
  private defaulttrainings!: any[];
  private exercices!: any[]; // Declare the exercices property

  constructor() {
    const storedTrainings = localStorage.getItem('trainings');
    if (storedTrainings) {
      this.trainings = JSON.parse(storedTrainings);
    }

    const storedExercices = localStorage.getItem('exercices');
    if (storedExercices) {
      this.exercices = JSON.parse(storedExercices);
    }

    this.defaulttrainings = [
      {
        id: 1,
        nom: 'Cardio Training',
        duration: '15 Minutes',
        level: 'Medium',
        top:'yes',
        trainingImg: 'assets/imgs/cardio.png'
      },
      {
        id: 2,
        nom: 'Abs Training',
        duration: '15 Minutes',
        level: 'Medium',
        top:'yes',
        trainingImg: 'assets/imgs/abs.png'
      },
      {
        id: 3,
        nom: 'Chest Training',
        duration: '15 Minutes',
        level: 'Easy',
        top:'yes',
        trainingImg: 'assets/imgs/chest.png'
      },
      {
        id: 4,
        nom: 'Biceps Training',
        duration: '15 Minutes',
        level: 'Easy',
        top:'',
        trainingImg: 'assets/imgs/biceps.png'
      },
      {
        id: 5,
        nom: 'Back Training',
        duration: '15 Minutes',
        level: 'Easy',
        top:'',
        trainingImg: 'assets/imgs/back.png'
      }
    ];
  }

  images = [
    {id: 1, name: '240_F_388216207', src: 'assets/imgs/240_F_388216207_WWVXeq5k4tnMYfCrVG5qf9IfBswmb7Rx.jpg'},
    {id: 2, name: '240_F_795211861', src: 'assets/imgs/240_F_795218161_sTTkI62jvqvQ9dVL9GXcl2MgKaIbnLr6.jpg'},
    {id: 3, name: '240_F_884480428', src: 'assets/imgs/240_F_884484028_H539xoaIpsevCFkqfoKnEJu0gwqKM11N.jpg'},
    {id: 4, name: '240_F_922303579', src: 'assets/imgs/240_F_922303579_gxEhrVwQ5tcNDioLqGwgFA7tFRZFQp9G.jpg'},
    {id: 5, name: '240_F_930051105', src: 'assets/imgs/240_F_930050115_29ZfYICvCksTRhVpSbp5K7HH7rtmOiQR.jpg'},
    {id: 6, name: '240_F_969283108', src: 'assets/imgs/240_F_969283108_nKf6CpSXLzuZfR7ShmyXR2u71UcGJI2Q.jpg'},
    {id: 7, name: '240_F_974772025', src: 'assets/imgs/240_F_974772025_xntXjXOnQqE4SKGVbFbdOPRu7AxdjmB2.jpg'},
    {id: 8, name: 'abs', src: 'assets/imgs/abs.png'},
    {id: 9, name: 'back', src: 'assets/imgs/back.jpeg'},
    {id: 10, name: 'back', src: 'assets/imgs/back.png'},
    {id: 11, name: 'biceps', src: 'assets/imgs/biceps.jpeg'},
    {id: 12, name: 'biceps', src: 'assets/imgs/biceps.png'},
    {id: 13, name: 'bicepsv', src: 'assets/imgs/bicepsv.png'},
    {id: 14, name: 'bodyjpeg', src: 'assets/imgs/bodyjpeg.jpeg'},
    {id: 15, name: 'cardio', src: 'assets/imgs/cardio.jpeg'},
    {id: 16, name: 'cardio', src: 'assets/imgs/cardio.png'},
    {id: 17, name: 'chest', src: 'assets/imgs/chest.png'},
    {id: 18, name: 'leg', src: 'assets/imgs/leg.jpeg'},
    {id: 19, name: 'pullup', src: 'assets/imgs/pullup.jpeg'},
    {id: 20, name: 'upperbody', src: 'assets/imgs/upperbody.png'}
  ];

  // Méthode pour obtenir tous les entraînements
  getAllTrainings(): Observable<Training[]> {
    return of(this.trainings);  // Retourne un Observable contenant le tableau d'entraînements
  }

  // Méthode pour obtenir les entraînements par defaut
  getDefaultTrainings(): Observable<Training[]> {
    return of(this.defaulttrainings);  // Retourne un Observable contenant le tableau d'entraînements par defaut
  }
  
  getTopTrainings(): Training[] {
    // Vérifie si this.trainings est défini et est un tableau avant d'appeler filter
    if (Array.isArray(this.trainings)) {
      return this.trainings.filter(training => training.top === "yes");
    }
    // Si this.trainings n'est pas défini ou n'est pas un tableau, retourne un tableau vide
    return [];
  }  

  
  getTrainingById(id: number): Training | undefined {
    return this.trainings.find(training => training.id === id);
  }
  
  // Méthode pour obtenir tous les exercices
  getAllExercices() {
    return this.exercices;  // Retourne un Observable contenant le tableau d'entraînements
  }

  getExerciceById(Id: number): Exercice | undefined { 
    return this.exercices.find(exercice => exercice.id === Id); 
  }

  getExercicesByTraining(trainingId: number): any[] {
    return this.exercices.filter(exercice => exercice.trainingId === trainingId);
  }

  getImages(): Observable<any[]> {
    return of(this.images);  // Use 'of' to return an observable
  }


  addTraining(training: Training): void {
    this.trainings.push(training);
  }

  updateTraining(updatedTraining: Training): void {
    const index = this.trainings.findIndex(t => t.id === updatedTraining.id);
    if (index !== -1) {
      this.trainings[index] = updatedTraining;
    }
  }

  deleteTraining(id: number): void {
    this.trainings = this.trainings.filter(t => t.id !== id);
  }
}
