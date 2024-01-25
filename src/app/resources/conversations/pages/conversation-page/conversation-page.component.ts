import { Component, inject } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { ConversationListComponent } from '../../components/conversation-list/conversation-list.component';

@Component({
  selector: 'app-conversation-page',
  standalone: true,
  imports: [ConversationListComponent],
  templateUrl: './conversation-page.component.html',
  styleUrl: './conversation-page.component.scss'
})
export default class ConversationPageComponent {
  private userService = inject(UserService);

  protected currentUser = this.userService.getUserInfoSignal();

  logoutClick(){
    this.userService.logout();
  }

}
