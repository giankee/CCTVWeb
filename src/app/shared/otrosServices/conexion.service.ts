import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {cDataToken } from '../user-info';

@Injectable({
  providedIn: 'root'
})

export class cConexion {
  connectionStatusMessage?: string;
  connectionStatus?: string;
}

export class ConexionService {

  formData: cConexion;
  UserDataToken:cDataToken;
  private _newStatus =new Subject<cConexion>();
  msg$ = this._newStatus.asObservable();

  constructor() { }

  pasarStatus(formData:cConexion){
    this._newStatus.next(formData);
  }
}
