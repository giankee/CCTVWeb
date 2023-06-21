import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { cWhatsapp} from './varios';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  serverUrl = environment.baseWhatsappP;
  formData: cWhatsapp;
  constructor(private http: HttpClient) {
   }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  
  sendMessageWhat(formData:cWhatsapp){
    return this.http.post<any>(this.serverUrl+"chat/sendmessage/"+formData.phone,formData,this.httpOptions)
  }

  sendMessageGroup(formData:cWhatsapp){
    return this.http.post<any>(this.serverUrl+"group/sendmessage/"+formData.chatname,formData,this.httpOptions)
  }
  sendMessageMedia(formData:cWhatsapp){
    return this.http.post<any>(this.serverUrl+"chat/sendmedia/"+formData.phone,formData,this.httpOptions)
  }

  sendMessageMGroup(formData:cWhatsapp){
    return this.http.post<any>(this.serverUrl+"group/sendmedia/"+formData.chatname,formData,this.httpOptions)
  }
}
