import { environment } from '@@environment/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { LocalDbService } from '../../local-db/services/local-db.service';
import { AuthLoginResponse } from '../types/auth-login-response.model';
import { UserImage } from '../types/user-image.model';
import { UserStorageInfo } from '../types/user-storage-info.model';
import { User } from '../types/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _localDbService = inject(LocalDbService);
  private _http = inject(HttpClient);
  private _router = inject(Router);
  private _urlApi = `${environment.urlApi}`;
  private _userInfo = signal<UserStorageInfo | null>(null);

  constructor(){
    effect(() => this.syncUserInfoLocalStorage())
  }

  getUsers(){
    return this._http.get<User[]>(`${this._urlApi}/user`)
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
          this._localDbService.addUsers(userImages
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
    return this._http
      .get(`${this._urlApi}/user/${userId}/image`, { responseType: 'blob' });
  }

  uploadUserImage(userId: string, image: ArrayBuffer){
    const blobImage = new Blob([image]);
    const formData = new FormData();
    formData.append('file', blobImage);

    return this._http
      .put(`${this._urlApi}/user/${userId}/image`, formData);
  }

  login(userId: string){
    return this._http.post<AuthLoginResponse>(`${this._urlApi}/auth`, {
      userId: userId
    });
  }

  setCurrentUser(user: UserStorageInfo){
    this._userInfo.set(user);
  }

  getUserInfoSignal(){
    return this._userInfo.asReadonly();
  }

  syncUserInfoLocalStorage(){
    localStorage.setItem('UserData', JSON.stringify(this._userInfo()));
  }

  isUserLogged(){
    return Boolean(this._userInfo());
  }

  trySyncLocalStorage(){
    const localStorageData = localStorage.getItem('UserData');

    if(!localStorageData)
      return;

    const userData: UserStorageInfo = JSON.parse(localStorageData);

    this._userInfo.set(userData);
  }

  logout(){
    this._userInfo.set(null);
    this._router.navigate(['login']);
  }

  getCurrentUserImageUrl(){
    return this._localDbService.getUserImage(this._userInfo()!.id)
      .pipe(
        map(blob => !!blob ? URL.createObjectURL(blob) : ''));
  }

  getLocalUsers(){
    return this._localDbService.getUsers()
      .pipe(
        map((localUsers) => localUsers.map<UserImage>(localUser => ({
          user: {
            id: localUser.id,
            name: localUser.name
          },
          imageUrl: localUser.imageBlob && URL.createObjectURL(localUser.imageBlob)
        })))
      )
  }

  getLocalUserById(userId: string){
    return this._localDbService.getUserById(userId)
      .pipe(
        map(userInfo => ({
          user: {
            id: userId,
            name: userInfo!.name,
          },
          imageUrl: !!userInfo!.imageBlob ? URL.createObjectURL(userInfo!.imageBlob) : null
        } as UserImage)
        )
      )
  };

}
