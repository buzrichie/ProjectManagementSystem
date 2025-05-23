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
  email?: string;
  staffId?: string;
  password?: string;
  role?:
    | 'student'
    | 'super_admin'
    | 'hod'
    | 'supervisor'
    | 'project_coordinator'
    | 'admin';
  supervisor?: IUser[];
  students?: IUser[];
  task?: ITask['_id'][];
  group?: IGroup['_id'] | IGroup;
  groups?: IGroup[];
  project?: IProject | string;
  projects?: IProject[];
  status?: 'active' | 'inactive';

  //   projects?: Project[];
  // profile?: Profile;
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
  startDate: string;
  endDate: string;
  admin: IUser;
  supervisor?: IUser;
  group: IUser[];
  status: 'proposed' | 'approved' | 'declined' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  department: string;
  objectives: string[];
  technologies: string[];
  projectType: 'existing' | 'new';
  type: string;
  image?: string;
  toolsInvolved: string;
}

export interface IGroup {
  _id?: string;
  name: string;
  documentation?: string;
  supervisor: IUser;
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

export interface ISubtask {
  parentTask: ITask['_id'];
  name: string;
  assignedTo: IUser['_id'];
  status: 'open' | 'in progress' | 'completed';
  priority: string;
}
export interface IChatRoom {
  _id?: string;
  name?: string;
  project?: IProject;
  group?: IGroup;
  participants?: IUser[];
  messages: IMessage[];
  type: string;
  lastMessage: string;
}

export interface IMessage {
  _id?: string;
  sender: IUser;
  recipient: IChatRoom | IUser;
  chatRoom: IChatRoom;
  content: string;
  timestamp: Date;
}

export interface INotification {
  _id: string;
  message: string;
  recipient: string;
  read: boolean;
  createdAt: Date;
}
export interface IChapter extends Document {
  _id: string;
  documentationId: string;
  name:
    | 'Introduction'
    | 'Literature Review'
    | 'Methodology'
    | 'Results and Analysis'
    | 'Conclusion';
  description?: string;
  fileUrl: string;
  status: string;
  feedback?: Feedback[];
  version: number;
  submissionDate: Date;
}

interface Feedback {
  _id: string;
  senderId: IUser;
  message: string;
  createdAt: Date;
}
interface ChapterSummary {
  chapterId: IChapter;
  chapterName: string;
  status: string;
}
export interface IDocumentation {
  _id: string;
  projectId: string;
  groupId: string;
  chapters: (IChapter | IChapter['_id'])[];
  finalDocument?: {
    fileUrl: string;
    status: string;
    submissionDate: Date;
  };
}

export interface IProjectBrief {
  projectId: string;
  groupId: string;
  name: string;
  description: string;
  projectType: 'new' | 'existing';
  department: string;
  objectives: string[];
  technologies: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}
