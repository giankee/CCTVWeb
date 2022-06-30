import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faAngleDown, faAngleLeft, faOutdent, faPlus, faSave, faTimes, faTimesCircle, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { AccidenteService } from 'src/app/shared/bodega/accidente.service';
import { cAccidenteMedic, cGaleriaAccidente, cTestigosMedic } from 'src/app/shared/bodega/ordenTrabajo';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpricePersonal, cFecha } from 'src/app/shared/otrosServices/varios';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-accidente',
  templateUrl: './new-accidente.component.html',
  styles: [],
})
export class NewAccidenteComponent implements OnInit {
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
  public get accidenteMedicService(): AccidenteService {
    return this._accidenteMedicService;
  }
  public set accidenteMedicService(value: AccidenteService) {
    this._accidenteMedicService = value;
  }

  fechaHoy = new cFecha();
  listPacienteFiltros$: any;
  okAddNewTestigo = true;
  okBttnSubmit = true;
  okDelete: boolean = false;

  arrayFilesRutas: any[] = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  faoutdent = faOutdent; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes; fasave = faSave; faangledown = faAngleDown; faangleleft = faAngleLeft; faupload = faUpload; fatrash = faTrash;
  constructor(private _conexcionService: ConexionService, private _accidenteMedicService: AccidenteService, private _enterpriceService: ApiEnterpriceService,private toastr: ToastrService) { }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        thumbnailsColumns: 8,
        imageAnimation: NgxGalleryAnimation.Slide,
        imageDescription: false,
        preview: true,
      },
      // max-width 800
      {
        breakpoint: 800,
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
    this.galleryImages = [];
    this.resetForm();
  }

  resetForm(form?: NgForm) {
    if (form != null) {
      form.resetForm();
    }
    this._accidenteMedicService.formData = new cAccidenteMedic();
    this._accidenteMedicService.formData.agregarOneTestigo();
    this.okAddNewTestigo = true;
    this.okBttnSubmit = true;
  }

  onListPasciente(value: string) {
    this._accidenteMedicService.formData.spinnerLoading = true;
    this._accidenteMedicService.formData.showSearchSelect = true;
    this._accidenteMedicService.formData.paciente = value;
    var strParametro = "all@" + value;
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          return x;
        }),
        finalize(() => this._accidenteMedicService.formData.spinnerLoading = false)
      );
    } else this._accidenteMedicService.formData.spinnerLoading = false;
  }

  onChoosePaciente(data: string) {
    this._accidenteMedicService.formData.showSearchSelect = false;
    this._accidenteMedicService.formData.paciente = data;
  }

  onNewTestigo() {
    if (this._accidenteMedicService.formData.listTestigosAccidente.find(x => x.nombreTestigo == "") == undefined) {
      this._accidenteMedicService.formData.listTestigosAccidente.forEach(x => x.ocultarObj = true)
      this._accidenteMedicService.formData.agregarOneTestigo(null);
    }
  }

  onMostrarTestigo(index: number) {
    for (var i = 0; i < this._accidenteMedicService.formData.listTestigosAccidente.length; i++) {
      if (i == index)
        this._accidenteMedicService.formData.listTestigosAccidente[i].ocultarObj = !this._accidenteMedicService.formData.listTestigosAccidente[i].ocultarObj;
      else this._accidenteMedicService.formData.listTestigosAccidente[i].ocultarObj = true;
    }
  }

  onRemoveNewT(index: number) {
    var auxLR: cTestigosMedic[] = [];
    if (this._accidenteMedicService.formData.listTestigosAccidente.length > 1) {
      this._accidenteMedicService.formData.listTestigosAccidente.splice(index, 1);
      auxLR = JSON.parse(JSON.stringify(this._accidenteMedicService.formData.listTestigosAccidente));
      this._accidenteMedicService.formData.listTestigosAccidente = [];
      this._accidenteMedicService.formData.listTestigosAccidente = JSON.parse(JSON.stringify(auxLR));
    }
  }

  onNewFiles(file: FileList) {//tengo q arreglar si funcionaba para un objeto cuando pones dos se duplica el ultimo
    var auxNewArchivos: cGaleriaAccidente;
    var auxNombre;
    var self = this;
    for (var i = 0; i < file.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL(file[i]);
      auxNombre = file[i].name.split(".");
      auxNewArchivos = {
        idArchivo: undefined,
        accidenteId: undefined,
        tipoArchivo: environment.sharedFolder + "/" + file[i].type,
        nombreArchivo: auxNombre[0],
        rutaArchivo: ""
      }
      this._accidenteMedicService.formData.agregarOneGaleria(auxNewArchivos);
      reader.addEventListener("load", function (event: any) {
        var rutaCompleta = event.target.result.toString();
        var auxGalleryImage = {
          small: rutaCompleta,
          medium: rutaCompleta,
          big: rutaCompleta,
          description: "",
        }
        self.galleryImages.push(auxGalleryImage);
        self.arrayFilesRutas.push(event.target.result.toString());
      });
    }
  }

  onRemoveImage(index: number) {
    var auxLR: cGaleriaAccidente[] = [];
    var auxGR: NgxGalleryImage[] = [];
    if (this._accidenteMedicService.formData.listGaleriaAccidente.length > 0) {
      this._accidenteMedicService.formData.listGaleriaAccidente.splice(index, 1);
      this.galleryImages.splice(index, 1);
      auxLR = JSON.parse(JSON.stringify(this._accidenteMedicService.formData.listGaleriaAccidente));
      auxGR = JSON.parse(JSON.stringify(this.galleryImages));
      this._accidenteMedicService.formData.listGaleriaAccidente = [];
      this.galleryImages = [];
      this._accidenteMedicService.formData.listGaleriaAccidente = JSON.parse(JSON.stringify(auxLR));
      this.galleryImages = JSON.parse(JSON.stringify(auxGR));
    }
  }

  onSubmit(form: NgForm) {
    this.okBttnSubmit = true;
    if (this._accidenteMedicService.formData.listTestigosAccidente.find(x => x.nombreTestigo == "") != undefined)
      this.okBttnSubmit = false;
    if (this._accidenteMedicService.formData.listGaleriaAccidente.length == 0)
      this.okBttnSubmit = false;
    if (this.okBttnSubmit) {
      this.okBttnSubmit=false;
      var strBase64: String;
      for (var i = 0; i < this._accidenteMedicService.formData.listGaleriaAccidente.length; i++) {
        strBase64 = this.arrayFilesRutas[i].split('base64,');
        this._accidenteMedicService.formData.listGaleriaAccidente[i].rutaArchivo = strBase64[1];
      }
      this._accidenteMedicService.insertarAccidente(this._accidenteMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro Exitoso', 'El accidente se ha registrado satisfactoriamente');
            this.resetForm(form);
          }
        }
      );
    }
  }
}
