import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { cAtencionMedic, cPlantillaIees } from 'src/app/shared/medicina/medicina';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import listCie10 from 'src/assets/cie10code.json';
import { jsPDF } from "jspdf";
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';

@Component({
  selector: 'app-atencion-medic',
  templateUrl: './atencion-medic.component.html',
  styles: [],
})
export class AtencionMedicComponent implements OnInit {
  public get pacienteService(): PacienteService {
    return this._pacienteService;
  }
  public set pacienteService(value: PacienteService) {
    this._pacienteService = value;
  }
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
  @Input() edad: string;
  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  okBttnSubmit: boolean = true;
  listCie10Array = listCie10;
  permisoOpened: number = 0 //0 cerrarSinGuardar //1 abrir, //2 cerrarCompleta

  medicinaOpened: number = 0 //0 cerrarSinGuardar //2 abrir, //3 cerrarCompleta
  //ieesOpened:number=0;
  datosIees: cPlantillaIees = new cPlantillaIees();
  soloAnios: string;
  agregarMedicamento: boolean = false;
  medicamentoTexto:string;

  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _atencionMedicService: AtencionService, private toastr: ToastrService, private _permisoMedicService: PermisoService, private _pacienteService: PacienteService,private consultaMedicService: ConsultaMedicService) { }

  ngOnInit(): void {
    this._atencionMedicService.formData = new cAtencionMedic();
    this._atencionMedicService.formData.pacienteMedicId = this.pacienteService.datoPersona.datosPaciente.idPacienteMedic;
    this._atencionMedicService.formData.peso = this.pacienteService.datoPersona.datosPaciente.ultimoPeso;
    this._atencionMedicService.formData.altura = this.pacienteService.datoPersona.datosPaciente.ultimaAltura;
    this.soloAnios = (this.edad.split("años"))[0];
  }

  onTerminar() {
    if (this.permisoOpened == 2) {
      this._permisoMedicService.eliminarPermiso(this.atencionMedicService.formData.permisoIdOpcional).subscribe(
        (res: any) => {
          this.cerrar.emit(true);
        }
      );
    } else this.cerrar.emit(true);
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
    if (data != "Nuevo")
      this._atencionMedicService.formData.enfermedadCIE10 = data.code + ": " + data.description;
  }

  onSubmit(form: NgForm) {
    if (this._atencionMedicService.formData.spinnerLoading) {
      this._atencionMedicService.formData.presion = this.atencionMedicService.formData.presionA + "/" + this.atencionMedicService.formData.presionB;
      this._atencionMedicService.insertarAtencion(this._atencionMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro de atención satisfactorio', 'Atención Médica');
            if ((this.atencionMedicService.formData.prescripcion != "NA" && this.atencionMedicService.formData.prescripcion != "na") && (this.atencionMedicService.formData.indicaciones != "NA" && this.atencionMedicService.formData.indicaciones != "na"))
              this.onConvertPdfReceta();
            if (this.atencionMedicService.formData.citaIESS)
              this.onConvertPdfCertificadoIESS();
              if(this.agregarMedicamento && this.medicinaOpened==3){
                this.onGuardarMedicamento()
              }
          } else this.toastr.error('Se ha producido un inconveniente', 'Error');
          this.cerrar.emit(true);
        }
      );
    }
  }

  onChangePermiso() {
    if (this.atencionMedicService.formData.reposo)
      this.permisoOpened = 1;
  }

  onChangeIees() {
    if (this.atencionMedicService.formData.citaIESS) {
      if (this.datosIees.isOpen == 0)
        this.datosIees = new cPlantillaIees();
      this.datosIees.isOpen = 1;
    }
  }

  onChangeMedicamento() {
    if (this.agregarMedicamento){
      this.medicamentoTexto="";
      this.medicinaOpened = 2;
    }
     
  }

  recibirRes(salir: string) {
    if (salir == '0') {
      this.permisoOpened = 0;
      this.medicinaOpened = 0;
      this.atencionMedicService.formData.reposo = false;
      this.agregarMedicamento = false;
    } else {
      if (this.permisoOpened == 1) {
        var aux = salir.split("-");
        this.permisoOpened = Number(aux[0]);
        this.atencionMedicService.formData.permisoIdOpcional = Number(aux[1]);
      }
      if (this.medicinaOpened == 2) {
        this.consultaMedicService.formData.paciente=this.pacienteService.datoPersona.datosEnterprice.empleado;
        this.consultaMedicService.formData.sintomas=this.atencionMedicService.formData.motivoAtencion;
        this.medicinaOpened=3;

        this.consultaMedicService.formData.listReceta.forEach(x=>{
          this.medicamentoTexto= this.medicamentoTexto +"\n"+ " * "+ x.cantidad + "    " + x.inventario.nombre;
        });
        this.atencionMedicService.formData.prescripcion= this.atencionMedicService.formData.prescripcion + this.medicamentoTexto;
      }
    }
  }

  recibirRes2(datoIn: cPlantillaIees) {
    this.datosIees = datoIn;
    if (this.datosIees.isOpen == 0) {
      this.atencionMedicService.formData.citaIESS = false;
    }
  }

  onConvertPdfAtencion() {
    var y: number;
    var doc = new jsPDF();
    var lineaAux;
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_" + this.pacienteService.datoPersona.datosPaciente.idEmpresa + ".png";
    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);
    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);
    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 4)
      doc.addImage(auxImage, "PNG", 10, 10, 35, 25);

    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 285));//left
    doc.line(205, y, 205, (y + 285));//right
    doc.line(5, (y + 35), 205, (y + 35));//mid1
    doc.line(5, (y + 285), 205, (y + 285));//down

    doc.setFontSize(11);
    doc.setFont("arial", "bold");
    doc.text("ATENCIÓN MÉDICA", 86, (y + 10));
    doc.setFontSize(10);
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 74, (y + 15));
    doc.text("Dra. Medicina y Cirugía General", 82, (y + 19));
    doc.text("Medicina Ocupacional", 88, (y + 23));
    doc.text("Telef. 0983514650", 91, (y + 27));

    doc.text("FECHA: Manta,", 155, (y + 33));
    doc.setFont("arial", "normal");
    doc.text(this._atencionMedicService.formData.fechaAtencion, 182, (y + 33));

    y = 40;
    doc.line(10, (y + 25), 200, (y + 25));//mid1
    doc.line(105, y, 105, (y + 25));//mid
    doc.setFont("arial", "bold");
    doc.text("PACIENTE:", 10, (y + 5));
    doc.text("ENFERMEDAD:", 10, (y + 9));
    doc.text("TEMPERATURA:", 110, (y + 5));
    doc.text("PRESIÓN:", 160, (y + 5));
    doc.text("F. CARDIACA:", 110, (y + 9));
    doc.text("F. RESPIRATORIA:", 160, (y + 9));
    doc.text("PESO:", 110, (y + 13));
    doc.text("ALTURA:", 160, (y + 13));
    doc.text("SATURACIÓN OXIGENO:", 110, (y + 17));

    doc.setFont("arial", "normal");
    doc.text(this.pacienteService.datoPersona.datosEnterprice.empleado, 30, (y + 5));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.enfermedadCIE10 + ".", (90));
    doc.text(lineaAux, 10, (y + 13));
    doc.text(this._atencionMedicService.formData.temperatura + " °C", 140, (y + 5));
    doc.text(this._atencionMedicService.formData.presion + " ", 178, (y + 5));
    doc.text(this._atencionMedicService.formData.fCardiaca.toString(), 137, (y + 9));
    doc.text(this._atencionMedicService.formData.fRespiratoria.toString(), 195, (y + 9));
    doc.text(this._atencionMedicService.formData.peso + "kg", 122, (y + 13));
    doc.text(this._atencionMedicService.formData.altura + "m", 177, (y + 13));
    doc.text(this._atencionMedicService.formData.sp02 + "%", 155, (y + 17));

    y = y + 22;
    doc.line(10, (y + 5), 100, (y + 5));//up1
    doc.line(110, (y + 5), 200, (y + 5));//up2
    doc.line(10, (y + 12), 100, (y + 12));//down1
    doc.line(110, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 75));//left
    doc.line(100, y + 5, 100, (y + 75));//right
    doc.line(110, y + 5, 110, (y + 75));//left
    doc.line(200, y + 5, 200, (y + 75));//right
    doc.line(10, (y + 75), 100, (y + 75));//down1
    doc.line(110, (y + 75), 200, (y + 75));//down2
    doc.setFont("arial", "bold");
    doc.text("Motivo de Atención", 40, (y + 10));
    doc.text("Enfermedad actual", 140, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.motivoAtencion, (80));
    doc.text(lineaAux, 15, (y + 20));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.enfermedadesActuales, (80));
    doc.text(lineaAux, 115, (y + 20));
    y = y + 75;
    doc.line(10, (y + 5), 100, (y + 5));//up1
    doc.line(110, (y + 5), 200, (y + 5));//up2
    doc.line(10, (y + 12), 100, (y + 12));//down1
    doc.line(110, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 75));//left
    doc.line(100, y + 5, 100, (y + 75));//right
    doc.line(110, y + 5, 110, (y + 75));//left
    doc.line(200, y + 5, 200, (y + 75));//right
    doc.line(10, (y + 75), 100, (y + 75));//down1
    doc.line(110, (y + 75), 200, (y + 75));//down2
    doc.setFont("arial", "bold");
    doc.text("Prescripción", 50, (y + 10));
    doc.text("Indicaciones", 145, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.prescripcion, (80));
    doc.text(lineaAux, 15, (y + 20));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.indicaciones, (80));
    doc.text(lineaAux, 115, (y + 20));
    y = 212;
    doc.line(10, (y + 5), 200, (y + 5));//up1
    doc.line(10, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 40));//left
    doc.line(200, y + 5, 200, (y + 40));//right
    doc.line(10, (y + 40), 200, (y + 40));//down2
    doc.setFont("arial", "bold");
    doc.text("Observación", 95, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.observacion, (180));
    doc.text(lineaAux, 15, (y + 17));

    doc.setFont("arial", "bold");
    doc.setFontSize(11);
    y = 270;
    doc.line(65, (y), 145, (y));//downCut
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 70, (y + 4));

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.pacienteService.datoPersona.datosEnterprice.empleado + ".pdf");
  }

  onConvertPdfReceta() {
    var y: number;
    var doc = new jsPDF();

    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_OCUPACIONAL.png";
    doc.addImage(auxImage, "PNG", 8, 8, 28, 18);
    doc.addImage(auxImage, "PNG", 108, 8, 28, 18);

    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 138));//left
    doc.line(105, y, 105, (y + 138));//mid
    doc.line(205, y, 205, (y + 138));//right
    doc.line(5, (y + 138), 205, (y + 138));//down
    doc.line(1, (148), 209, (148));//downCut

    doc.setFontSize(11);
    doc.setFont("arial", "bold")
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 30, (y + 7));
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 130, (y + 7));
    doc.setFontSize(10);
    doc.text("Dra. Medicina y Cirugía General", 37, (y + 11));
    doc.text("Dra. Medicina y Cirugía General", 137, (y + 11));
    doc.text("Medicina Ocupacional", 45, (y + 15));
    doc.text("Medicina Ocupacional", 145, (y + 15));
    doc.text("Telef. 0983514650", 48, (y + 19));
    doc.text("Telef. 0983514650", 148, (y + 19));
    doc.setFont("arial", "normal")
    doc.setFontSize(10);
    y = 30;
    doc.text("NOMBRE DE", 10, (y + 5));
    doc.text("NOMBRE DE", 110, (y + 5));
    doc.text("PACIENTE", 12, (y + 9));
    doc.text("PACIENTE", 112, (y + 9));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.empleado, 35, (y + 7));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.empleado, 137, (y + 7));
    doc.text("EDAD: " + this.soloAnios, 10, (y + 14));
    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 50, (y + 14));
    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 150, (y + 14));

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("Prescripción:", 10, (y + 23));
    doc.text("Indicaciones:", 110, (y + 23));
    doc.line(9, (y + 24), 35, (y + 24));//downCut
    doc.line(109, (y + 24), 135, (y + 24));//downCut

    doc.setFont("arial", "normal");
    y = y + 35;

    var lineaPrescripcion = doc.splitTextToSize(this.atencionMedicService.formData.prescripcion, (90));
    var lineaIndicacion = doc.splitTextToSize(this.atencionMedicService.formData.indicaciones, (90));
    doc.text(lineaPrescripcion, 10, (y));
    doc.text(lineaIndicacion, 110, (y));

    doc.setFontSize(11);
    y = 137
    doc.line(20, (y), 90, (y));//downCut
    doc.line(120, (y), 190, (y));//downCut
    doc.text("FIRMA Y SELLO DEL MÉDICO", 28, (y + 4));
    doc.text("FIRMA Y SELLO DEL MÉDICO", 128, (y + 4));

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.pacienteService.datoPersona.datosEnterprice.empleado + ".pdf");
  }

  onConvertPdfCertificadoIESS() {
    var y: number;
    var doc = new jsPDF();
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_OCUPACIONAL.png";
    doc.addImage(auxImage, "PNG", 9, 9, 28, 18);

    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 285));//left
    doc.line(205, y, 205, (y + 285));//right
    doc.line(5, (y + 285), 205, (y + 285));//down

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 74, (y + 8));
    doc.setFontSize(11);
    doc.text("Dra. Medicina y Cirugía General", 82, (y + 12));
    doc.text("Medicina Ocupacional", 90, (y + 16));
    doc.text("CERTIFICADO MEDICO", 87, (y + 23));
    doc.line(85, (y + 24), 131, (y + 24));//subrayado


    y = 40;
    doc.setFontSize(12);
    doc.text("A)      DATOS DEL ESTABLECIMIENTO DE SALUD", 15, (y));
    doc.text("B)      DATOS DEL PACIENTE", 15, (y + 45));
    doc.text("C)      MOTIVOO DE AISLAMIENTO/ENFERMEDAD", 15, (y + 105));

    doc.setFont("arial", "normal");
    doc.setFontSize(11);
    doc.text("Nombre del establecimiento:", 27, (y + 7));
    doc.line(75, (y + 8), 190, (y + 8));//down
    doc.text("Correo electrónico del medico emisor del certificado:", 27, (y + 14));
    doc.line(113, (y + 15), 190, (y + 15));//down
    doc.text("Teléfono del emisor del certificado:", 27, (y + 21));
    doc.line(85, (y + 22), 190, (y + 22));//down
    doc.text("Dirección del establecimiento de salud:", 27, (y + 28));
    doc.line(90, (y + 29), 190, (y + 29));//down
    doc.text("Lugar y fecha de emisión:", 27, (y + 35));
    doc.line(70, (y + 36), 190, (y + 36));//down
    y = y + 45;
    doc.text("Apellidos y nombres completos:", 27, (y + 7));
    doc.line(80, (y + 8), 190, (y + 8));//down
    doc.text("Dirección domiciliaria:", 27, (y + 14));
    doc.line(66, (y + 15), 190, (y + 15));//down
    doc.text("Número de teléfono:", 27, (y + 21));
    doc.line(64, (y + 22), 190, (y + 22));//down
    doc.text("Institución o empresa:", 27, (y + 28));
    doc.line(65, (y + 29), 190, (y + 29));//down
    doc.text("Puesto de trabajo del cliente:", 27, (y + 35));
    doc.line(75, (y + 36), 190, (y + 36));//down
    doc.text("Número de cédula:", 27, (y + 42));
    doc.line(60, (y + 43), 190, (y + 43));//down
    doc.text("Número de historia clénica:", 27, (y + 49));
    doc.line(75, (y + 50), 190, (y + 50));//down
    y = y + 60;
    doc.text("Diagnostico:", 27, (y + 7));
    doc.line(50, (y + 8), 190, (y + 8));//down
    doc.line(50, (y + 12), 190, (y + 12));//down
    doc.text("Código CIE10:", 27, (y + 19));
    doc.line(55, (y + 20), 190, (y + 20));//down

    doc.text("Presenta síntomas:", 27, (y + 30));

    doc.text("SI", 68, (y + 30));
    doc.text("NO", 151, (y + 30));

    if (this.datosIees.presentSintomas) {
      doc.text("X", 79, (y + 30));
    } else doc.text("X", 164, (y + 30));
    if (this.datosIees.enfermedad) {
      doc.text("X", 79, (y + 40));
    }
    if (this.datosIees.aislamiento) {
      doc.text("X", 164, (y + 40));
    }


    doc.line(75, (y + 25), 85, (y + 25));//up
    doc.line(75, (y + 25), 75, (y + 32));//left
    doc.line(85, (y + 25), 85, (y + 32));//right
    doc.line(75, (y + 32), 85, (y + 32));//down

    doc.line(160, (y + 25), 170, (y + 25));//up
    doc.line(160, (y + 25), 160, (y + 32));//left
    doc.line(170, (y + 25), 170, (y + 32));//right
    doc.line(160, (y + 32), 170, (y + 32));//down

    doc.text("Enfermedad:", 27, (y + 40));
    doc.text("Aislamiento/teletrabajo", 120, (y + 40));
    doc.line(75, (y + 35), 85, (y + 35));//up
    doc.line(75, (y + 35), 75, (y + 42));//left
    doc.line(85, (y + 35), 85, (y + 42));//right
    doc.line(75, (y + 42), 85, (y + 42));//down

    doc.line(160, (y + 35), 170, (y + 35));//up
    doc.line(160, (y + 35), 160, (y + 42));//left
    doc.line(170, (y + 35), 170, (y + 42));//right
    doc.line(160, (y + 42), 170, (y + 42));//down

    doc.text("Tipo de contingencia:", 27, (y + 50));
    doc.line(65, (y + 51), 190, (y + 51));//down
    doc.text("Descripción enfermedad:", 27, (y + 57));

    doc.line(75, (y + 55), 190, (y + 55));//up
    doc.line(75, (y + 55), 75, (y + 80));//left
    doc.line(190, (y + 55), 190, (y + 80));//right
    doc.line(75, (y + 80), 190, (y + 80));//down

    doc.text("Total de días concendidos:", 27, (y + 90));
    doc.line(73, (y + 91), 190, (y + 91));//down
    doc.text("Desde:", 27, (y + 100));
    doc.line(40, (y + 101), 190, (y + 101));//down
    doc.text("Hasta:", 27, (y + 110));
    doc.line(40, (y + 111), 190, (y + 111));//down


    y = 40;
    doc.setFont("arial", "italic");
    doc.setFontSize(10);
    doc.text("Consultorio Privado", 115, (y + 7));
    doc.text("verito.chumo@gmail.com", 135, (y + 14));
    doc.text("0983514650", 130, (y + 21));
    doc.text("La Pradera 1", 125, (y + 28));
    doc.text("Manta, " + this._atencionMedicService.formData.fechaAtencion, 115, (y + 35));
    y = y + 45;
    doc.text(this.pacienteService.datoPersona.datosEnterprice.empleado, 105, (y + 7));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.direccion, 100, (y + 14));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.telf_Movil, 120, (y + 21));

    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 1)
      doc.text("MANACRIPEX CIA. LTDA.", 105, (y + 28));
    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 3)
      doc.text("B & B TUNE_SUPPLIERS S.A.", 95, (y + 28));
    if (this.pacienteService.datoPersona.datosPaciente.idEmpresa == 4)
      doc.text("BUEHS BOWEN DANIEL ROBERTO", 95, (y + 28));

    doc.text(this.pacienteService.datoPersona.datosEnterprice.funcion, 105, (y + 35));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.cedula, 120, (y + 42));
    doc.text(this.pacienteService.datoPersona.datosEnterprice.cedula, 120, (y + 49));

    y = y + 60;

    var auxEnfermedad = this.atencionMedicService.formData.enfermedadCIE10.split(":");
    var lineaAux = doc.splitTextToSize(auxEnfermedad[1], (130));
    doc.text(lineaAux, 55, (y + 7));
    doc.text(auxEnfermedad[0], 110, (y + 19));

    doc.text(this.datosIees.tipoContingencia, 70, (y + 50));

    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.enfermedadesActuales, (105));
    doc.text(lineaAux, 80, (y + 60));

    doc.text(this.datosIees.totalDias.toString(), 125, (y + 90));
    doc.text(this.datosIees.fechaSalida, 100, (y + 100));
    doc.text(this.datosIees.fechaRegreso, 100, (y + 110));

    doc.setFontSize(8);
    doc.text("Número", 120, (y + 94));
    doc.text("Número", 105, (y + 104));
    doc.text("Número", 105, (y + 114));

    doc.setFont("arial", "bold");
    doc.setFontSize(11);
    y = 272;
    doc.line(65, (y), 144, (y));//downCut
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 70, (y + 4));
    doc.text("1309708665", 95, (y + 8));
    doc.text("Doctora en Medicina y Cirugía General / Médico Ocupacional", 55, (y + 12));
    doc.save("Certificado_IESS" + "_" + this.pacienteService.datoPersona.datosEnterprice.empleado + "_" + this.atencionMedicService.formData.fechaAtencion + ".pdf");
  }

  onGuardarMedicamento(){
    this.consultaMedicService.insertarConsumoInterno(this.consultaMedicService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          this.toastr.success('Registro satisfactorio', 'Consumo Registrado');
        } else {
          this.okBttnSubmit = false;
          this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
        };
      });
  }
}
