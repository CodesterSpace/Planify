// export interface Training {
//     id: number;
//     name: string;
//     description: string;
//     duration: number;
//     intensity: string;
//     muscleGroups: string[];
//     equipment: string[];
//     trainingImg: string;
// }

export interface Training {
    id: number;
    nom: string;
    description?: string;
    duration: number;
    niveau: string;
    top: string;
    trainingImg: string;
  }
  