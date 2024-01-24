import { environment } from '@@environment/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { LocalDb } from '../../local-db/local-db';
import { AuthLoginResponse } from '../types/auth-login-response.model';
import { UserStorageInfo } from '../types/user-storage-info.model';
import { User } from '../types/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private urlApi = `${environment.urlApi}`;
  private userInfo = signal<UserStorageInfo | null>(null);

  constructor(){
    effect(() => this.syncUserInfoLocalStorage())
  }

  getUsers(){
    return this.http.get<User[]>(`${this.urlApi}/user`)
      .pipe(
        switchMap(users => {
          
          const userImageRequests = users.map(user => 
            this.getUserImage(user.id)
              .pipe(
                catchError(_ => of(null)),
                map(image => ({
                  user,
                  image
                }))
              ));

          return forkJoin(userImageRequests);
        }),
        tap(userImages => {
          new LocalDb().addUsers(userImages
            .map(userImage => ({
              id: userImage.user.id,
              name: userImage.user.name,
              imageBlob: userImage.image
            })));
        }),
        map(userImages => userImages.map(userImageBlob => ({
          user: userImageBlob.user,
          imageUrl: userImageBlob.image && URL.createObjectURL(userImageBlob.image)
        })))
      )
  }

  private getUserImage(userId: string){
    return this.http
      .get(`${this.urlApi}/user/${userId}/image`, { responseType: 'blob' });
  }

  uploadUserImage(userId: string, image: ArrayBuffer){
    const blobImage = new Blob([image]);
    const formData = new FormData();
    formData.append('file', blobImage);

    return this.http
      .put(`${this.urlApi}/user/${userId}/image`, formData);
  }

  login(userId: string){
    return this.http.post<AuthLoginResponse>(`${this.urlApi}/auth`, {
      userId: userId
    });
  }

  setCurrentUser(user: UserStorageInfo){
    this.userInfo.set(user);
  }

  getUserInfoSignal(){
    return this.userInfo.asReadonly();
  }

  syncUserInfoLocalStorage(){
    localStorage.setItem('UserData', JSON.stringify(this.userInfo()));
  }

  isUserLogged(){
    return Boolean(this.userInfo());
  }

  trySyncLocalStorage(){
    const localStorageData = localStorage.getItem('UserData');

    if(!localStorageData)
      return;

    const userData: UserStorageInfo = JSON.parse(localStorageData);

    this.userInfo.set(userData);
  }

  logout(){
    this.userInfo.set(null);
    this.router.navigate(['login']);
  }

}
