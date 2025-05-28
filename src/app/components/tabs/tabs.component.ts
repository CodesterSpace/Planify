import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {IonTabBar, IonTabButton, IonIcon, 
  IonLabel, IonFooter,IonFab,IonFabButton 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {home,add,person,addCircleOutline, homeOutline, listOutline, cardOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonTabBar, IonTabButton, IonIcon, IonLabel, IonFooter,IonFab,IonFabButton, 
]
})
export class TabsComponent  implements OnInit {
  userid: string = '';

  constructor(
    private router: Router,
  ) {
    addIcons({home,add,person,homeOutline,listOutline,cardOutline,personOutline,addCircleOutline});
  }

  ngOnInit() {
    const userid = localStorage.getItem('userid');
    if(userid){
      this.userid = userid;
    }
  }

  goToTask() {
    this.router.navigate(['/task-detail']);
  }
  goToProjects() {
    this.router.navigate(['/projects']);
  }

  goToProfile() {
    if(this.userid !=''){
      this.router.navigate(['compte/profile']);
    }else{
      this.router.navigate(['/compte']);
    }
  }
  addProject() {
    this.router.navigate(['/add-project']);
  }

}
