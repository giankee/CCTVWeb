import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faPencilAlt, faPrint, faSave, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';
import { cEnterpriceProveedor } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-list-proveedor',
  templateUrl: './list-proveedor.component.html',
  styles: []
})
export class ListProveedorComponent implements OnInit {
  public get proveedorService(): ProveedorService {
    return this._proveedorService;
  }
  public set proveedorService(value: ProveedorService) {
    this._proveedorService = value;
  }

  spinnerOnOff: boolean = true;
  modoEdicion: boolean = false;
  listProveedoresMostrar$: any;
  filtroProveedor: string = "";
  dataProveedoresResult: cEnterpriceProveedor[] = [];


  sort = faSort; fapencilAlt = faPencilAlt; faprint = faPrint;
  fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch;

  constructor(private toastr: ToastrService, private _proveedorService: ProveedorService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm() {
    this.modoEdicion = false;
    this.proveedorService.formData = new cEnterpriceProveedor();
  }

  onBListProgProveedor(value: string) {
    this.spinnerOnOff = true;
    this.filtroProveedor = value;
    if (value)
      this.listProveedoresMostrar$ = this.proveedorService.getProveedorSearch(value).pipe(
        map((x: cEnterpriceProveedor[]) => {
          return x;
        }),
        finalize(() => this.spinnerOnOff = false)
      );
    else {
      this.spinnerOnOff = false
      this.listProveedoresMostrar$ = null;
    }
  }
  
  getDataFiltro(data: cEnterpriceProveedor[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined) {
      this.dataProveedoresResult = JSON.parse(JSON.stringify(data));
    }
  }

  onCompletarForm(datoIn: cEnterpriceProveedor,) {//Para LLenar la informacion al formulario
    this.modoEdicion = true;
    this.proveedorService.formData=new cEnterpriceProveedor();
    this.proveedorService.formData.completarObj(datoIn);  
    if(this.proveedorService.formData.telefono!=null){
      var auxSoloNum= this.proveedorService.formData.telefono.split('-');
      this.proveedorService.formData.telefono=auxSoloNum[1];
    }   
  }

  onSubmit(form: NgForm) {
    if (this.modoEdicion) {
      if(this.proveedorService.formData.telefono!=null)
      this.proveedorService.formData.telefono="593-"+this.proveedorService.formData.telefono;
    this.proveedorService.actualizarDataProveedor(this.proveedorService.formData).subscribe(
        (res: any) => {
          this.toastr.success('Datos Actualizados', 'Proveedor');
          this.resetForm();
          this.onBListProgProveedor(this.filtroProveedor);
        },
        err => {
          console.log(err);
        }
      ) 
    }
  }
}
