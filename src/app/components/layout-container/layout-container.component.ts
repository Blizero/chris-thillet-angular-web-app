import { Component, Input, Output, EventEmitter } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@Component({
  selector: 'app-layout-container',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltip,
    MatLine,
    MatList,
    RouterLink,
    MatListItem,
    RouterLinkActive
  ],
  templateUrl: './layout-container.component.html',
  styleUrl: './layout-container.component.scss'
})

export class LayoutContainerComponent {
  @Input() isExpanded: boolean = false;
  @Output() toggleMenu = new EventEmitter();


  public routeLinks = [
    { link: "dashboard", name: "Dashboard", icon: "dashboard" },
    { link: "event", name: "Events", icon: "event" },
    { link: "notification", name: "Notifications", icon: "notifications" },
  ];

}
