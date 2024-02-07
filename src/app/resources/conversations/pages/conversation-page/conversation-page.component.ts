import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { ConversationListComponent } from '../../components/conversation-list/conversation-list.component';
import { ConversationHubService } from '../../services/conversation-hub.service';

@Component({
  selector: 'app-conversation-page',
  standalone: true,
  imports: [ConversationListComponent, RouterOutlet],
  templateUrl: './conversation-page.component.html',
  styleUrl: './conversation-page.component.scss',
  providers: [ConversationHubService]
})
export default class ConversationPageComponent {
  private _userService = inject(UserService);
  private _conversationHubService = inject(ConversationHubService);

  protected currentUser = this._userService.getUserInfoSignal();

  constructor(){
    this._conversationHubService.startHubConnection();
    this._conversationHubService.startListeningMessages();
  }

  logoutClick(){
    this._userService.logout();
  }

}
