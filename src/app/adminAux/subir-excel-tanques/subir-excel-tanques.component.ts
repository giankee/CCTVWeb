import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { cCarro, cPersonal } from 'src/app/shared/basicos';
import { CarroService } from 'src/app/shared/carro.service';
import { OrdenESService } from 'src/app/shared/orden-es.service';
import { cArticulosO, cOrdenEs } from 'src/app/shared/ordenEs';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceEmpleados } from 'src/app/shared/otrosServices/varios';
import { PersonalService } from 'src/app/shared/personal.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-subir-excel-tanques',
  templateUrl: './subir-excel-tanques.component.html',
  styles: [],
})
export class SubirExcelTanquesComponent implements OnInit {

  flagExcel: boolean;
  arrayBuffer: ArrayBuffer | string;
  listOrdenesFiltradosExcel: cOrdenEs[] = [];
  listCarrosIn: cCarro[];
  listChoferesIn: cEnterpriceEmpleados[];
  listPersonas: cPersonal[];

  constructor(private toastr: ToastrService, private _carroService: CarroService, private enterpriceService: ApiEnterpriceService, private personalService: PersonalService,private ordenESService: OrdenESService) { }

  ngOnInit(): void {
    this.cargarDataCarro();
    this.cargarDataChoferes();
    this.cargarDataPersonas();
  }

  cargarDataCarro() {//Datos del carro traidos desde db
    this._carroService.getCarros().subscribe(dato => {
      this.listCarrosIn = [];
      for (var i = 0; i < dato.length; i++) {
        if (dato[i].propietario == "Manacripex" || dato[i].propietario == "B&B" || dato[i].propietario == "Freshfish") {
          this.listCarrosIn.push(JSON.parse(JSON.stringify(dato[i])));
        }
      }
    },
      error => console.error(error));
  }

  cargarDataChoferes() {//Datos del choferes traidos desde db
    this.enterpriceService.getPersonalEnter("Choferes")
      .subscribe(dato => {
        this.listChoferesIn = dato;
      },
        error => console.error(error));
  }

  cargarDataPersonas() {
    this.personalService.getPersonales()
      .subscribe(dato => {
        this.listPersonas = dato;
      },
        error => console.error(error));
  }

  onExcelUpload(file: File) {
    this.flagExcel = false;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let binaryData = fileReader.result;
      var workbook = XLSX.read(binaryData, { type: "binary" });
      this.listOrdenesFiltradosExcel = [];
      workbook.SheetNames.forEach(sheet => {
        this.filtrarOrdenesXML(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]), sheet);
      });
    }
    fileReader.readAsBinaryString(file[0]); fileReader.onloadend = (e) => {
      this.flagExcel = true;
      this.guardarMultiple();
    }
  }

  filtrarOrdenesXML(dataIn, pageIn: string) {
    const validadorExpresion = /.*\S.*/;
    var auxOrden: cOrdenEs;
    for (var i = 0; i < dataIn.length; i++) {
      if (dataIn[i].STRFECHA != null && dataIn[i].M3 != null && dataIn[i].PLACA != null && dataIn[i].CONDUCTOR != null && dataIn[i].DESTINO != null && dataIn[i].NUMGUIA != null) {
        if (dataIn[i].M3.toString().match(validadorExpresion) && dataIn[i].NUMGUIA.toString().match(validadorExpresion)) {
          if ((this.listOrdenesFiltradosExcel.findIndex(x => x.numDocumentacion == dataIn[i].NUMGUIA)) == -1) {
            if (pageIn == "AGUAHER")
              auxOrden = new cOrdenEs("AGUAHER", "PRUEBAG");
            else auxOrden = new cOrdenEs("P MANACRIPEX", "PRUEBAG");
            auxOrden.tipoOrden = "Salida Tanque " + (pageIn == "COMBUSTIBLE" ? 'Gasolina' : 'Agua');
            auxOrden.numDocumentacion = "Guía: " + dataIn[i].NUMGUIA;
            auxOrden.horaRegistro = "00:00";
            auxOrden.fechaRegistro = dataIn[i].STRFECHA;
            auxOrden.destinoProcedencia = dataIn[i].DESTINO;
            auxOrden.responsableES = "SHIRLEY BALDA";
            auxOrden.estadoProceso = "Procesada";
            auxOrden.numGuiaRetorno = null;
            auxOrden.listArticulosO = [];
            auxOrden.persona = null;
            auxOrden.carro = null;
            let auxChofer = this.listChoferesIn.find(x => x.empleado == dataIn[i].CONDUCTOR);
            if (auxChofer == undefined) {
              auxOrden.choferId = 0;
              let auxPersonal = this.listPersonas.find(x => x.nombreP == dataIn[i].CONDUCTOR);
              if (auxPersonal != undefined)
                auxOrden.personaId = auxPersonal.idPersona;
            } else auxOrden.choferId = auxChofer.idEmpleado;

            let auxCarros = this.listCarrosIn.find(x => x.numMatricula.includes(dataIn[i].PLACA));
            if (auxCarros != undefined)
              auxOrden.carroId = auxCarros.idCarro;
            var auxArticulo = new cArticulosO();//agua 14525 //gasolina 14526
            auxArticulo.producto=null;
            auxArticulo.inventario=null;
            auxArticulo.cantidad = dataIn[i].M3;
            if (pageIn == "COMBUSTIBLE")
              auxArticulo.productoId = 14526;
            else auxArticulo.productoId = 14525;
            auxOrden.listArticulosO.push(auxArticulo);
            this.listOrdenesFiltradosExcel.push(auxOrden);
          } else {
            this.toastr.warning('la Guía ' + dataIn[i].NUMGUIA + ' esta duplicado ', 'Advertencia Tanqueros.', {
              closeButton: true,
              timeOut: 0,
              extendedTimeOut: 1500,
            });
          }
        }
      }
    }
  }

  guardarMultiple() {
    this.ordenESService.postMultiplesOrdenes(this.listOrdenesFiltradosExcel).subscribe(
      (res: any) => {
        if (res.message == "Ok") {
          this.toastr.success('Registro satisfactorio', 'Inventario Ingresado');
        }
      }
    );
  }
}
 