import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AddProjectCompComponent } from '../components/add-project-comp/add-project-comp.component';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.page.html',
  styleUrls: ['./add-project.page.scss'],
  standalone: true,
  imports: [IonContent,CommonModule, FormsModule, AddProjectCompComponent]
})
export class AddProjectPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
