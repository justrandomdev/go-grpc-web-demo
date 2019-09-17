import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Endpoints } from './endpoints.constants';
import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  { path: Endpoints.EMPTY, component: ShellComponent, /*canActivate: [UserLoggedInGuard],*/ },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
