import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonCard, IonCardHeader, IonCardContent, IonIcon, IonProgressBar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {home,add,person,addCircleOutline, homeOutline, listOutline, cardOutline, personOutline, ellipsisVerticalOutline, phonePortraitOutline } from 'ionicons/icons';
import { Project } from 'src/app/models/project.model';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  imports: [
    IonCard, IonCardHeader, IonCardContent, IonIcon, IonProgressBar, CommonModule,RouterLink]
})
export class ProjectCardComponent  implements OnInit {

  @Input() project: Project | null = null;
  @Input() isFirst: boolean = false;

  constructor(
  ) {
    addIcons({ellipsisVerticalOutline,phonePortraitOutline,home,add,person,homeOutline,listOutline,cardOutline,personOutline,addCircleOutline});
  }

  abregeTitre(titre: string): string {
    return titre.length > 26 ? titre.slice(0, 26) + '..' : titre;
  }

  ngOnInit() {}

}
