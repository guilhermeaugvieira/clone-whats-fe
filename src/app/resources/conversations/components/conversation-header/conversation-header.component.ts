import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { NewConversationModalComponent } from '../new-conversation-modal/new-conversation-modal.component';

@Component({
  selector: 'app-conversation-header',
  standalone: true,
  imports: [AsyncPipe, NewConversationModalComponent],
  templateUrl: './conversation-header.component.html',
  styleUrl: './conversation-header.component.scss'
})
export class ConversationHeaderComponent {

  private userService = inject(UserService);
  protected userInfo = this.userService.getUserInfoSignal();
  protected userImageUrl$ = this.userService.getCurrentUserImageUrl();

  protected showModal = false;

}
