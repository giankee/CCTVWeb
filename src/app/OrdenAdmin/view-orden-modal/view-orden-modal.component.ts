import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrdenESService } from 'src/app/shared/orden-es.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceEmpleados } from 'src/app/shared/otrosServices/varios';
import { CarroService } from 'src/app/shared/carro.service';
import { cPersonal } from 'src/app/shared/basicos';
import { jsPDF } from "jspdf";
import { faPrint, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { cGaleriaArchivosOrdenES } from 'src/app/shared/ordenEs';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-orden-mmodal',
  templateUrl: './view-orden-modal.component.html',
  styles: []
})
export class ViewOrdenModalComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get carroService(): CarroService {
    return this._carroService;
  }
  public set carroService(value: CarroService) {
    this._carroService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get ordenESService(): OrdenESService {
    return this._ordenESService;
  }
  public set ordenESService(value: OrdenESService) {
    this._ordenESService = value;
  }
  public get verificadorCheack(): boolean {
    return this._verificadorCheack;
  }
  public set verificadorCheack(value: boolean) {
    this._verificadorCheack = value;
  }

  listChoferesIn: cEnterpriceEmpleados[] = [];
  private _verificadorCheack: boolean = false;


  faprint = faPrint; faFileUpload = faFileUpload;

  arrayFilesRutas: any[] = [];
  newArchivos: cGaleriaArchivosOrdenES[] = [];
  okArchivos: boolean = false;
  disableOut: boolean = false;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewOrdenModalComponent>, private _ordenESService: OrdenESService, private _enterpriceService: ApiEnterpriceService, private _carroService: CarroService, private _variosService: VariosService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        imageDescription: true,
        preview: true,
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        preview: true
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    this.galleryImages=[];
    if (this.dato.auxId != null) {
      this._ordenESService.formData = null;
      this.cargarData();
    }
  }

  cargarDataChofer() {//Datos del choferes traidos desde db
    this._enterpriceService.getOnePersona(this._ordenESService.formData.choferId.toString())
      .subscribe(datoE => {
        this._ordenESService.formData.persona = new cPersonal();
        this.ordenESService.formData.persona.nombreP=datoE.empleado;
        this.ordenESService.formData.persona.cedula=datoE.cedula;
        this.ordenESService.formData.persona.tipoPersona="Chofer";
        this.ordenESService.formData.persona.empresa="Empleado";
      },
        error => console.error(error));
  }

  cargarData() {
    this._ordenESService.getOneOrdenA(this.dato.auxId)
      .subscribe(datoOne => {
        this._ordenESService.formData = JSON.parse(JSON.stringify(datoOne));
        this._ordenESService.formData.fechaRegistro = this._ordenESService.formData.fechaRegistro.substring(0, 10);
        if (this._ordenESService.formData.choferId != null)
          this.cargarDataChofer();
        if (this._ordenESService.formData.tipoOrden == "Salida"||this._ordenESService.formData.tipoOrden=="Entrada")
          this._variosService.getVariosPrioridad("null").subscribe(listPrioridades => {
            if (listPrioridades.find(x => x.nombre == this._ordenESService.formData.destinoProcedencia) != undefined)
            this._verificadorCheack = true;
          });
        if (this._ordenESService.formData.listGaleriaArchivoOrdenes.length>0) {
          this.okArchivos = true;
          this.onFiltrarArchivos(this._ordenESService.formData.listGaleriaArchivoOrdenes);
        }
      },
        error => console.error(error));
  }

  onConvertPdf() {
    var y: number;
    var auxCol1 = 25;
    var auxCol2 = 0;
    var auxCol3 = 0;
    var auxCol4 = 0;

    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold")
    doc.text("Orden de " + this._ordenESService.formData.tipoOrden, 75, 25);

    y = 30;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 45));//left
    doc.line(199, y, 199, (y + 45));//right
    doc.line(9, (y + 45), 199, (y + 45));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 10));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);

    if (this._ordenESService.formData.tipoOrden == "Salida" || this._ordenESService.formData.tipoOrden == "Balde Salida") {
      doc.text("Salida de: " + this._ordenESService.formData.planta, 20, (y + 15));
      doc.text("Fecha Saliente: " + this._ordenESService.formData.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Destino: " + this._ordenESService.formData.destinoProcedencia, 20, (y + 25));
    }
    if (this._ordenESService.formData.tipoOrden == "Entrada" || this._ordenESService.formData.tipoOrden == "Balde Entrada") {
      doc.text("Entrada a: " + this._ordenESService.formData.planta, 20, (y + 15));
      doc.text("Fecha de Ingreso: " + this._ordenESService.formData.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Procedencia: " + this._ordenESService.formData.destinoProcedencia, 20, (y + 25));
    }
    if (this._ordenESService.formData.tipoOrden == "Materia Prima")
      doc.text("Suministrado por: " + this._ordenESService.formData.destinoProcedencia, 20, (y + 25));
    doc.text("Documentación " + this._ordenESService.formData.numDocumentacion, 105, (y + 15));
    doc.text("Hora de Registro: " + this._ordenESService.formData.horaRegistro, 105, (y + 20));
    if (this._ordenESService.formData.tipoOrden != "Balde Entrada" && this._ordenESService.formData.tipoOrden != "Balde Salida")
      doc.text("Responsable de orden: " + this._ordenESService.formData.responsableES, 20, (y + 30));
    else doc.text("Responsable de la Transferencia: " + this._ordenESService.formData.responsableES, 20, (y + 30));
    doc.text("Usuario Sistema: " + this._ordenESService.formData.guardiaCargoUser, 20, (y + 35));
    doc.text("Estado de la Orden: " + this._ordenESService.formData.estadoProceso, 20, (y + 40));

    y = y + 45;
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down

    doc.setFontSize(13);
    doc.setFont("arial", "bold")
    doc.text("Datos de la persona", 15, (y + 10));
    doc.setFontSize(11);
    doc.setFont("arial", "normal")
    doc.text("Cédula: " + this._ordenESService.formData.persona.cedula, 20, (y + 15));
    doc.text("Nombre: " + this._ordenESService.formData.persona.nombreP, 20, (y + 20));
    if (this._ordenESService.formData.persona.tipoPersona != "Desconocido")
      doc.text("Tipo de persona: " + this._ordenESService.formData.persona.tipoPersona, 20, (y + 25));
    if (this._ordenESService.formData.persona.empresa != "Desconocido")
      doc.text("Empresa: " + this._ordenESService.formData.persona.empresa, 20, (y + 30));

    if (this._ordenESService.formData.carroId != null) {
      doc.setFontSize(13);
      doc.setFont("arial", "bold")
      doc.text("Datos del vehículo", 105, (y + 10));
      doc.setFont("arial", "normal")
      doc.setFontSize(11);
      doc.text("Número de placa: " + this._ordenESService.formData.carro.numMatricula, 105, (y + 15));
      if (this._ordenESService.formData.choferId != null)
        doc.text("Propietario: " + this._ordenESService.formData.carro.propietario, 105, (y + 20));
      else
        doc.text("Tpo de Vehículo: Privado", 105, (y + 20));
      if (this._ordenESService.formData.carro.marca != "Desconocido" && this._ordenESService.formData.carro.colorCarro != "Desconocido") {
        doc.text("Marca: " + this._ordenESService.formData.carro.marca, 105, (y + 25));
        doc.text("Color: " + this._ordenESService.formData.carro.colorCarro, 105, (y + 30));
      }
    }
    y = y + 35;
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down
    doc.setFontSize(13);
    doc.setFont("arial", "bold");
    doc.text("Lista de Productos", 80, (y + 7));
    doc.setFontSize(11);
    doc.setFont("arial", "normal");

    y = y + 10;
    doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right

    doc.text("#", 13, (y + 7));
    doc.line(20, y, 20, (y + 10));//right
    if (this._ordenESService.formData.tipoOrden != "Materia Prima") {
      auxCol2 = 62 + auxCol1;
      auxCol3 = 50 + auxCol2;
      auxCol4 = 25 + auxCol3;
      doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
      doc.text("Retorna", auxCol3, (y + 7));
    } else {
      auxCol2 = 75 + auxCol1;
      auxCol3 = 0;
      auxCol4 = auxCol2 + 62;
    }
    doc.text("Producto", auxCol1, (y + 7));
    doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
    doc.text("Observación", auxCol2, (y + 7));
    doc.line(auxCol4 - 5, y, auxCol4 - 5, (y + 10));//right
    doc.text("Estado", auxCol4, (y + 7));

    doc.setFontSize(9);
    y = y + 10;

    var valorG: number = 0;
    var valorO: number = 0;
    var lineaDescripcion;
    var lineaObservacion;
    var auxPrueba: number;
    var auxPrueba2: number;

    for (var i = 0; i < this._ordenESService.formData.listArticulosO.length; i++) {
      if(this._ordenESService.formData.listArticulosO[i].inventarioId!=null)
      lineaDescripcion = doc.splitTextToSize(this._ordenESService.formData.listArticulosO[i].inventario.nombre, (auxCol2 - auxCol1 - 5));
      else lineaDescripcion = doc.splitTextToSize(this._ordenESService.formData.listArticulosO[i].producto.nombre, (auxCol2 - auxCol1 - 5));
      lineaObservacion = doc.splitTextToSize(this._ordenESService.formData.listArticulosO[i].observacion, (auxCol3 - auxCol2 - 5));
      valorG = (3 * lineaDescripcion.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;
      if (valorO > valorG)
        valorG = valorO;
      y = y + valorG;

      if (y > 280) {
        doc.addPage();
        doc.setFontSize(11);
        y = 30;

        doc.line(9, y, 199, y);//down +10y1y2
        doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.text("#", 13, (y + 7));
        doc.line(20, y, 20, (y + 10));//right
        doc.text("Producto", auxCol1, (y + 7));
        doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
        doc.text("Observación", auxCol2, (y + 7));

        if (this._ordenESService.formData.tipoOrden != "Materia Prima") {
          doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
          doc.text("Retorna", auxCol3, (y + 7));
        }

        doc.line(auxCol4 - 5, y, auxCol4 - 5, (y + 10));//right
        doc.text("Estado", auxCol4, (y + 7));
        y = y + 10 + valorG;
        doc.setFontSize(9);
      }
      auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2) + 3;//mega formula para centrar el texto en el espacio establecido
      auxPrueba2 = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.line(9, (y - valorG), 9, y);//left
      doc.text(this._ordenESService.formData.listArticulosO[i].cantidad.toString(), 13, (y - ((valorG - 3) / 2)));
      doc.line(20, (y - valorG), 20, y);//right
      doc.text(lineaDescripcion, auxCol1, (y - valorG + auxPrueba));
      doc.line(auxCol2 - 5, (y - valorG), auxCol2 - 5, y);//right
      doc.text(lineaObservacion, auxCol2, (y - valorG + auxPrueba2));
      doc.line(auxCol4 - 5, (y - valorG), auxCol4 - 5, y);//right
      doc.text(this._ordenESService.formData.listArticulosO[i].estadoProducto, auxCol4, (y - ((valorG - 3) / 2)));
      doc.line(199, (y - valorG), 199, y);//right

      if (this._ordenESService.formData.tipoOrden != "Materia Prima") {
        doc.line(auxCol3 - 5, (y - valorG), auxCol3 - 5, y);//right
        if (this._ordenESService.formData.listArticulosO[i].retorna)
          doc.text("SI", auxCol3 + 5, (y - ((valorG - 3) / 2)));
        else doc.text("NO", auxCol3 + 5, (y - ((valorG - 3) / 2)));
      }
      doc.line(9, y, 199, y);//down +10y1y2
    }

    doc.save(this._ordenESService.formData.tipoOrden + "_" + this._ordenESService.formData.fechaRegistro + "-" + this._ordenESService.formData.numDocumentacion + ".pdf");
  }

  onFiltrarArchivos(list: cGaleriaArchivosOrdenES[]) {
    this.galleryImages = [];
    var auxGalleryImage: NgxGalleryImage;
    var descripcion: string;
    var auxTipo;
    for (var i = 0; i < list.length; i++) {
      auxTipo = list[i].tipoArchivo.split("/");
      if (auxTipo[0] == "image") {
        var descripcion = "Nombre: " + list[i].nombreArchivo;
        auxGalleryImage = {
          small: list[i].rutaArchivo,
          medium: list[i].rutaArchivo,
          big: list[i].rutaArchivo,
          description: descripcion,
        }
        this.galleryImages.push(auxGalleryImage);
      }
    }
  }

  onNewFiles(file: FileList) {
    this.okArchivos = true;
    this.disableOut = true;
    var auxNewArchivos: cGaleriaArchivosOrdenES;
    var auxNombre;
    var self = this;
    for (var i = 0; i < file.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL(file[i]);
      auxNombre = file[i].name.split(".");
      auxNewArchivos = {
        ordenESId: this.ordenESService.formData.idOrdenES,
        articuloOId: null,
        tipoArchivo: environment.sharedFolder+"/"+file[i].type,
        nombreArchivo: auxNombre[0],
        rutaArchivo: "",
        estado:1
      }
      this.newArchivos.push(auxNewArchivos);
      reader.addEventListener("load", function (event: any) {
        var rutaCompleta = event.target.result.toString();
        var auxGalleryImage = {
          small: rutaCompleta,
          medium: rutaCompleta,
          big: rutaCompleta,
          description: "",
        }
        self.galleryImages.push(auxGalleryImage);
        self.arrayFilesRutas.push(rutaCompleta);
        if(self.arrayFilesRutas.length==self.newArchivos.length)
          self.disableOut=false;
      });
    }
  }
 
  onExit() {
    if(this.newArchivos.length>0){
      if(!this.disableOut){
        this.disableOut=true;
        var strBase64: String;
        for (var i = 0; i < this.newArchivos.length; i++) {
          strBase64 = this.arrayFilesRutas[i].split('base64,');
          this.newArchivos[i].rutaArchivo= strBase64[1];
        }
        this._ordenESService.insertarGaleriarOrden(this.newArchivos).subscribe(
          (res: any) => {
            this.toastr.success('Archivos subidos satisfactoriamente', 'Galería Subida');
          },
          err => {
            console.log(err);
          }
        );
        this.dialogRef.close();
      }
    }else this.dialogRef.close();
  }
}
