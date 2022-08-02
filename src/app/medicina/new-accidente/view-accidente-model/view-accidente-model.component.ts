import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { AccidenteService } from 'src/app/shared/medicina/accidente.service';

@Component({
  selector: 'app-view-accidente-model',
  templateUrl: './view-accidente-model.component.html',
  styles: [],
})
export class ViewAccidenteModelComponent implements OnInit {
  public get accidenteMedicService(): AccidenteService {
    return this._accidenteMedicService;
  }
  public set accidenteMedicService(value: AccidenteService) {
    this._accidenteMedicService = value;
  }

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewAccidenteModelComponent>, private _accidenteMedicService: AccidenteService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {console.table(this.dato)
      if (this.dato.auxId != this.accidenteMedicService.formData.idAccidenteMedic)
        this.dialogRef.close();
      else{
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
        this.onFiltrarArchivos();
      }
    }
  }

  onFiltrarArchivos() {
    this.galleryImages = [];
    var auxGalleryImage: NgxGalleryImage;
    var descripcion: string;
    var auxTipo;
    for (var i = 0; i < this.accidenteMedicService.formData.listGaleriaAccidente.length; i++) {
      auxTipo = this.accidenteMedicService.formData.listGaleriaAccidente[i].tipoArchivo.split("/");
      if (auxTipo[0] == "image") {
        var descripcion = "Nombre: " + this.accidenteMedicService.formData.listGaleriaAccidente[i].nombreArchivo;
        auxGalleryImage = {
          small: "./assets/cctv"+this.accidenteMedicService.formData.listGaleriaAccidente[i].rutaArchivo,
          medium: "./assets/cctv"+this.accidenteMedicService.formData.listGaleriaAccidente[i].rutaArchivo,
          big: "./assets/cctv"+this.accidenteMedicService.formData.listGaleriaAccidente[i].rutaArchivo,
          description: descripcion,
        }
        this.galleryImages.push(auxGalleryImage);
      }
    }
    console.table(this.galleryImages);
  }
}
