import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faFileAlt, faSave, faSearch, faStethoscope, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize,map } from 'rxjs/operators';
import { cPacienteInfoCompleta } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpricePersonal } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-ficha-tecnica',
  templateUrl: './ficha-tecnica.component.html',
  styleUrls: ['./ficha-tecnica.component.css']
})
export class FichaTecnicaComponent implements OnInit {
  public get pacienteService(): PacienteService {
    return this._pacienteService;
  }
  public set pacienteService(value: PacienteService) {
    this._pacienteService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }

  listPacienteFiltros$: any;
  dataOrdenesResult: cEnterpricePersonal[] = [];
  datoPersona:cPacienteInfoCompleta=null;
  filtroPersona: string = "";
  spinnerLoading:number=0;
  openSideA:boolean=true;
  strFases: string = "Principal";
  atencionIsOpened:boolean=false;
  formularioIsOpened:boolean=false;

  fasave = faSave; fasearch = faSearch;fastethoscope=faStethoscope; fafile=faFileAlt;fatimescircle = faTimesCircle;
  constructor(private _enterpriceService: ApiEnterpriceService, private _pacienteService: PacienteService,private toastr: ToastrService) { }

  ngOnInit(): void {
    this.resetForm();
    this.onListPasciente('A');
  }

  resetForm(){
    this.datoPersona= new cPacienteInfoCompleta();
  }

  onListPasciente(value: string) {
    this.spinnerLoading=1;
    var strParametro = "all@" + value;
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          return x;
        }),
        finalize(() => this.spinnerLoading = 0)
      );
    } else this.spinnerLoading = 0;
  }

  onChoosePaciente(dataIn: cEnterpricePersonal) {
    this.datoPersona= new cPacienteInfoCompleta();
    this._pacienteService.getPacienteCedula(dataIn.cedula).subscribe((dato:any) => {
      if(dato.exito==1){
        this.datoPersona.datosEnterprice.completarObj(dataIn);
        if(dato.message=="Ok")
          this.datoPersona.datosPaciente.completarObject(dato.data);
        else{
          this.datoPersona.datosPaciente.cedula=this.datoPersona.datosEnterprice.cedula;
          this.datoPersona.datosPaciente.nombreEmpleado=this.datoPersona.datosEnterprice.empleado;
          this.datoPersona.datosPaciente.tipoSangre=this.datoPersona.datosEnterprice.tipoSangre;
        }
      }
    });
  }

  getDataFiltro(data: cEnterpricePersonal[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
    }
  }

  onChangePage(opIn:boolean){
    this.openSideA=opIn;
  }

  onSubmit(form: NgForm){
    if(this.datoPersona.datosPaciente.cedula!=""){
      if(!this.datoPersona.datosPaciente.minusvalido){
        this.datoPersona.datosPaciente.tipoMinusvalido="SIN ASIGNAR";
        this.datoPersona.datosPaciente.porcentajeMinusvalido=0;
      }
      if(this.datoPersona.datosPaciente.idPacienteMedic==undefined)
      this._pacienteService.insertarDataPaciente(this.datoPersona.datosPaciente).subscribe(
        (res: any) => {
          if(res.exito==1){
            this.datoPersona.datosPaciente.idPacienteMedic=res.data.idPacienteMedic;
            this.datoPersona.datosPaciente.antecedentes.idAntecedente=res.data.antecedentes.idAntecedente;
            this.datoPersona.datosPaciente.antecedentes.pacienteMedicId=res.data.antecedentes.pacienteMedicId;
            this.toastr.success('Actualización satisfactorio', 'Ficha Médica');
          } 
          else this.toastr.error('Actualización de Ficha Médica', 'Error');
        }
      );
      else 
      this._pacienteService.actualizarPaciente(this.datoPersona.datosPaciente).subscribe(
        (res: any) => {
          if(res.exito==1)
          this.toastr.success('Actualización satisfactorio', 'Ficha Médica');
          else this.toastr.error('Actualización de Ficha Médica', 'Error');
        }
      );
    }
  }

  recibirRes(salir: boolean, tipo: string) {
    if (tipo == "atencion")
      this.atencionIsOpened = !salir;
    if (tipo == "formulario")
      this.formularioIsOpened = !salir;
      this.strFases = "Principal";
  }

  onStart(op: string) {
    if(this.datoPersona.datosPaciente.idPacienteMedic!=undefined){
      this.strFases = op;
      if(op=="Atencion")
        this.atencionIsOpened=true;
      else this.formularioIsOpened=true;
    }
  }
}
