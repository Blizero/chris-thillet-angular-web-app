import { Routes } from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PathNotFoundComponent} from "./components/path-not-found/path-not-found.component";

export const routes: Routes = [
  {path: '/', redirectTo: '/dashboard'},
  {path: '', redirectTo: '/dashboard'},
  {path: 'dashboard', component: DashboardComponent},
  { path: '**', redirectTo: '404', pathMatch: 'full' },
  { path: '404', component: PathNotFoundComponent },
  // {path: 'events', component: DashboardComponent},
  // {path: 'notifications', component: DashboardComponent},
];
