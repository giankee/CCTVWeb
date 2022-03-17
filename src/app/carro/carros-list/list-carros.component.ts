import { Component, OnInit } from '@angular/core';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';

import { NgForm } from '@angular/forms';
import { PersonalService } from 'src/app/shared/personal.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CarroService } from 'src/app/shared/carro.service';
import { cCarro, cPersonal } from 'src/app/shared/basicos';

@Component({
  selector: 'app-list-carros',
  templateUrl: './list-carros.component.html',
  styles: []
})
export class ListCarrosComponent implements OnInit {
  public get personalService(): PersonalService {
    return this._personalService;
  }
  public set personalService(value: PersonalService) {
    this._personalService = value;
  }
  public get carroService(): CarroService {
    return this._carroService;
  }
  public set carroService(value: CarroService) {
    this._carroService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  /**Icon */
  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch=faSearch;

  internetStatus: string = 'nline';
  filtroCarro = '';
  okAyuda: boolean = false;
  autoFocus: boolean = false;
  modoEdicion: boolean = false;
  listCarrosIn: cCarro[] = [];
  resultBusqueda: cCarro[]=[];
  listPersonalIn: cPersonal[] = [];
  indiceCarroSelect: number;
  disableBtnPersonal: boolean;
  ordenPropietario:string="default";

  /**Para pagination */
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 5;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];
  /**Fin paginatacion */

  constructor(private _conexcionService: ConexionService, private _carroService: CarroService, private _personalService: PersonalService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarData();
    this.cargarDataPersonal();
    this.resetForm();

  }

  cargarData() {//Datos del carro traidos desde db
    this._carroService.getCarros()
      .subscribe(dato => {
        this.listCarrosIn = dato;
        this.getNumberIndex(this.listCarrosIn.length);
        this.updateIndex(0);
      },
        error => console.error(error));
  }

  cargarDataPersonal() {//Datos del personal traidos desde db
    this._personalService.getPersonales()
      .subscribe(dato => {
        this.listPersonalIn = dato;
      },
        error => console.error(error));
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
      this.autoFocus = false;
    }
    this._carroService.formData = {
      numMatricula: "",
      colorCarro: "",
      marca: "",
      propietario: null,
      estado: 1
    }
    this.modoEdicion = false;
    this.disableBtnPersonal = true;
    this._personalService.formData = {
      cedula: "",
      nombreP: "",
      tipoPersona: null,
      estado: 1,
      empresa: ""
    }
  }

  //listo
  completarForm(list: cCarro, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this._carroService.formData = {
        idCarro: list.idCarro,
        numMatricula: list.numMatricula,
        colorCarro: list.colorCarro,
        marca: list.marca,
        propietario: list.propietario,
        estado: list.estado
      }
      this._personalService.formData = {
        cedula: "",
        nombreP: "",
        tipoPersona: null,
        estado: 1,
        empresa:""
      }
    }
    this.modoEdicion = true;
    this.disableBtnPersonal = true;
  }

  //Listo
  onEditVehiculo(datoCarro: cCarro) {//Guarda el indice para luego remplazar
    this.indiceCarroSelect= this.listCarrosIn.indexOf(datoCarro);
    this.completarForm(Object.assign(datoCarro));
  }

  getDataFiltro(data) {//Para q la filtracion de datos se automatica
    if(this.resultBusqueda.length==0){
      this.resultBusqueda=JSON.parse(JSON.stringify(data));
    }else{
      if(JSON.stringify(data)!=JSON.stringify(this.resultBusqueda)){
        this.resultBusqueda=JSON.parse(JSON.stringify(data));
        this.getNumberIndex(this.resultBusqueda.length);
        this.updateIndex(0);
      }
    }
      
  }

  getNumberIndex(n: number) {//Para establecer las paginas del pagination y el numero de elemento por pagina
    this.pagTotal = [];
    const aux = n / this.selectPagination;
    var auxEntera = parseInt(aux.toString(), 10);
    var auxValores;
    if ((aux - auxEntera) > 0) {
      auxEntera = auxEntera + 1;
    }
    for (var i = 0; i < auxEntera; i++) {
      auxValores = {
        valorB: false,
        mostrar: false
      }
      this.pagTotal.push(auxValores);
    }
  }

  updateIndex(pageIndex: number) {//Para cambiar de pagina y ademas bloquiar y desbloquiar pag anterior y post si es q no cumple la condiciones
    this.pagActualIndex = pageIndex;
    this.startIndex = Number(this.pagActualIndex * this.selectPagination);
    this.endIndex = Number(this.startIndex) + Number(this.selectPagination);

    if (this.pagActualIndex + 2 <= this.pagTotal.length)
      this.siguienteBlock = false;
    else
      this.siguienteBlock = true;

    if (this.pagActualIndex > 0)
      this.anteriorBlock = false;
    else
      this.anteriorBlock = true;

    for (var i = 0; i < this.pagTotal.length; i++) {
      if (i == pageIndex)
        this.pagTotal[i].valorB = true;
      else
        this.pagTotal[i].valorB = false;

      if ((pageIndex == 0 && i < 5) || (pageIndex == 1 && i < 5) || (pageIndex == this.pagTotal.length - 1 && i > this.pagTotal.length - 6) || (pageIndex == this.pagTotal.length - 2 && i > this.pagTotal.length - 6))
        this.pagTotal[i].mostrar = false;
      else {
        if ((i >= pageIndex + 3) || (i <= pageIndex - 3))
          this.pagTotal[i].mostrar = true;
        else
          this.pagTotal[i].mostrar = false;
      }
    }
  }

  updateSelect(control){//cuando hacen cambio en el numero de registrso por views
    this.selectPagination = control.value;
    this.getNumberIndex(this.listCarrosIn.length);
    this.updateIndex(0);
  }

  onOrdenPropietario() {// cambia el orden por medio de un pipe
    if(this.ordenPropietario=="default"||this.ordenPropietario=="down")
      this.ordenPropietario="up";
    else this.ordenPropietario="down";
  }

  onAutoCompletarPersonal() {
    if (this._personalService.formData.cedula.toString().length == 9 || this._personalService.formData.cedula.toString().length == 10) {
      if (this._personalService.formData.cedula.toString().length == 9) {
        this._personalService.formData.cedula = "0" + this._personalService.formData.cedula;
      }
      let aux: cPersonal = this.listPersonalIn.find(x => x.cedula == this._personalService.formData.cedula);
      if (aux != undefined) {
        this._personalService.formData = {
          cedula: aux.cedula,
          nombreP: aux.nombreP,
          tipoPersona: aux.tipoPersona,
          estado: 1,
          empresa:""
        }
        this.disableBtnPersonal = true;
      } else {
        this._personalService.formData.nombreP = "";
        this._personalService.formData.tipoPersona = null;
        this.disableBtnPersonal = false;
      }
    }
  }

  onSubmit(form: NgForm) {
    this.autoFocus = false;
    if (this.internetStatus == "nline") {
      if (this._personalService.formData.nombreP != "" && this._carroService.formData.propietario == "NewP" && this._carroService.formData.propietario != null) {
        this._carroService.formData.propietario = this._personalService.formData.nombreP;
      } else this.disableBtnPersonal = true;
      if (this.modoEdicion) {
        this._carroService.actualizarCarro(this._carroService.formData).subscribe(
          (res: any) => {
            if (res.message = "Ok") {
              this.toastr.success('Edición satisfactoria', 'Vehículo');
              this.listCarrosIn[this.indiceCarroSelect] = JSON.parse(JSON.stringify(this._carroService.formData));
              if (this.disableBtnPersonal == false)
                this._personalService.insertarPersonal(this._personalService.formData).subscribe(
                  (res: any) => {
                    if (res.message) {
                      this.toastr.error('Personal duplicado', 'Registro fallidode nuevo Propietario');
                    }
                    else {
                      this.listPersonalIn.push(res);
                    }
                  }
                )
              this.resetForm(form);
            }
          },
          err => {
            console.log(err);
          }
        )
      }
      else {
        this._carroService.insertarCarro(this._carroService.formData).subscribe(
          (res: any) => {
            if (res.message) {
              this.toastr.error('Nombre o matricula está duplicado', 'Registro fallido.');
              this._carroService.formData.numMatricula = null;
              this.autoFocus = true;
            } else {
              this.toastr.success('Ingreso satisfactorio', 'Vehículo Registrado');
              this.listCarrosIn.push(res);
              if (this.disableBtnPersonal == false)
                this._personalService.insertarPersonal(this._personalService.formData).subscribe(
                  (res: any) => {
                    if (res.message) {
                      this.toastr.error('Personal duplicado', 'Registro fallidode nuevo Propietario');
                    }
                    else {
                      this.listPersonalIn.push(res);
                    }
                  }
                )
              this.resetForm(form);
              this.ordenPropietario="default";
              this.getNumberIndex(this.listCarrosIn.length);
              this.updateIndex(this.pagTotal.length - 1);
            }
          }
        )
      }
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info'
        },
        buttonsStyling: false
      })
    }
  }

  onDelete( datoCarro: cCarro) {
    if(this.internetStatus=="nline"){
      Swal.fire({
        title: 'Está seguro?',
        text: "Desea Eliminar este vehículo?",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#E53935',
        confirmButtonText: 'Continuar!',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-info mr-2',
          cancelButton: 'btn btn-danger ml-2'
        },
        buttonsStyling:false
      }).then((result) => {
        if (result.value) {
          this.indiceCarroSelect= this.listCarrosIn.indexOf(datoCarro);
          let list: cCarro = Object.assign(datoCarro);
          list.estado = 0;
          this._carroService.actualizarCarro(list).subscribe(
            res => {
              this.toastr.warning('Eliminación satisfactoria', 'Vehículo');
              this.listCarrosIn.splice(this.indiceCarroSelect,1);
              this.getNumberIndex(this.listCarrosIn.length);
              this.updateIndex(0);
            },
            err => {
              console.log(err);
            }
          )
        }
      })
    }else{
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling:false
      })
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "ffline") {
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }
}
