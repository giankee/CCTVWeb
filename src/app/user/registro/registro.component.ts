import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';
import { PuedeDesactivar } from 'src/app/auth/can-deactive.guard';
import Swal from 'sweetalert2';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { NgForm } from '@angular/forms';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceEmpleados } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styles: []
})

export class RegistroComponent implements OnInit, PuedeDesactivar {
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
  }
  internetStatus: string = 'nline';
  listGuardiasIn: cEnterpriceEmpleados[] = [];

  constructor(private _userService: UserService, private toastr: ToastrService, private _conexcionService: ConexionService, private _enterpriceService: ApiEnterpriceService) { }

  ngOnInit() {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.resetForm();
    this.cargarDataGuardias();
  }

  cargarDataGuardias() {//Datos del choferes traidos desde db
    this._enterpriceService.getPersonalEnter("Guardias")
      .subscribe(dato => {
        this.listGuardiasIn = dato;
      },
        error => console.error(error));
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null)
      form.resetForm();
    this._userService.formData = {
      UserName: "",
      Email: null,
      PhoneNumber: "593-",
      PasswordHash: "",
      ConfirmPassword: "",
      estado: 1,
      rolAsignado: "supervisor",
      nombreU: null,
      temporalPassword: false
    }
  }

  onConfirmarPass(form?: NgForm) {//Para saber si coinciden las contrasenias ojo se podria mejorar
    if ((this.userService.formData.PasswordHash != "" && this.userService.formData.ConfirmPassword != "") && (this.userService.formData.PasswordHash != null && this.userService.formData.ConfirmPassword != null))
      if (this.userService.formData.ConfirmPassword.length >= 4) {
        if (this.userService.formData.ConfirmPassword.length >= this.userService.formData.PasswordHash.length) {
          form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': true });
          if (this.userService.formData.ConfirmPassword == this.userService.formData.PasswordHash) {
            form.control.controls.ConfirmPassword.setErrors(null);
          }
        } else form.control.controls.ConfirmPassword.setErrors({ 'incompleta': true });
      }
  }

  onSubmit(form?: NgForm) {
    if (this.internetStatus == "nline") {
      this._userService.insertarRegistro(this._userService.formData).subscribe(
        (res: any) => {
          if (res.message != null) {
            this.toastr.error(res.message, 'Registro Fallido.');
          } else
            if (res.result) {
              this.resetForm(form);
              if (res.result2 == "New")
                this.toastr.success('Nuevo usuario creado!', 'Registro Exitoso.');
              else this.toastr.success('Usuario Actualizado!', 'Actualizacion Exitoso.');
            } else {
              res.errors.forEach(element => {
                if (element.code == "DuplicateUserName") {
                  this.toastr.error('Nombre de usuario existente', 'Registro fallido.');
                }
                else this.toastr.error(element.description, 'Registro fallido.');
              });
            }
        },
        err => {
          console.log(err);
        }
      );
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info'
        },
        buttonsStyling: false
      })
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {//Para que pueda salir
    if (this.userService.formData.UserName == "" && this.userService.formData.Email == "") {
      return true;
    } else {
      if (this.internetStatus == "nline") {
        const confirmacion = window.confirm('¿Quieres salir del formulario y perder los cambios realizados?');
        return confirmacion;
      }
    }
    if (this.internetStatus == "ffline") {
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
  }
}
