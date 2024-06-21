import { Routes } from '@angular/router';
import {GeminiAiComponent} from "./components/gemini-ai/gemini-ai.component";
import {PathNotFoundComponent} from "./components/path-not-found/path-not-found.component";
import {GeminiAiActivityComponent} from "./components/gemini-ai-activity/gemini-ai-activity.component";
import {InfoComponent} from "./components/info/info.component";

export const routes: Routes = [
  {path: '', redirectTo: '/gemini-ai', pathMatch: 'full'},
  {path: 'gemini-ai', component: GeminiAiComponent},
  {path: 'activity', component: GeminiAiActivityComponent},
  {path: 'info', component: InfoComponent},
  { path: '**', redirectTo: '404', pathMatch: 'full' },
  { path: '404', component: PathNotFoundComponent },
];
