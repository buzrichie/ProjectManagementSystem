import { Routes } from '@angular/router';
import { PagenotfoundComponent } from './shared/pagenotfound/pagenotfound.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { loggedIn } from './functions/auth.guard';
// import { alreadyAuth } from './functions/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'test',
    // canActivate: [alreadyAuth],
    loadComponent: () =>
      import('./dashboard/test/test.component').then((c) => c.TestComponent),
    title: 'Testing Page',
  },
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
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import(
                './dashboard/projects/project-details/project-details.component'
              ).then((c) => c.ProjectDetailsComponent),
            children: [
              {
                path: 'overview',
                loadComponent: () =>
                  import('./dashboard/overview/overview.component').then(
                    (c) => c.OverviewComponent
                  ),
              },
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
                  import(
                    './dashboard/teams/team-details/team-details.component'
                  ).then((c) => c.TeamDetailsComponent),
              },
              {
                path: 'members',
                loadComponent: () =>
                  import('./dashboard/members/member/member.component').then(
                    (c) => c.MemberComponent
                  ),
              },
              {
                path: 'upload',
                loadComponent: () =>
                  import('./shared/file-explorer/file-explorer.component').then(
                    (c) => c.FileExplorerComponent
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
                  import(
                    './dashboard/tasks/task-details/task-details.component'
                  ).then((c) => c.TaskDetailsComponent),
              },
              {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full',
              },
            ],
          },
        ],
      },
      {
        path: 'project/:id',
        loadComponent: () =>
          import(
            './dashboard/projects/project-details/project-details.component'
          ).then((c) => c.ProjectDetailsComponent),
        children: [
          {
            path: 'overview',
            loadComponent: () =>
              import('./dashboard/overview/overview.component').then(
                (c) => c.OverviewComponent
              ),
          },
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
              import(
                './dashboard/teams/team-details/team-details.component'
              ).then((c) => c.TeamDetailsComponent),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./dashboard/members/member/member.component').then(
                (c) => c.MemberComponent
              ),
          },
          {
            path: 'upload',
            loadComponent: () =>
              import('./shared/file-explorer/file-explorer.component').then(
                (c) => c.FileExplorerComponent
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
              import(
                './dashboard/tasks/task-details/task-details.component'
              ).then((c) => c.TaskDetailsComponent),
          },
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./dashboard/users/user/user.component').then(
            (c) => c.UserComponent
          ),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import(
                './dashboard/users/user-details/user-details.component'
              ).then((c) => c.UserDetailsComponent),
          },
        ],
      },

      {
        path: 'group',
        loadComponent: () =>
          import('./dashboard/groups/group/group.component').then(
            (c) => c.GroupComponent
          ),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import(
                './dashboard/groups/group-detials/group-detials.component'
              ).then((c) => c.GroupDetialsComponent),
            children: [
              {
                path: '',
                redirectTo: 'docs',
                pathMatch: 'full',
              },
              {
                path: 'docs',
                loadComponent: () =>
                  import('./shared/docs/docs.component').then(
                    (c) => c.DocsComponent
                  ),
              },
              {
                path: 'members',
                loadComponent: () =>
                  import('./dashboard/members/member/member.component').then(
                    (c) => c.MemberComponent
                  ),
              },
            ],
          },
        ],
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./chat/chat-layout/chat-layout.component').then(
            (c) => c.ChatLayoutComponent
          ),
      },
      // {
      //   path: 'chat/:id',
      //   loadComponent: () =>
      //     import('./chat/team-chat/team-chat.component').then(
      //       (c) => c.ChatDetailsComponent
      //     ),
      // },
      // {
      //   path: 'team',
      //   loadComponent: () =>
      //     import('./dashboard/teams/team/team.component').then(
      //       (c) => c.TeamComponent
      //     ),
      // },
      // {
      //   path: 'team/:id',
      //   loadComponent: () =>
      //     import('./dashboard/teams/team-details/team-details.component').then(
      //       (c) => c.TeamDetailsComponent
      //     ),
      // },
      {
        path: 'team/:id/members',
        loadComponent: () =>
          import('./dashboard/members/member/member.component').then(
            (c) => c.MemberComponent
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
      {
        path: 'submit_project',
        loadComponent: () =>
          import(
            './dashboard/project-submission/project-submission.component'
          ).then((c) => c.ProjectSubmissionComponent),
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
