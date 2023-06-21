import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';

@Component({
  selector: 'app-aviso-faltante',
  templateUrl: './aviso-faltante.component.html',
  styles: []
})
export class AvisoFaltanteComponent implements OnInit {
  public get consultaMedicService(): ConsultaMedicService {
    return this._consultaMedicService;
  }
  public set consultaMedicService(value: ConsultaMedicService) {
    this._consultaMedicService = value;
  }

  @Input() isOpen: number = 0;

  @Output() cerrar: EventEmitter<string> = new EventEmitter<string>();

  fasave = faSave; fatimesCircle = faTimesCircle;
  constructor(private _consultaMedicService: ConsultaMedicService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    for (var i = 0; i < this.consultaMedicService.formData.listReceta.length; i++) {
      if (this.consultaMedicService.formData.listReceta[i].cantidad == this.consultaMedicService.formData.listReceta[i].newCantidadReal) {
        this.consultaMedicService.formData.listReceta.splice(i, 1);
        i--;
      } else {
        if (this.consultaMedicService.formData.listReceta[i].cantidad > this.consultaMedicService.formData.listReceta[i].newCantidadReal)
          this.consultaMedicService.formData.listReceta[i].cantidad = this.consultaMedicService.formData.listReceta[i].cantidad - this.consultaMedicService.formData.listReceta[i].newCantidadReal;
      }
    }
    if (this.consultaMedicService.formData.listReceta.length > 0) {
      this.guardarConsulta();
      this.onTerminar(1);
    } else this.onTerminar(0);
  }

  onTerminar(op: number) {
    var strOp = op + "";
    this.cerrar.emit(strOp);
  }

  guardarConsulta(){
    this._consultaMedicService.insertarConsumoInterno(this._consultaMedicService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          this.toastr.success('Registro satisfactorio', 'Reporte Registrado');
        } else this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
      });
  }

}
