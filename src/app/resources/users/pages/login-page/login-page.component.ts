import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  @ViewChild('input', { static: true, read: ElementRef}) 
  private inputFile!: ElementRef;
  
  private userService = inject(UserService);
  private lastUserIdClicked = '';
  
  protected users$ = this.userService.getUsers()
    .pipe(
      catchError(err => {
        return of([]);
      })
    );
  
  refreshUsers(){
    this.users$ = this.userService.getUsers()
      .pipe(
        catchError(err => {
          return of([]);
        })
      );
  }

  onImageButtonClicked(userId: string){
    this.lastUserIdClicked = userId;

    this.inputFile.nativeElement.click();
  }

  onFileSelected(event: any){
    const selectedFiles = event.target.files as FileList;

    if(selectedFiles.length === 0)
      return;

    const file = selectedFiles[0];

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      const fileInBytes = reader.result as ArrayBuffer;
      this.userService.uploadUserImage(this.lastUserIdClicked, fileInBytes)
        .subscribe(() => this.refreshUsers());
    };
  }

}
