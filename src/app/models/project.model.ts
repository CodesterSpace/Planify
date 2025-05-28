export interface Project {
  p_id: string;                       // Identifiant unique du projet
  clientId: string;                // Identifiant du client (si applicable)
  title: string;                   // Titre du projet
  category: string;                // Catégorie ou type de projet (Marketing, Dev, Design, etc.)
  description: string;            // Description générale
  location?: string;              // Lieu (si projet physique)
  status: string | undefined; // Statut du projet

  docId?: string;

  memberIds?: string[];


  slug: string;                   // Slug pour les URLs
  mainImage: string;              // Image principale
  ownerId: string;                // ID du créateur ou manager
  createdAt: Date;                // Date de création
  updatedAt?: Date;               // Dernière modification

  startDate?: Date;               // Date de démarrage prévue
  endDate?: Date;                 // Date de fin prévue

  priority: 'faible' | 'moyen' | 'important'; // Niveau de priorité

  steps: {
    s_id: string;
    title: string;
    description: string;
    status: '' | 'En cours' | 'Terminé';
    dueDate?: Date;
    assigneeId?: string;
  }[];

  team: {
    t_m_id?: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
  }[];

  tags?: string[];                // Étiquettes
  budget?: number;                // Budget prévu
  progress?: number;              // Avancement (0-100%)
  documents?: string[];           // URLs ou références vers fichiers joints
}
