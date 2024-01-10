import { environment } from '@@environment/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from '../types/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private urlApi = `${environment.urlApi}`;

  getUsers(){
    return this.http.get<User[]>(`${this.urlApi}/user`);
  }

}
