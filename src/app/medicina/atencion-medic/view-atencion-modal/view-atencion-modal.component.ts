import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';

@Component({
  selector: 'app-view-atencion-modal',
  templateUrl: './view-atencion-modal.component.html',
  styles: [],
})
export class ViewAtencionModalComponent implements OnInit {
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewAtencionModalComponent>, private _atencionMedicService: AtencionService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      if (this.dato.auxId != this.atencionMedicService.formData.idAtencionMedic)
        this.dialogRef.close();
    }
  }

}
