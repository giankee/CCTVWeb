import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { cDataToken, cLoginU, cRegisterU } from '../shared/user-info';
import { cWhatsapp } from '../shared/otrosServices/varios';
import { WhatsappService } from '../shared/otrosServices/whatsapp.service';
import { ConexionService } from '../shared/otrosServices/conexion.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styles: []
})
export class UserComponent implements OnInit {
  public get whatsappService(): WhatsappService {
    return this._whatsappService;
  }
  public set whatsappService(value: WhatsappService) {
    this._whatsappService = value;
  }
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
  }

  modoActualizar: boolean = false;
  constructor(private _userService: UserService, private router: Router, private toastr: ToastrService, private conexcionService: ConexionService, private _whatsappService: WhatsappService) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') != null)//Si es que existe un token! carga datos del usuario
      this.crearUserData(localStorage.getItem('token'));
    else
      this.resetForm();
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null)
      form.resetForm();
    this._userService.loginForm = new cLoginU();
  }

  onSubmit() {//Pasa los datos del formulario y llama al servicio login 
    if (this.modoActualizar) {//falta eliminar el token y generar uno nuevo
      this._userService.updatePass(this.userService.loginForm).subscribe(//cambia el password anterior y te regresa un codigo temporal para poder iniciar sesion
        (res: any) => {
          if (res.exito==1) {//existe un usuario con ese nombre y contrasenia
            localStorage.setItem('token', res.data);
            this.crearUserData(res.data);
          } else this.toastr.error(res.message, 'Error!');
        })
    } else
      this._userService.login(this._userService.loginForm).subscribe(
        (res: any) => {
          if (res.exito==1) {//existe un usuario con ese nombre y contrasenia
            localStorage.setItem('token', res.data);
            this.crearUserData(res.data);
          }
          else
            this.toastr.error('Nombre de usuario o contraseña incorrecto.', 'Inicio de sessión fallido.');
        },
        err => {
          console.log(err);
        }
      );
  }

  crearUserData(tokeIn:string){
    this.conexcionService.UserDataToken=new cDataToken(tokeIn);
    if(this.conexcionService.UserDataToken.rboot=="True"){
      this.resetForm();
      this.modoActualizar = true;
      this._userService.loginForm.UserName = this.conexcionService.UserDataToken.sub;
    }else this.redirigirUsuario(this.conexcionService.UserDataToken.role);
  }

  redirigirUsuario(rolIn:string|string[]){
    var auxRol="";
    if(typeof rolIn === 'string')
      auxRol=rolIn;
    else auxRol=rolIn[0];
    switch (auxRol) {
      case 'admin':
      case 'gpv-o':
      case 'gv-m':
      case 'tinabg-m':
        this.router.navigateByUrl('/OrdenSupervisor');
        break;
      case 'guardia':
        this.router.navigateByUrl('/OrdenGuardia');
        break;
      case 'bodega_verificador-m':
        this.router.navigateByUrl('/Bodega/controlBodega');
        break;
      case 'enfermeria':
        this.router.navigateByUrl('/Bodega/controlBodega');
        break;
      case 'verificador-medic':
        this.router.navigateByUrl('/Bodega/verificacion');
        break;
      case 'verificador-bodeguero':
      case 'verificador-bodeguero-b':
        case 'verificador-bodeguero-h':
        this.router.navigateByUrl('/Bodega/inventarioList');
        break;
      case 'pedido-flota':
        this.router.navigateByUrl('/Pedido/VerificacionPedido');
        break;
      case 'pedido-planta':
        this.router.navigateByUrl('/Pedido/Orden');
        break;
      case 'pedido-super':
        this.router.navigateByUrl('/Pedido/PedidosList');
        break;
      case 'adminSuper':
        this.router.navigateByUrl('/Bodega/comprasInv');
        break;
    }
  }

  onChangePass() {
    var auxNombreUsuario;
    Swal.fire({
      title: 'Cambio contraseña',
      text: "Se enviara un código de acceso temporal al número de celular registrado en el Depto. RRHH MANACRIPEX",
      input: 'text',
      inputPlaceholder: 'Nombre Usuario',

      showCancelButton: true,
      confirmButtonText: 'Continuar!',
      customClass: {
        confirmButton: 'btn btn-info mx-1',
        cancelButton: 'btn btn-info mx-1'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Ingrese nombre de Usuario!'
        } else auxNombreUsuario = value;
      }
    }).then((result) => {//la respuesta de los inputs
      if (result.value) {//si recive una respuesta positiva osea Ok
        this._userService.changePass(auxNombreUsuario).subscribe(//cambia el password anterior y te regresa un codigo temporal para poder iniciar sesion
          (res: any) => {
            if (res.message) {
              this.toastr.error(res.message, 'Error!');
            } else this.sendMessage(res.phoneUser, res.newPass);
          })
      }
    })
  }

  //Listo metodo para enviar un mensaje desde la base al celular del usuario
  sendMessage(phoneIn: string, newPassIn: string) {
    var aux: cWhatsapp;
    aux = {
      phone: phoneIn,
      message: ':bell: *Notificación de Clave Temporal*:exclamation: :bell:'
        + '\n'
        + '\n:wave: Saludo Compañero:'
        + '\nSe le informa que su petición por "*_olvido de contraseña_*" ha sido resuelta. Se le generará un código temporal.'
        + '\nEl código de acceso es: *' + newPassIn + '*'
        + '\nPor favor intente logearse con el código temporal para luego restablecer la contraseña deseada.'
        + '\n----------------------------------'
    }
    this.whatsappService.sendMessageWhat(aux).subscribe(
      res => {
        this.toastr.info('Mensaje enviado al número de Whatsapp: ' + phoneIn, 'Solicitud enviada correctamente');
      },
      err => {
        console.log(err);
      }
    )
  }

  onConfirmarPass(form?: NgForm) {//Para saber si coinciden las contrasenias ojo se podria mejorar
    if ((this.userService.loginForm.PasswordHash != "" && this.userService.loginForm.ConfirmPassword != "") && (this.userService.loginForm.PasswordHash != null && this.userService.loginForm.ConfirmPassword != null))
      if (this.userService.loginForm.ConfirmPassword.length >= 4) {
        if (this.userService.loginForm.ConfirmPassword.length >= this.userService.loginForm.PasswordHash.length) {
          form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': true });
          if (this.userService.loginForm.ConfirmPassword == this.userService.loginForm.PasswordHash) {
            form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': false });
            form.control.controls.ConfirmPassword.setErrors(null);
          }
        }
        else form.control.controls.ConfirmPassword.setErrors({ 'incompleta': true });
      }
  }
}
