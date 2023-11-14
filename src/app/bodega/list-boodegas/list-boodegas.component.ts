import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faAngleDown, faAngleLeft, faCheck, faEraser, faEye, faPencilAlt, faPlus, faPrint, faQuestion, faSave, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { cBodega, cDataMultiples } from 'src/app/shared/bodega/ordenEC';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-list-boodegas',
  templateUrl: './list-boodegas.component.html',
  styles: [],
})
export class ListBoodegasComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }

  modoEdicion: boolean = false;
  listBodegas: cBodega[];
  selectBodega: cBodega;
  selectAreaAux = "";
  selectEncargadoAux = "";
  ordenBy: string = "default";
  selectDataMultiple:cDataMultiples;
  /**Icon */
  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faprint = faPrint;
  faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch; faplus = faPlus;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faCheack = faCheck;
  constructor(private _variosService: VariosService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.resetForm();
    this.cargarData();
  }

  resetForm() {
    this.selectBodega = new cBodega();
    this.selectAreaAux = "";
    this.selectEncargadoAux = "";
    this.modoEdicion = false;
    this.resetMultiple();
  }

  resetMultiple(){
    this.selectDataMultiple= new cDataMultiples("Empresas",[
      ["B&B TUNE","1391736452001"],
      ["DANIEL BUEHS","1302188618001"],
      ["MANACRIPEX","1391700830001"]],false);
  }

  cargarData() {
    this._variosService.getBodegasTipo("All").subscribe(dato => {
      this.listBodegas = dato;
    });
  }

  onOrdenListBy(op: number) {// cambia el orden por medio de un pipe
    switch (op) {
      case 1:
        if (this.ordenBy == "up-T")
          this.ordenBy = "down-T";
        else this.ordenBy = "up-T";
        break;
      case 2:
        if (this.ordenBy == "up-N")
          this.ordenBy = "down-N";
        else this.ordenBy = "up-N";
        break;
      default: this.ordenBy = "default";
    }
  }

  onCompletarForm(dataIn: cBodega) {
    this.modoEdicion = true;
    this.resetMultiple();
    this.selectBodega = new cBodega();
    this.selectBodega.completarObject(dataIn);
    if(this.selectBodega.empresaAfiliada!=null && this.selectBodega.empresaAfiliada!="")
    this.selectDataMultiple.completarData(this.selectBodega.empresaAfiliada);
    if (this.selectBodega.listAreas.length > 0) {
      this.selectBodega.listAreas.forEach(x => x.ocultarObj = true);
    }
    if (this.selectBodega.listEncargados.length > 0) {
      this.selectBodega.listEncargados.forEach(x => x.ocultarObj = true);
    }
  }

  onSubmit(form: NgForm) {
    if (this.modoEdicion) {
      this.selectBodega.empresaAfiliada=this.selectDataMultiple.selectedChoise;
      this.variosService.actualizarBodega(this.selectBodega).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Edición satisfactoria', 'Bodega');
            this.listBodegas[this.listBodegas.findIndex(x => x.idBodega == this.selectBodega.idBodega)] = cloneDeep(this.selectBodega);
            this.resetForm();
          }
        }
      );
    }
    else {
      this.variosService.insertarBodega(this.selectBodega).subscribe(
        (res: any) => {
          if (res.message == "Ya existe") {
            this.toastr.error('Nombre está duplicado', 'Registro fallido.');
            this.selectBodega.tipoBodega = "SIN ASIGNAR";
            this.selectBodega.nombreBodega = "";
          } else {
            this.toastr.success('Ingreso satisfactorio', 'Bodega Registrada');
            this.listBodegas.push(res.data);
            this.resetForm();
            this.ordenBy = "default";
          }
        }
      );
    }
  }

  onMostrarBodega(index: number) {
    for (var i = 0; i < this.selectBodega.listAreas.length; i++) {
      if (i == index)
        this.selectBodega.listAreas[i].ocultarObj = !this.selectBodega.listAreas[i].ocultarObj;
      else this.selectBodega.listAreas[i].ocultarObj = true;
    }
  }

  onMostrarEncargado(index: number) {
    for (var i = 0; i < this.selectBodega.listEncargados.length; i++) {
      if (i == index)
        this.selectBodega.listEncargados[i].ocultarObj = !this.selectBodega.listEncargados[i].ocultarObj;
      else this.selectBodega.listEncargados[i].ocultarObj = true;
    }
  }
  onNewBodega() {
    if (this.selectAreaAux != "") {
      if (this.selectBodega.listAreas.find(x => x.nombreArea == this.selectAreaAux) == undefined) {
        this.selectBodega.agregarOneArea(null, this.selectAreaAux);
        if (this.selectBodega.idBodega != undefined)
          this.selectBodega.listAreas[this.selectBodega.listAreas.length - 1].bodegaId = this.selectBodega.idBodega;
        this.selectBodega.listAreas.forEach(x => x.ocultarObj = true);
      }
      this.selectAreaAux = "";
    }
  }
  onNewEncargado() {
    if (this.selectEncargadoAux != "") {
      if (this.selectBodega.listEncargados.find(x => x.encargado == this.selectEncargadoAux) == undefined) {
        this.selectBodega.agregarOneEncargado(null, this.selectEncargadoAux);
        if (this.selectBodega.idBodega != undefined)
          this.selectBodega.listEncargados[this.selectBodega.listEncargados.length - 1].bodegaId = this.selectBodega.idBodega;
        this.selectBodega.listEncargados.forEach(x => x.ocultarObj = true);
      }
      this.selectEncargadoAux = "";
    }
  }
}
