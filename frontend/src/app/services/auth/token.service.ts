import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  //get token
  platformId = inject(PLATFORM_ID);
  token = new BehaviorSubject<boolean>(true);
  isToken = this.token.asObservable();
  constructor() {}

  set() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', 'true');
      this.token.next(true);
    }
  }
  //   get(){

  //     let ls = localStorage.getItem("token")
  //     if(ls!==null){
  //       this.token.next(true)
  //       return ls
  //     }else{
  //       return null
  //     }

  // }

  remove() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }
}
