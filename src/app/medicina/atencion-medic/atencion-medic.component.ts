import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { cAtencionMedic } from 'src/app/shared/medicina/medicina';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import listCie10 from 'src/assets/cie10code.json';
@Component({
  selector: 'app-atencion-medic',
  templateUrl: './atencion-medic.component.html',
  styles: [],
})
export class AtencionMedicComponent implements OnInit {
  public get permisoMedicService(): PermisoService {
    return this._permisoMedicService;
  }
  public set permisoMedicService(value: PermisoService) {
    this._permisoMedicService = value;
  }
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  @Input() isOpen: boolean;
  @Input() idPacienteIn: number;
  @Input() pacienteNombre: string;

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  okBttnSubmit: boolean = true;
  listCie10Array = listCie10;
  permisoOpened: number = 0 //0 cerrarSinGuardar //1 abrir, //2 cerrarCompleta


  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _atencionMedicService: AtencionService, private toastr: ToastrService, private _permisoMedicService: PermisoService) { }

  ngOnInit(): void {
    this._atencionMedicService.formData = new cAtencionMedic();
    this._atencionMedicService.formData.pacienteMedicId = this.idPacienteIn;
  }

  onTerminar() {
    if(this.permisoOpened==2){
      this._permisoMedicService.eliminarPermiso(this.atencionMedicService.formData.permisoIdOpcional).subscribe(
        (res: any) => {
          this.cerrar.emit(true);
        }
      );
    }else this.cerrar.emit(true);
  }

  onListCIE(value: string) {
    this._atencionMedicService.formData.spinnerLoading = false;
    if (value != '') {
      this.atencionMedicService.formData.showSearchSelect = true;
      this._atencionMedicService.formData.enfermedadCIE10 = value;
    }
  }

  onChooseEnfermedad(data: any) {
    this.atencionMedicService.formData.spinnerLoading = true;
    this._atencionMedicService.formData.showSearchSelect = false;
    this._atencionMedicService.formData.enfermedadCIE10 = data.code + ":" + data.description;
  }

  onSubmit(form: NgForm) {
    if (this._atencionMedicService.formData.spinnerLoading) {
      this._atencionMedicService.insertarAtencion(this._atencionMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro de atención satisfactorio', 'Atención Médica');
          } else this.toastr.error('Se ha producido un inconveniente', 'Error');
          this.onTerminar();
        }
      );
    }
  }

  onChangePermiso() {
    if (this.atencionMedicService.formData.reposo)
      this.permisoOpened = 1;
  }

  recibirRes(salir: string) {
    if(salir=='0'){
      this.permisoOpened=0;
      this.atencionMedicService.formData.reposo=false;
    }else{
      var aux=salir.split("-");
      this.permisoOpened=Number(aux[0]);
      this.atencionMedicService.formData.permisoIdOpcional=Number(aux[1]);
    }
  }
}
