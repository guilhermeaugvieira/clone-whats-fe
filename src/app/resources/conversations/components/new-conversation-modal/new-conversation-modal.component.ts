import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { map, take } from 'rxjs';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/types/user.model';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-new-conversation-modal',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './new-conversation-modal.component.html',
  styleUrl: './new-conversation-modal.component.scss'
})
export class NewConversationModalComponent {

  private _userService = inject(UserService);
  private _conversationService = inject(ConversationService);
  private _currentUser = this._userService.getUserInfoSignal();

  protected availableUsers$ = this._userService.getLocalUsers()
    .pipe(
      map((users) => users.filter(usr => usr.user.id !== this._currentUser()!.id))
    );

  createNewConversation(user: User){
    this._conversationService.createConversation(user.id, user.name)
      .pipe(take(1))
      .subscribe(() => this.showModalChange.emit(false));
  }
  
  @Input({required: true})
  showModal = false;

  @Output()
  showModalChange = new EventEmitter<boolean>();
}
