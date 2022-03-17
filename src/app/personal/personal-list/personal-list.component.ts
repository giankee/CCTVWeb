import { Component, OnInit } from '@angular/core';
import { cPersonal } from 'src/app/shared/basicos';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { PersonalService } from 'src/app/shared/personal.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-list',
  templateUrl: './personal-list.component.html',
  styles: []
})
export class PersonalListComponent implements OnInit {
  public get personalService(): PersonalService {
    return this._personalService;
  }
  public set personalService(value: PersonalService) {
    this._personalService = value;
  }

  internetStatus: string = 'nline';
  filtroPersona = '';
  okAyuda: boolean = false;
  autoFocus: boolean = false;
  modoEdicion: boolean = false;
  listPersonasIn: cPersonal[] = [];
  resultBusqueda: cPersonal[]=[];
  indicePersonaSelect: number;
  ordenNombre:string="default";

  /**Para pagination */
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 5;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];
  /**Fin paginatacion */

  /**Icon */
  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch=faSearch;

  constructor(private _conexcionService: ConexionService, private _personalService: PersonalService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarData();
    this.resetForm();
  }

  cargarData() {//Datos de los productos traidos desde db
    this._personalService.getPersonales()
      .subscribe(dato => {
        this.listPersonasIn = dato;
        this.getNumberIndex(this.listPersonasIn.length);
        this.updateIndex(0);
      },
        error => console.error(error));
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
      this.autoFocus = false;
    }
    this.personalService.formData=new cPersonal();
    this.modoEdicion = false;
  }

  completarForm(list: cPersonal, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this.personalService.formData.completarPersonal(list);
    }
    this.modoEdicion = true;
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
    this.getNumberIndex(this.listPersonasIn.length);
    this.updateIndex(0);
  }

  onEditPersona(datoPersona: cPersonal) {//Guarda el indice para luego remplazar
    this.indicePersonaSelect= this.listPersonasIn.indexOf(datoPersona);
    this.completarForm(Object.assign(datoPersona));
  }

  onOrdenNombre() {// cambia el orden por medio de un pipe
    if(this.ordenNombre=="default"||this.ordenNombre=="down")
      this.ordenNombre="up";
    else this.ordenNombre="down";
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
  
  onDelete( datoPersona: cPersonal) {
    if(this.internetStatus=="nline"){
      Swal.fire({
        title: 'Está seguro?',
        text: "Desea Eliminar esta persona?",
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
          this.indicePersonaSelect= this.listPersonasIn.indexOf(datoPersona);
          let list: cPersonal = Object.assign(datoPersona);
          list.estado = 0;
          this._personalService.actualizarPersonal(list).subscribe(
            res => {
              this.toastr.warning('Eliminación satisfactoria', 'Persona');
              this.listPersonasIn.splice(this.indicePersonaSelect,1);
              this.getNumberIndex(this.listPersonasIn.length);
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
  
  onSubmit(form: NgForm) {
    this.autoFocus = false;
    if (this.internetStatus == "nline") {
    
      if (this.modoEdicion) {
        this._personalService.actualizarPersonal(this._personalService.formData).subscribe(
          (res: any) => {
            if (res.message = "Ok") {
              this.toastr.success('Edición satisfactoria', 'Persona');
              this.listPersonasIn[this.indicePersonaSelect] = JSON.parse(JSON.stringify(this._personalService.formData));
              this.resetForm(form);
            }
          },
          err => {
            console.log(err);
          }
        )
      }
      else {
        this._personalService.insertarPersonal(this._personalService.formData).subscribe(
          (res: any) => {
            if (res.message) {
              this.toastr.error('Nombre o cédula esta duplicado', 'Registro fallido.');
              this._personalService.formData.nombreP = null;
              this.autoFocus = true;
            } else {
              this.toastr.success('Ingreso satisfactorio', 'Persona Registrada');
              this.listPersonasIn.push(res);
              this.resetForm(form);
              //this.ordenNombre="default";
              this.getNumberIndex(this.listPersonasIn.length);
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

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "ffline") {
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }

}
