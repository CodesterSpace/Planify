import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonContent, IonCardContent,
  IonGrid, IonRow, IonCol, IonButton, IonIcon, 
  IonLabel, IonHeader, IonToolbar, IonTitle, IonItem, IonList, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, folderOutline, briefcaseOutline, fastFoodOutline, bookOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    IonCard, IonContent, IonButton, IonIcon,
    IonLabel, IonItem, IonList, IonAvatar, CommonModule
  ]
})
export class TasksPage implements OnInit {


  constructor(
    private router: Router,
  ) { 
    addIcons({
      arrowBack, 
      folderOutline, 
      briefcaseOutline, 
      fastFoodOutline, 
      bookOutline
    });
  }

  ngOnInit() {
  }

  goHome(){
    this.router.navigate(['/home']);
  }

}
