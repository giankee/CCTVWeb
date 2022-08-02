import { cFecha } from "../otrosServices/varios";
import { cProducto_B } from "./ordenEC";

export class cOrdenTrabajoI {
    idOrdenTraba: number = undefined;
    numOrdenSecuencial: number = undefined;
    planta: string = "";
    fechaRegistro: string = "";
    tipoOrden: string = "";//trabajo, traspaso
    observacion: string = "";
    bodega: string = "GENERAL";
    destinoLugar: string = ""//a otra bodega o a areasBodega
    personaResponsable: string = "";
    bodeguero: string = "";
    guardiaCargoUser: string = "";
    estadoProceso: string = "Procesada";
    listMaterialesO: cMaterialesO[] = [];

    constructor(guardiaCargoIn: string, plantaIn?: string, bodegaIn?: string) {
        let fechaHoy: cFecha = new cFecha();
        this.guardiaCargoUser = guardiaCargoIn;
        this.fechaRegistro = fechaHoy.strFecha;
        if (plantaIn != null)
            this.planta = plantaIn;
        if (bodegaIn != null)
            this.bodega = bodegaIn;
    }

    resetObject() {
        let fechaHoy: cFecha = new cFecha();
        this.idOrdenTraba = undefined;
        this.numOrdenSecuencial = undefined;
        this.fechaRegistro = fechaHoy.strFecha;
        this.tipoOrden = "";
        this.observacion = "";
        this.bodega = "GENERAL";
        this.bodeguero = "";
        this.destinoLugar = ""
        this.personaResponsable = "";
        this.estadoProceso = "Procesada";
        this.listMaterialesO = [];
    }

    completarObject(dataIn: cOrdenTrabajoI) {
        this.idOrdenTraba = dataIn.idOrdenTraba;
        this.numOrdenSecuencial = dataIn.numOrdenSecuencial;
        this.planta = dataIn.planta;
        this.fechaRegistro = dataIn.fechaRegistro.substr(0, 10);
        this.tipoOrden = dataIn.tipoOrden;
        this.observacion = dataIn.observacion;
        this.bodega = dataIn.bodega;
        this.destinoLugar = dataIn.destinoLugar;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.personaResponsable = dataIn.personaResponsable;
        this.bodeguero = dataIn.bodeguero;
        this.estadoProceso = dataIn.estadoProceso;

        if (dataIn.listMaterialesO != null) {
            this.listMaterialesO = [];
            dataIn.listMaterialesO.forEach(dataMaterial => {
                var auxMaterial: cMaterialesO = new cMaterialesO();
                auxMaterial.completarObject(dataMaterial);
                this.listMaterialesO.push(auxMaterial);
            });
        }
    }

    agregarOneMaterial(dataIn?: cMaterialesO) {
        var auxMaterial = new cMaterialesO();
        if (dataIn != null) {
            auxMaterial.completarObject(dataIn);
        }
        this.listMaterialesO.push(auxMaterial);
    }
}

export class cMaterialesO {
    idMaterialO: number = undefined;
    ordenTrabInterId: number = undefined;
    inventarioId: number = undefined;
    observacion: string = "";
    cantidad: number = 0;
    estadoProducto: string = "Procesada";

    inventario: cProducto_B = new cProducto_B();

    /**Variables de control */
    spinnerLoading: boolean = false;
    showSearchSelect: number = 0;

    constructor() {
    }

    resetObject() {
        this.idMaterialO = undefined;
        this.ordenTrabInterId = undefined;
        this.inventarioId = undefined;
        this.observacion = "";
        this.estadoProducto = "Procesada";
        this.inventario.resetProducto();
    }

    completarObject(dataIn: cMaterialesO) {
        this.idMaterialO = dataIn.idMaterialO;
        this.ordenTrabInterId = dataIn.ordenTrabInterId;
        this.inventarioId = dataIn.inventarioId;
        this.observacion = dataIn.observacion;
        this.cantidad = dataIn.cantidad;
        this.estadoProducto = dataIn.estadoProducto;

        if (dataIn.inventario != null)
            this.inventario.rellenarObjeto(dataIn.inventario);
    }
}

export class cConsultaMedic {
    idConsultaMedic: number = undefined;
    numOrdenSecuencial: number = undefined;
    fechaRegistro: string = "";
    bodegaOrigen: string = "";
    sintomas: string = "";
    marea: string = "";
    paciente: string = "";
    personaResponsable: string = "";
    guardiaCargoUser: string = "";
    listReceta: cRecetaMedic[] = [];

    /**Variables de control */
    spinnerLoading: boolean = false;
    showSearchSelect: boolean = false;

    constructor(guardiaCargoIn: string, bodegaIn?: string) {
        let fechaHoy: cFecha = new cFecha();
        this.guardiaCargoUser = guardiaCargoIn;
        this.personaResponsable=guardiaCargoIn;
        this.fechaRegistro = fechaHoy.strFecha;
        if (bodegaIn != null)
            this.bodegaOrigen = bodegaIn;
    }

    resetObject() {
        let fechaHoy: cFecha = new cFecha();
        this.idConsultaMedic = undefined;
        this.numOrdenSecuencial = undefined;
        this.fechaRegistro = fechaHoy.strFecha;
        this.bodegaOrigen = "";
        this.sintomas = "";
        this.marea = "";
        this.paciente = "";
        this.personaResponsable = "";
        this.listReceta = [];

        this.spinnerLoading = false;
        this.showSearchSelect = false;
    }

    completarObject(dataIn: cConsultaMedic) {
        this.idConsultaMedic = dataIn.idConsultaMedic;
        this.numOrdenSecuencial = dataIn.numOrdenSecuencial;
        this.fechaRegistro = dataIn.fechaRegistro.substr(0, 10);
        this.bodegaOrigen = dataIn.bodegaOrigen;
        this.marea = dataIn.marea;
        this.paciente = dataIn.paciente;
        this.sintomas = dataIn.sintomas;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.personaResponsable = dataIn.personaResponsable;

        if (dataIn.listReceta != null) {
            this.listReceta = [];
            dataIn.listReceta.forEach(dataMaterial => {
                var auxItem: cRecetaMedic = new cRecetaMedic();
                auxItem.completarObject(dataMaterial);
                this.listReceta.push(auxItem);
            });
        }
    }

    agregarOneItem(dataIn?: cRecetaMedic) {
        var auxItem = new cRecetaMedic();
        if (dataIn != null) {
            auxItem.completarObject(dataIn);
        }
        this.listReceta.push(auxItem);
    }
}

export class cRecetaMedic {
    idRecetaMedic: number = undefined;
    consultaMedicId: number = undefined;
    inventarioId: number = undefined;
    observacion: string = "";
    cantidad: number = 0;

    inventario: cProducto_B = new cProducto_B();

    /**Variables de control */
    spinnerLoading: boolean = false;
    showSearchSelect: number = 0;

    constructor() {
    }

    resetObject() {
        this.idRecetaMedic = undefined;
        this.consultaMedicId = undefined;
        this.inventarioId = undefined;
        this.observacion = "";
        this.inventario.resetProducto();
    }

    completarObject(dataIn: cRecetaMedic) {
        this.idRecetaMedic = dataIn.idRecetaMedic;
        this.consultaMedicId = dataIn.consultaMedicId;
        this.inventarioId = dataIn.inventarioId;
        this.observacion = dataIn.observacion;
        this.cantidad = dataIn.cantidad;
        if (dataIn.inventario != null)
            this.inventario.rellenarObjeto(dataIn.inventario);
    }
}
