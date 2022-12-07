import { cProducto_B } from "../bodega/ordenEC";
import { cFecha } from "../otrosServices/varios";

export class cOrdenPedido {
    idOrdenPedido: number;
    planta:string;
    fechaPedido: string;
    numSecuencial: string;
    proveedor: string;
    barco: string;
    tipoPedido: string;
    justificacion: string;
    cargoUser: string;
    verificacionUser: string;
    estadoProceso: string;

    listArticulosPedido: cArticulosPedido[] = [];

    /**Control */
    spinnerLoadingP:boolean;
    showSearchSelect:boolean;
    strNumSecuencial:string;
    strArea:string;

    constructor(cargoUserIn: string, plantaIn:string , proveedorIn?: string, barcoIn?: string) {
        let fechaHoy: cFecha = new cFecha();
        this.idOrdenPedido = undefined;
        this.planta=plantaIn;
        this.fechaPedido = fechaHoy.strFecha;
        this.numSecuencial = "";
        if (proveedorIn != null)
            this.proveedor = proveedorIn;
        else this.proveedor = "";
        if (barcoIn != null)
            this.barco = barcoIn;
        else this.barco = "SIN ASIGNAR";
        this.tipoPedido = "SIN ASIGNAR";
        this.justificacion = "";
        this.verificacionUser = "SIN ASIGNAR";
        this.cargoUser = cargoUserIn;
        this.estadoProceso = "Pendiente";

        this.spinnerLoadingP=false;
        this.showSearchSelect=false;
        this.strArea="";
    }

    completarObject(dataIn: cOrdenPedido) {
        this.idOrdenPedido = dataIn.idOrdenPedido;
        this.planta=dataIn.planta;
        this.fechaPedido = dataIn.fechaPedido.substring(0, 10);
        this.numSecuencial = dataIn.numSecuencial;
        this.proveedor = dataIn.proveedor;
        this.barco = dataIn.barco;
        this.tipoPedido = dataIn.tipoPedido;
        this.justificacion = dataIn.justificacion;
        this.cargoUser = dataIn.cargoUser;
        this.verificacionUser = dataIn.verificacionUser;
        this.estadoProceso = dataIn.estadoProceso;

        let auxSecuencial= this.numSecuencial.split("-");
        this.strNumSecuencial=auxSecuencial[1];
        
        if (dataIn.listArticulosPedido != null) {
            this.listArticulosPedido = [];
            dataIn.listArticulosPedido.forEach(dataMaterial => {
                var auxMaterial: cArticulosPedido = new cArticulosPedido();
                auxMaterial.completarObject(dataMaterial);
                this.listArticulosPedido.push(auxMaterial);
            });
        }
    }

    agregarOneMaterial(dataIn?: cArticulosPedido) {
        var auxArticulo = new cArticulosPedido();
        if (dataIn != null) 
            auxArticulo.completarObject(dataIn);
        this.listArticulosPedido.push(auxArticulo);
    }
}

export class cArticulosPedido {
    idArticuloPedido: number;
    ordenPedidoId: number;
    inventarioId: number;
    cantidad: number;
    observacion: string;
    destinoArea:string;
    estadoArticuloPedido: string;

    ordenPedido:cOrdenPedido;
    inventario: cProducto_B;

    /**Variables de control */
    spinnerLoading: number; //0 off, 1 true, 2 nombre, 3 completo
    showSearchSelect: number; //0 off, 1 codigo, 2 nombre 
    marcar:boolean;

    constructor() {
        this.idArticuloPedido = undefined;
        this.ordenPedidoId = undefined;
        this.inventarioId = undefined;
        this.cantidad=0;
        this.observacion = "";
        this.destinoArea="SIN ASIGNAR";
        this.estadoArticuloPedido = "Pendiente";
        
        this.inventario= new cProducto_B();

        this.spinnerLoading=0;
        this.showSearchSelect=0;
        this.marcar=false;
    }

    completarObject(dataIn: cArticulosPedido) {
        this.idArticuloPedido = dataIn.idArticuloPedido;
        this.ordenPedidoId = dataIn.ordenPedidoId;
        this.inventarioId = dataIn.inventarioId;
        this.cantidad=dataIn.cantidad;
        this.observacion = dataIn.observacion;
        this.destinoArea=dataIn.destinoArea;
        this.estadoArticuloPedido = dataIn.estadoArticuloPedido;

        if (dataIn.inventario != null)
            this.inventario.rellenarObjeto(dataIn.inventario);
    }
}