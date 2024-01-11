import { environment } from '@@environment/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { LocalDb } from '../../local-db/local-db';
import { User } from '../types/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private urlApi = `${environment.urlApi}`;

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

}
