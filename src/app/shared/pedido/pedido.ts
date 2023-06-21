import { cProducto_B } from "../bodega/ordenEC";
import { cFecha } from "../otrosServices/varios";

export class cOrdenPedido {
    idOrdenPedido: number;
    planta: string;
    fechaPedido: string;
    numSecuencial: string;
    proveedor: string;
    empresa: string;
    area: string;
    tipoPedido: string;
    justificacion: string;
    cargoUser: string;
    verificacionUser: string;
    fechaAprobacion: string;
    responsableAprobacion: string;
    archivada:boolean;
    fechaArchivada: string;
    responsableArchivada: string;
    responsableAnulada:string;
    estadoProceso: string;

    listArticulosPedido: cArticulosPedido[] = [];

    /**Control */
    spinnerLoadingP: boolean;
    showSearchSelect: boolean;
    strNumSecuencial: string;
    strRuc: string;
    strLugarA:string;
    boolProveedor:boolean;
    
    constructor(cargoUserIn: string, plantaIn: string, proveedorIn?: string, areaIn?: string) {
        let fechaHoy: cFecha = new cFecha();
        this.idOrdenPedido = undefined;
        this.planta = plantaIn;
        this.fechaPedido = fechaHoy.strFecha;
        this.numSecuencial = "";
        this.empresa = "SIN ASIGNAR";
        if (proveedorIn != null)
            this.proveedor = proveedorIn;
        else this.proveedor = "";
        if (areaIn != null)
            this.area = areaIn;
        else this.area = "SIN ASIGNAR";
        this.tipoPedido = "SIN ASIGNAR";
        this.justificacion = "";
        this.verificacionUser = "SIN ASIGNAR";
        this.responsableAprobacion = "SIN ASIGNAR";
        this.fechaAprobacion = fechaHoy.strFecha;
        this.cargoUser = cargoUserIn;

        this.archivada=false;
        this.responsableArchivada = null;
        this.responsableAnulada=null;
        this.fechaArchivada = fechaHoy.strFecha;;
        this.estadoProceso = "Pendiente Aprobación";

        this.spinnerLoadingP = false;
        this.showSearchSelect = false;
        this.strLugarA="";
        this.boolProveedor=false;
    }

    completarObject(dataIn: cOrdenPedido) {
        this.idOrdenPedido = dataIn.idOrdenPedido;
        this.planta = dataIn.planta;
        this.fechaPedido = dataIn.fechaPedido;
        this.numSecuencial = dataIn.numSecuencial;
        this.proveedor = dataIn.proveedor;
        this.empresa = dataIn.empresa;
        this.area = dataIn.area;
        this.tipoPedido = dataIn.tipoPedido;
        this.justificacion = dataIn.justificacion;
        this.cargoUser = dataIn.cargoUser;
        this.verificacionUser = dataIn.verificacionUser;
        this.fechaAprobacion = dataIn.fechaAprobacion;
        this.responsableAprobacion = dataIn.responsableAprobacion;
        this.archivada=dataIn.archivada;
        this.fechaArchivada = dataIn.fechaArchivada;
        this.responsableArchivada = dataIn.responsableArchivada;
        this.responsableAnulada=dataIn.responsableAnulada;
        this.estadoProceso = dataIn.estadoProceso;

        let auxSecuencial = this.numSecuencial.split("-");
        this.strNumSecuencial = auxSecuencial[1];
        this.boolProveedor=dataIn.boolProveedor;
        
        if (dataIn.listArticulosPedido != null) {
            this.listArticulosPedido = [];
            dataIn.listArticulosPedido.forEach(dataMaterial => {
                var auxMaterial: cArticulosPedido = new cArticulosPedido();
                auxMaterial.completarObject(dataMaterial);
                this.listArticulosPedido.push(auxMaterial);
            });
        }
        this.sacarRuc();
    }

    agregarOneMaterial(dataIn?: cArticulosPedido) {
        var auxArticulo = new cArticulosPedido();
        if (dataIn != null)
            auxArticulo.completarObject(dataIn);
        this.listArticulosPedido.push(auxArticulo);
    }

    sacarRuc() {
        if (this.empresa == "B&B TUNE")
            this.strRuc = "1391736452001";
        if (this.empresa == "DANIEL BUEHS")
            this.strRuc = "1302188618001";
        if (this.empresa == "MANACRIPEX")
            this.strRuc = "1391700830001";
    }
}

export class cArticulosPedido {
    idArticuloPedido: number;
    ordenPedidoId: number;
    inventarioId: number;
    cantidad: number;
    cantidadPendiente:number;
    observacion: string;
    aviso:boolean;
    destinoArea: string;
    estadoArticuloPedido: string;

    ordenPedido: cOrdenPedido;
    inventario: cProducto_B;

    /**Variables de control */
    spinnerLoading: number; //0 off, 1 true, 2 nombre, 3 completo
    showSearchSelect: number; //0 off, 1 codigo, 2 nombre 
    marcar: boolean;

    constructor() {
        this.idArticuloPedido = undefined;
        this.ordenPedidoId = undefined;
        this.inventarioId = undefined;
        this.cantidad = 0;
        this.cantidadPendiente=0;
        this.observacion = "";
        this.destinoArea = "SIN ASIGNAR";
        this.aviso=false;
        this.estadoArticuloPedido = "Pendiente";

        this.inventario = new cProducto_B();

        this.spinnerLoading = 0;
        this.showSearchSelect = 0;
        this.marcar = false;
    }

    completarObject(dataIn: cArticulosPedido) {
        this.idArticuloPedido = dataIn.idArticuloPedido;
        this.ordenPedidoId = dataIn.ordenPedidoId;
        this.inventarioId = dataIn.inventarioId;
        this.cantidad = dataIn.cantidad;
        this.cantidadPendiente=dataIn.cantidadPendiente;
        this.observacion = dataIn.observacion;
        this.aviso=dataIn.aviso;
        this.destinoArea = dataIn.destinoArea;
        this.estadoArticuloPedido = dataIn.estadoArticuloPedido;

        if (dataIn.inventario != null)
            this.inventario.rellenarObjeto(dataIn.inventario);
    }
}