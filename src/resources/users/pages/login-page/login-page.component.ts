import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { catchError, of, take } from 'rxjs';
import { User } from '../../types/user.model';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private userService = inject(UserService);
  protected users$ = this.userService.getUsers()
    .pipe(catchError(err => {
      console.log("Deu erro", err);

      return of([]);
    }));

}
