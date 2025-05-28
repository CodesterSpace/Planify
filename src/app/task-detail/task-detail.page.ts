import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonAvatar,
  IonList,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonProgressBar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonAvatar,
    IonList,
    IonItem,
    IonCheckbox,
    IonLabel,
    IonProgressBar
  ]
})
export class TaskDetailPage implements OnInit {
  expandedIndex: number | null = null;

  team = [
    { avatar: 'assets/img/team1.jpg' },
    { avatar: 'assets/img/team1.jpg' },
    { avatar: 'assets/img/team1.jpg' },
    { avatar: 'assets/img/team1.jpg' }
  ];


  tasks = [
    { title: 'Task 1', checked: true, details: 'details 1' },
    { title: 'Task 2', checked: true, details: 'details 2' },
    { title: 'Task 3', checked: false, details: 'details 3' }
  ];

  toggleDetail(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  constructor() { }

  ngOnInit() {}

}