import { Routes } from '@angular/router';
import { PagenotfoundComponent } from './shared/pagenotfound/pagenotfound.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { loggedIn } from './functions/auth.guard';
// import { alreadyAuth } from './functions/authentication.guard';

export const routes: Routes = [
  {
    path: 'signup',
    // canActivate: [alreadyAuth],
    loadComponent: () =>
      import('./dashboard/auth/signup/signup.component').then(
        (c) => c.SignupComponent
      ),
    title: 'SignUp',
  },
  {
    path: 'login',
    // canActivate: [alreadyAuth],
    loadComponent: () =>
      import('./dashboard/auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
    title: 'Login',
  },
  {
    path: 'admin',
    canActivate: [loggedIn],
    // canActivate: [isValidLogIn],
    loadComponent: () =>
      import('./dashboard/layout/admin-home/admin-home.component').then(
        (c) => c.AdminHomeComponent
      ),
    title: 'Dashboard',
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'project',
        loadComponent: () =>
          import('./dashboard/projects/project/project.component').then(
            (c) => c.ProjectComponent
          ),
      },
      {
        path: 'project/:id',
        loadComponent: () =>
          import(
            './dashboard/projects/project-details/project-details.component'
          ).then((c) => c.ProjectDetailsComponent),
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./dashboard/users/user/user.component').then(
            (c) => c.UserComponent
          ),
      },
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./dashboard/users/user-details/user-details.component').then(
            (c) => c.UserDetailsComponent
          ),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./chat/team-chat/team-chat.component').then(
            (c) => c.TeamChatComponent
          ),
      },
      // {
      //   path: 'chat/:id',
      //   loadComponent: () =>
      //     import('./chat/team-chat/team-chat.component').then(
      //       (c) => c.ChatDetailsComponent
      //     ),
      // },
      {
        path: 'team',
        loadComponent: () =>
          import('./dashboard/teams/team/team.component').then(
            (c) => c.TeamComponent
          ),
      },
      {
        path: 'team/:id',
        loadComponent: () =>
          import('./dashboard/teams/team-details/team-details.component').then(
            (c) => c.TeamDetailsComponent
          ),
      },
      {
        path: 'task',
        loadComponent: () =>
          import('./dashboard/tasks/task/task.component').then(
            (c) => c.TaskComponent
          ),
      },
      {
        path: 'task/:id',
        loadComponent: () =>
          import('./dashboard/tasks/task-details/task-details.component').then(
            (c) => c.TaskDetailsComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pagenotfound/pagenotfound.component').then(
        (c) => c.PagenotfoundComponent
      ),
    title: '404 not found',
  },
];
