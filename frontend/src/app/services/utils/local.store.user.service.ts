import { Injectable } from '@angular/core';
import { IUser } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class LocalStoreUserService {
  constructor() {}

  set(value: IUser): void {
    localStorage.setItem('auth_user', JSON.stringify(value));
  }
  get(): IUser {
    return JSON.parse(localStorage.getItem('auth_user')!);
  }
  remove(): void {
    localStorage.removeItem('auth_user');
  }
}
