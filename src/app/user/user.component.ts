import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { cUsuario } from '../shared/user-info';
import { cWhatsapp } from '../shared/otrosServices/varios';
import { WhatsappService } from '../shared/otrosServices/whatsapp.service';

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
  constructor(private _userService: UserService, private router: Router, private toastr: ToastrService, private _whatsappService: WhatsappService) { }

  ngOnInit(): void {
    if (localStorage.getItem('token') != null)//Si es que existe un token! carga datos del usuario
      this.cargarDataUser();
    else
      this.resetForm();
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null)
      form.resetForm();
    this._userService.formData = {
      UserName: "",
      PasswordHash: "",
      ConfirmPassword: ""
    }
  }

  onSubmit() {//Pasa los datos del formulario y llama al servicio login 
    if (this.modoActualizar) {//falta eliminar el token y generar uno nuevo
      this._userService.updatePass(this.userService.formData).subscribe(//cambia el password anterior y te regresa un codigo temporal para poder iniciar sesion
        (res: any) => {
          if (res.message == "Ok") {
            this.modoActualizar = false;
            this.cargarDataUser();
            this.toastr.success('La contraseña fue actualizada correctamente', 'Actualizar Contraseña.');
          } else this.toastr.error(res.message, 'Error!');
        })
    } else
      this._userService.login(this._userService.formData).subscribe(
        (res: any) => {
          if (!res.message) {//existe un usuario con ese nombre y contrasenia
            localStorage.setItem('token', res.token);
            this.cargarDataUser();//Manda a cargar los datos del usuario para saber el rol
          }
          else
            this.toastr.error('Nombre de usuario o contraseña incorrecto.', 'Inicio de sessión fallido.');
        },
        err => {
          console.log(err);
        }
      );
  }

  cargarDataUser() {//Recupera la informacion Del Usuario y lo redirige a la pagina que le correspoda su rol
    this._userService.getUserData().subscribe(
      (res: any) => {
        if (res.temporalPassword) {
          this.resetForm();
          this.modoActualizar = true;
          this._userService.formData.UserName = res.userName;
        } else {
          switch (res.rolAsignado) {
            case 'admin':
            case 'supervisor':
            case 'gpv-o':
            case 'gv-m':
              this.router.navigateByUrl('/OrdenSupervisor');
              break;
            case 'guardia':
              this.router.navigateByUrl('/OrdenGuardia');
              break;
            case 'verificador-p':
            case 'verificador-m':
              this.router.navigateByUrl('/OrdenVerificacion');
              break;
            case 'visitante':
              this.router.navigateByUrl('/OrdenVisitante');
              break;
            case 'tinabg-m':
              this.router.navigateByUrl('/Tina/movTinas');
            break;
            case 'bodega_verificador-m':
              this.router.navigateByUrl('/Bodega/controlBodega');
              break;
          }
        }
      },
      err => {
        console.log(err);
      },
    ); 
  }

  //Listo
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
        var auxUserRecuperar: cUsuario = {
          UserName: auxNombreUsuario
        }
        this._userService.changePass(auxUserRecuperar).subscribe(//cambia el password anterior y te regresa un codigo temporal para poder iniciar sesion
          (res: any) => {
            if (res.message) {
              this.toastr.error(res.message, 'Error!');
            } else this.sendMessage(res.phoneUser, res.newPass)
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
    if ((this.userService.formData.PasswordHash != "" && this.userService.formData.ConfirmPassword != "") && (this.userService.formData.PasswordHash != null && this.userService.formData.ConfirmPassword != null))
      if (this.userService.formData.ConfirmPassword.length >= 4) {
        if (this.userService.formData.ConfirmPassword.length >= this.userService.formData.PasswordHash.length) {
          form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': true });
          if (this.userService.formData.ConfirmPassword == this.userService.formData.PasswordHash) {
            form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': false });
            form.control.controls.ConfirmPassword.setErrors(null);
          }
        }
        else form.control.controls.ConfirmPassword.setErrors({ 'incompleta': true });
      }
  }
}
