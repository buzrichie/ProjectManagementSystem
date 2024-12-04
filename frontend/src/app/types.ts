import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface apiOptions {
  body?: any;
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}

export interface IUser {
  _id?: string;
  username: string;
  password?: string;
  role?: string;

  //   projects?: Project[];
  //   profile?: Profile;
  //   accessToken?: string;
  //   clientSetting?: ClientSetting;
}

export interface IUserAuth {
  accessToken: string;
  user: IUser;
}

export interface IProject {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  admin: IUser;
  projectManager: IUser;
  team: IUser[];
  status: 'active' | 'completed' | 'pending';
  createdAt: Date;
  updatedAt: Date;

  type: string;
  image?: string;
  toolsInvolved: string;
}

export interface ITeam {
  _id?: string;
  name: string;
  projectManager: IUser;
  members: IUser[];
  project: IProject;
}
export interface ITask {
  _id?: string;
  title: string;
  description: string;
  assignedTo: IUser;
  project: IProject;
  status: string;
  priority: string;
  dependencies: ITask;
  dueDate: Date;
}
