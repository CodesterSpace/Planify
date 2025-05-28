export interface Exercice {
  id: number;
  nom: string;
  duration: number | null; // Durée en minutes
  reps: number | null; // Nombre de répétitions
  serie: number | null; // Nombre de series
  trainingId: number | null; // Référence au training associé
  exerciceImg: string;
  newduration: string;
  }
  