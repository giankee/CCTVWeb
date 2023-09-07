import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { cAtencionMedic, cPacienteMedic } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import listCie10 from 'src/assets/cie10code.json';

@Component({
  selector: 'app-trans-consulta-atencion',
  templateUrl: './trans-consulta-atencion.component.html',
  styles: [],
})
export class TransConsultaAtencionComponent implements OnInit {
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  listCie10Array = listCie10;
  fasave = faSave;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<TransConsultaAtencionComponent>, private _atencionMedicService: AtencionService, private pacienteService:PacienteService,private toastr: ToastrService) { }

  ngOnInit(): void {
    this.atencionMedicService.formData= new cAtencionMedic();
    if(this.dato.auxIdPaciente!=undefined){
      this.pacienteService.getPacienteById(this.dato.auxIdPaciente).subscribe((datoP: any) => {
        if (datoP.exito == 1) {
          if (datoP.message == "Ok"){
            this.atencionMedicService.formData.pacienteMedicId = datoP.data.idPacienteMedic;
            this.completarDatosAtencion();
          }
          else {
            this.pacienteService.formData = new cPacienteMedic();
            this.pacienteService.formData.empleadoId = this.dato.auxIdPaciente;
            this.pacienteService.insertarDataPaciente(this.pacienteService.formData).subscribe(
              (res: any) => {
                if (res.exito == 1) {
                  this.atencionMedicService.formData.pacienteMedicId = res.data.idPacienteMedic;
                  this.completarDatosAtencion();
                } else this.toastr.error('Se ha producido un inconveniente', 'Error');
              }
            );
          }
        }
      });
    }
  }

  completarDatosAtencion(){
    this.atencionMedicService.formData.fechaAtencion=this.dato.auxData.fechaRegistro;
    this.atencionMedicService.formData.enfermedadesActuales=this.dato.auxData.sintomas;
    this.atencionMedicService.formData.presion="";
    this.atencionMedicService.formData.motivoAtencion="Atención realizada en la marea: "+this.dato.auxData.marea + " bajo la supervisión de: "+ this.dato.auxData.personaResponsable;
    if(this.dato.auxData.listReceta.length>0){
      for(var i=0; i<this.dato.auxData.listReceta.length; i++ ){
        this.atencionMedicService.formData.prescripcion=this.atencionMedicService.formData.prescripcion+ " Cantidad: " + this.dato.auxData.listReceta[i].cantidad + "  "+this.dato.auxData.listReceta[i].inventario.nombre+ "\n ";
      }
    }else this.atencionMedicService.formData.prescripcion="NA";
    this.atencionMedicService.formData.indicaciones="NA";
  }

  onListCIE(value: string) {
    this.atencionMedicService.formData.spinnerLoading = false;
    if (value != '') {
      this.atencionMedicService.formData.showSearchSelect = true;
      this.atencionMedicService.formData.enfermedadCIE10 = value;
    }
  }

  onChooseEnfermedad(data: any) {
    this.atencionMedicService.formData.spinnerLoading = true;
    this.atencionMedicService.formData.showSearchSelect = false;
    if (data != "Nuevo")
      this.atencionMedicService.formData.enfermedadCIE10 = data.code + ": " + data.description;
  }

  onSubmit() {
    if (this.atencionMedicService.formData.spinnerLoading) {
      this.atencionMedicService.insertarAtencion(this.atencionMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro de atención satisfactorio', 'Atención Médica');
            this.onExit(1)
          } else {
            this.toastr.error('Se ha producido un inconveniente', 'Error');
            this.onExit(0);
        }
        }
      );
    }else this.toastr.info('Debe seleccionar una enfermedad', 'Aviso Campo Vacio');
  }

  onExit(tipo:number){
    this.dialogRef.close(tipo);
  }
}
