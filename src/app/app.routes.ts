import { Routes } from '@angular/router';
import {LayoutContainerComponent} from "./components/layout-container/layout-container.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";

export const routes: Routes = [
  {path: '**', redirectTo: 'dashboard'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'events', component: DashboardComponent},
  {path: 'notifications', component: DashboardComponent},
];
