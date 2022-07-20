import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cPacienteMedic, cPermisoMedic } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpricePersonal, cFecha } from 'src/app/shared/otrosServices/varios';
import listCie10 from 'src/assets/cie10code.json';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
  public get permisoMedicService(): PermisoService {
    return this._permisoMedicService;
  }
  public set permisoMedicService(value: PermisoService) {
    this._permisoMedicService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get pacienteService(): PacienteService {
    return this._pacienteService;
  }
  public set pacienteService(value: PacienteService) {
    this._pacienteService = value;
  }


  @Input() isOpen: number = 0;
  @Input() idPacienteIn: number = undefined;
  @Input() enfermedadCIE10In: string = "";

  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();

  fechaHoy = new cFecha();
  listCie10Array = listCie10;
  listPacienteFiltros$: any;
  filtroPersona: string = "";

  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _permisoMedicService: PermisoService, private toastr: ToastrService, private _pacienteService: PacienteService, private _enterpriceService: ApiEnterpriceService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm() {
    this.permisoMedicService.formData = new cPermisoMedic();
    this.filtroPersona = "";
    if (this.isOpen == 1) {
      this.permisoMedicService.formData.pacienteMedicId = this.idPacienteIn;
      this.permisoMedicService.formData.enfermedadCIE10 = this.enfermedadCIE10In;
    }
  }

  onTerminar(op: number, reposoIdIn?: number) {
    var strOp = op + "";
    if (reposoIdIn != null)
      strOp = strOp + "-" + reposoIdIn;
    this.cerrar.emit(strOp);
  }

  onListCIE(value: string) {
    if (value != '') {
      this.permisoMedicService.formData.spinnerLoading = 2;
      this.permisoMedicService.formData.showSearchSelect = 2;
      this.permisoMedicService.formData.enfermedadCIE10 = value;
    } else this.permisoMedicService.formData.spinnerLoading = 0;
  }

  onChooseEnfermedad(data: any) {
    this.permisoMedicService.formData.spinnerLoading = 4;
    this.permisoMedicService.formData.showSearchSelect = 0;
    this.permisoMedicService.formData.enfermedadCIE10 = data.code + ":" + data.description;
  }

  onListPasciente(value: string) {
    this.permisoMedicService.formData.spinnerLoading = 1;
    this.permisoMedicService.formData.showSearchSelect = 1;
    var strParametro = "all@" + value;
    this.filtroPersona = value;
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          return x;
        }),
        finalize(() => this.permisoMedicService.formData.spinnerLoading = 0)
      );
    } else this.permisoMedicService.formData.spinnerLoading = 0;
  }

  onChoosePaciente(dataIn: cEnterpricePersonal) {
    this.permisoMedicService.formData.spinnerLoading = 3;
    this.permisoMedicService.formData.showSearchSelect = 0;
    this.filtroPersona = dataIn.empleado;
    this._pacienteService.formData = new cPacienteMedic();
    this._pacienteService.getPacienteCedula(dataIn.cedula).subscribe((dato: any) => {
      if (dato.exito == 1) {
        if (dato.message == "Ok") {
          this._pacienteService.formData.completarObject(dato.data);
          this.permisoMedicService.formData.pacienteMedicId = this.pacienteService.formData.idPacienteMedic;
        } else {
          this.pacienteService.formData.cedula = dataIn.cedula;
          this.pacienteService.formData.nombreEmpleado=dataIn.empleado;
          this.pacienteService.formData.tipoSangre=dataIn.tipoSangre;
        }
      }
    });
  }

  onSubmit(form: NgForm) {
    if (this.isOpen == 0) {
      if ((this._permisoMedicService.formData.spinnerLoading == 3 || this._permisoMedicService.formData.spinnerLoading == 4) && this.permisoMedicService.formData.tipoPermiso != "SIN ASIGNAR") {
        if (this._permisoMedicService.formData.pacienteMedicId == undefined) {
          this._pacienteService.insertarDataPaciente(this._pacienteService.formData).subscribe(
            (res: any) => {
              if (res.exito == 1) {
                this.permisoMedicService.formData.pacienteMedicId = res.data.idPacienteMedic;
                this.guardarPermiso();
              }
              else this.toastr.error('Se ha producido un inconveniente', 'Error');
            }
          );
        } else this.guardarPermiso();
      }
      else {
        if (this._permisoMedicService.formData.showSearchSelect == 1)
          this.filtroPersona = null;
        else this.permisoMedicService.formData.enfermedadCIE10 = null;
      }
    } else {
      if(this.permisoMedicService.formData.tipoPermiso != "SIN ASIGNAR")
      this.guardarPermiso();
    }
  }

  guardarPermiso() {
    this._permisoMedicService.insertarPermiso(this._permisoMedicService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          this.toastr.success('Registro de permiso satisfactorio', 'Permiso Médico');
          if (this.isOpen == 0)
            this.resetForm();
          else this.onTerminar(2, res.data.idPermisoMedic);
        } else this.toastr.error('Se ha producido un inconveniente', 'Error');
      }
    );
  }
}
