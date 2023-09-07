import { cPersonal, cCarro, cProducto, cBalde } from './basicos';
import { cProducto_B } from './bodega/ordenEC';
import { cFecha } from './otrosServices/varios';

export class cOrdenEs {
    idOrdenES?: number = undefined;
    tipoOrden: string = undefined;
    fechaRegistro: string = "2021-10-25";
    horaRegistro: string = "";
    numDocumentacion: string = null;

    planta: string = undefined;
    destinoProcedencia?: string = undefined;
    responsableES: string = "";

    guardiaCargoUser: string = undefined;
    personaId?: number = null;
    choferId?: number = null;
    carroId?: number = null;
    numGuiaRetorno?: string = undefined;
    estadoProceso: string = "Procesada";

    /**Control */
    checkCarro?: boolean = false;
    checkGuiaR?: boolean = false;
    tipoDocumentacion?: string = null;

    /**Dependencias */
    persona?: cPersonal = new cPersonal();
    carro?: cCarro = new cCarro();

    /**List */
    listArticulosO?: cArticulosO[];
    listTinasO?: cTinasO[];
    listGaleriaArchivoOrdenes?: cGaleriaArchivosOrdenES[];

    /**Auxiliares */
    isTanqueAgua: boolean = false;
    isTanqueGasolina: boolean = false;
    saleAGUAHER: boolean = false;
    salePETROECUADOR: boolean = false;

    constructor(plantaIn: string, guardiaUserIn: string) {
        var fechaHoy = new cFecha();
        this.planta = plantaIn;
        this.guardiaCargoUser = guardiaUserIn;
        this.fechaRegistro = fechaHoy.actualizarFecha();
    }

    agregarOneArticulo?(dataIn: cArticulosO, tipo?: number) {
        var auxArticulo = new cArticulosO();
        auxArticulo.completarObj(dataIn);
        auxArticulo.ordenESId = undefined;
        if (tipo == 1) {
            auxArticulo.checkRevision = true;
            auxArticulo.observacion = "";
            auxArticulo.cantidad = 0;
            auxArticulo.retorna = false;
            if (auxArticulo.inventarioId != null) {
                auxArticulo.inventario.disBttnInput = 1;
            } else auxArticulo.producto.disBttnInput = 1;
        }
        this.listArticulosO.push(auxArticulo);
    }

    agregarOneTina?(dataIn: cTinasO) {
        var auxTinaO = new cTinasO();
        auxTinaO.completarObj(dataIn);
        this.listTinasO.push(auxTinaO);
    }

    completarObj?(dataIn: cOrdenEs) {
        this.idOrdenES = dataIn.idOrdenES;
        this.tipoOrden = dataIn.tipoOrden;
        this.fechaRegistro = dataIn.fechaRegistro.substr(0, 10);
        this.horaRegistro = dataIn.horaRegistro;
        this.numDocumentacion = dataIn.numDocumentacion;
        this.numGuiaRetorno = dataIn.numGuiaRetorno;
        this.planta = dataIn.planta;
        this.destinoProcedencia = dataIn.destinoProcedencia;
        this.responsableES = dataIn.responsableES;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.personaId = dataIn.personaId;
        this.choferId = dataIn.choferId;
        this.carroId = dataIn.carroId;
        this.estadoProceso = dataIn.estadoProceso;
        this.listArticulosO = [];
        this.persona = null;
        this.carro = null;
    }

    completarAll?(dataIn: cOrdenEs) {
        this.idOrdenES = dataIn.idOrdenES;
        this.tipoOrden = dataIn.tipoOrden;
        this.fechaRegistro = dataIn.fechaRegistro.substr(0, 10);
        this.horaRegistro = dataIn.horaRegistro;
        this.numDocumentacion = dataIn.numDocumentacion;
        this.numGuiaRetorno = dataIn.numGuiaRetorno;
        this.planta = dataIn.planta;
        this.destinoProcedencia = dataIn.destinoProcedencia;
        this.responsableES = dataIn.responsableES;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.personaId = dataIn.personaId;
        this.choferId = dataIn.choferId;
        this.carroId = dataIn.carroId;
        this.estadoProceso = dataIn.estadoProceso;

        if (dataIn.listArticulosO != null) {
            this.listArticulosO = [];
            for (var i = 0; i < dataIn.listArticulosO.length; i++)
                this.agregarOneArticulo(dataIn.listArticulosO[i]);
        }
        if (dataIn.listGaleriaArchivoOrdenes == null) 
        this.listGaleriaArchivoOrdenes = null;
        if (dataIn.listTinasO == null) 
        this.listTinasO = null;
        if (dataIn.persona != null) {
            this.persona.completarPersonal(dataIn.persona);
        }
        if (dataIn.carro != null) {
            this.carro.completarCarro(dataIn.carro);
        } else this.carro = null
    }
}

export class cArticulosO {
    idArticuloO?: number = undefined;
    ordenESId?: number = undefined;
    productoId?: number = undefined;
    inventarioId?: number = undefined;
    observacion?: string = "";
    cantidad: number = 0;
    retorna: boolean = false;
    cantidadPendiente: number = 0;
    responsableVerificador?: string = null;
    estadoProducto: string = "Procesada";
    producto?: cProducto = new cProducto();
    inventario?: cProducto_B = new cProducto_B();
    /**control */
    checkRevision?: boolean = false;//doble funcion uno para cliente lo de guia retorno y el original es para puerto
    checkInventario?: boolean = false;
    spinnerLoading?: boolean = false;
    showSearchSelect?: number = 0;//0 off all,1 show
    preCant?: number = 0;//solo para el editOrden si es q es inventario

    constructor() {
    }

    completarObj?(dataIn: cArticulosO) {
        this.idArticuloO = dataIn.idArticuloO;
        this.ordenESId = dataIn.ordenESId;
        this.productoId = dataIn.productoId;
        this.inventarioId = dataIn.inventarioId;
        this.observacion = dataIn.observacion;
        this.cantidad = dataIn.cantidad;
        this.retorna = dataIn.retorna;
        this.cantidadPendiente = dataIn.cantidadPendiente;
        this.responsableVerificador = dataIn.responsableVerificador;
        this.estadoProducto = dataIn.estadoProducto;

        if (dataIn.productoId != null) {
            this.inventario = null;
            this.productoId = dataIn.productoId;
            if (dataIn.producto != null){
                this.producto= new cProducto();
                this.producto.completarObj(dataIn.producto);
            }
        }
        if (dataIn.inventarioId != null) {
            this.checkInventario = true;
            this.producto = null;
            this.inventarioId = dataIn.inventarioId;
            if (dataIn.inventario != null){
                this.inventario=new cProducto_B();
                this.inventario.rellenarObjeto(dataIn.inventario);
            }
        }
    }
}

export class cTinasO {
    idTinaO?: number = undefined;
    ordenESId?: number = undefined;
    baldeId?: number = undefined;
    tipoTransaccion: string = undefined;//Prestado//Volteado//Devuelto
    ubicacionParcial: string = undefined;//Planta//destino
    contenido: string = "VACIO";//VACIO o LLENO
    estadoTina: string = "Procesada";//Procesada//Pendiente//Revisión//Pendiente Retorno
    balde?: cBalde = new cBalde();

    constructor(tipoDocumentacionIn?: string, contenidoIn?: string) {
        if (tipoDocumentacionIn != null) {
            if (tipoDocumentacionIn == "Entrada") {
                this.tipoTransaccion = "DEVUELTO";
                this.ubicacionParcial = "P MANACRIPEX";

                this.balde.ubicacionActual = "P MANACRIPEX";

                this.balde.estadoBalde = "GUARDADA";
                if (contenidoIn == "LLENO")
                    this.balde.actividad = "CARGADA";
                else this.balde.actividad = "APILADA";
            } else {
                this.contenido = "LLENO";
                this.balde.actividad = "CARGADA";
            }
        }
    }

    completarObj?(dataIn: cTinasO) {
        this.idTinaO = dataIn.idTinaO;
        this.ordenESId = dataIn.ordenESId;
        this.baldeId = dataIn.baldeId;
        this.tipoTransaccion = dataIn.tipoTransaccion;
        this.ubicacionParcial = dataIn.ubicacionParcial;
        this.contenido = dataIn.contenido;
        this.estadoTina = dataIn.estadoTina;

        if (dataIn.balde != null)
            this.balde.completarObj(dataIn.balde);
    }
}

export class cGaleriaArchivosOrdenES {
    idArchivo?: number;
    ordenESId?: number;
    articuloOId?: number;
    nombreArchivo: string;
    tipoArchivo: string;
    rutaArchivo: string;
    estado: number;
    ordenES?: cOrdenEs;
}

export class cNotificacion {
    idNotificacion?: number;
    tipoNotificacion: string;
    descripcion: string;
    ordenESId?: number;
    fechaCreacion: string;
    estadoProceso: string;
    recordatorioHasta?: string;
}

export class cParametroReporteTanques {
    tipoR: string;
    strPeriodoA: string;
    strPeriodoB: string;
    boolPlanta: boolean;
    strDestino: string;

    constructor() {
        var fechaHoy = new cFecha();
        this.tipoR = "SIN ASIGNAR";
        this.boolPlanta = false;
        this.strPeriodoA = fechaHoy.sacaSoloMes();
        this.strPeriodoB = this.strPeriodoA;
        this.strDestino = "SIN ASIGNAR";
    }
}

export class cReporteTanque {
    IdOrden: number;
    TipoOrden: string
    Guia: string
    Origen: string;
    Destino: string;
    Chofer: string;
    Persona: string;
    Fecha: string;
    Cantidad: string;
}