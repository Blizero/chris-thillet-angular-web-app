import {Component, CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom, Injectable} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from "@angular/material/sidenav";

import {
  LayoutContainerComponent
} from "./components/layout-container/layout-container.component";
import {NgOptimizedImage, NgStyle} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem, MatNavList} from "@angular/material/list";
import {ReactiveFormsModule} from '@angular/forms';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgOptimizedImage, RouterOutlet, MatSidenavContent, MatSidenavContainer, MatSidenav, LayoutContainerComponent, MatDrawerContainer, MatDrawer, NgStyle, MatDrawerContent, MatIcon, MatLine, MatListItem, RouterLink, RouterLinkActive, MatCheckbox, MatLabel, ReactiveFormsModule, MatInput, MatButton, MatList, MatNavList, MatToolbar, MatIconButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  public isExpanded = false;

  constructor() {
  }

  public toggleMenu() {
    this.isExpanded = !this.isExpanded;
  }


}
