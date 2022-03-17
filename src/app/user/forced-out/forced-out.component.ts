import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-forced-out',
  templateUrl: './forced-out.component.html',
  styles: []
})
export class ForcedOutComponent implements OnInit {
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
  }

  constructor(private _userService: UserService) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') != null)//Si es que existe un token! carga datos del usuario
      this._userService.logout();
  }

}
