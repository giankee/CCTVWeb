export class cOrdenEC {
    idOrdenE_C: number = undefined;
    idCompraAutomatica: number = 0;
    idDevolucionGuia: number = 0;
    planta: string = "";
    fechaRegistroBodega: string = "";
    factura: number = undefined;
    guiaRemision: number = undefined;
    proveedor: string = null;
    guardiaCargoUser: string = "";
    estadoProceso: string = "Procesada";
    listPcomprasO?: cCompraO[] = [];

    /**Sum */
    subTotalLibre: number = 0;
    totalImpuestos: number = 0;
    totalOrden: number = 0;

    /*Controles*/
    spinnerLoadingP?: boolean = false;
    showSearchSelect?: boolean = false;
    razonSocialCompra?:string="";
    fechaAutorizacion?:string="";

    /**Auxiliares vizuales */
    auxTarifa12: number = 0;
    auxTarifa0: number = 0;
    listPtemporales?: cCompraO[] = [];

    constructor(planta?: string, guardia?: string) {
        if (planta != null && guardia != null) {
            this.planta = planta;
            this.guardiaCargoUser = guardia;
            this.fechaRegistroBodega = this.setFechaActual();
        }
    }
    setFechaActual() {
        let hoy = new Date();
        let dia = hoy.getDate();
        let anio = hoy.getFullYear();
        let mes = hoy.getMonth() + 1;
        var strmonth = "";
        var strday = "";
        if (mes < 10)
            strmonth = "0" + mes;
        else
            strmonth = "" + mes;
        if (dia < 10)
            strday = "0" + dia;
        else
            strday = "" + dia;
        return anio + '-' + strmonth + '-' + strday;
    }
    sumTotalLibre() {
        this.totalOrden = 0;
        this.subTotalLibre = 0;
        this.totalImpuestos = 0;
        if (this.listPcomprasO.length > 0) {
            this.listPcomprasO.forEach(x => {
                if (x.marcar) {
                    this.subTotalLibre = this.subTotalLibre + x.totalInd;
                    if (x.cargaIva)
                        this.totalImpuestos = this.totalImpuestos + (x.totalInd * 0.12);
                }

            });
            this.totalImpuestos = Number(this.totalImpuestos.toFixed(4));
            this.totalOrden = Number((this.subTotalLibre + this.totalImpuestos).toFixed(4));
            this.subTotalLibre = Number(this.subTotalLibre.toFixed(4));
        }
    }

    completar(dataIn: cOrdenEC) {
        this.idOrdenE_C = dataIn.idOrdenE_C;
        this.idCompraAutomatica = dataIn.idCompraAutomatica;
        this.idDevolucionGuia = dataIn.idDevolucionGuia;
        this.planta = dataIn.planta;
        this.fechaRegistroBodega = dataIn.fechaRegistroBodega;
        this.factura = dataIn.factura;
        this.guiaRemision = dataIn.guiaRemision;
        this.proveedor = dataIn.proveedor;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.estadoProceso = dataIn.estadoProceso;

        this.subTotalLibre = dataIn.subTotalLibre;
        this.totalImpuestos = dataIn.totalImpuestos;
        this.totalOrden = dataIn.totalOrden;

        if (dataIn.listPcomprasO.length > 0) {
            this.listPcomprasO = dataIn.listPcomprasO;
            this.calcularTarificas();
        }

    }

    completarTemporal(dataIn: cOrdenEC) {
        this.idOrdenE_C = dataIn.idOrdenE_C;
        this.idCompraAutomatica = undefined;
        this.idDevolucionGuia = undefined;
        this.planta = dataIn.planta;
        this.fechaRegistroBodega = dataIn.fechaRegistroBodega;
        this.guiaRemision = dataIn.guiaRemision;
        this.proveedor = dataIn.proveedor;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;
        this.estadoProceso = dataIn.estadoProceso;

        this.subTotalLibre = 0;
        this.totalImpuestos = 0;
        this.totalOrden = 0;

        if (dataIn.listPcomprasO.length > 0)
            this.listPtemporales = dataIn.listPcomprasO;

    }

    calcularTarificas() {
        this.listPcomprasO.forEach(x => {
            if (x.cargaIva)
                this.auxTarifa12 = this.auxTarifa12 + x.totalInd;
            else this.auxTarifa0 = this.auxTarifa0 + x.totalInd;
        });
        this.auxTarifa12 = Number(this.auxTarifa12.toFixed(2));
    }

    agregarOneDevolucion(dataIn: cCompraO, cantidadIn?: number) {
        var auxDevolucion = new cCompraO();
        auxDevolucion.marcar = true;
        auxDevolucion.productoId = dataIn.productoId;
        auxDevolucion.precio = dataIn.precio;
        auxDevolucion.descuento = dataIn.descuento;
        auxDevolucion.destinoBodega = dataIn.destinoBodega;
        auxDevolucion.cargaIva = dataIn.cargaIva;
        auxDevolucion.disBttnInput = dataIn.cantidad;
        auxDevolucion.cantidad = dataIn.cantidad;
        if (cantidadIn != null)
            auxDevolucion.cantidad = cantidadIn;
        auxDevolucion.rellenarProducto(dataIn.producto,1);
        auxDevolucion.calcularPrecio();
        auxDevolucion.producto.listBodegaProducto=auxDevolucion.producto.listBodegaProducto.filter(x=>x.nombreBodega==auxDevolucion.destinoBodega);
        this.listPcomprasO.push(auxDevolucion);
    }
}

export class cCompraO {
    idRegistro?: number = undefined;
    ordenE_CId?: number = undefined;
    productoId?: number = undefined;
    cantidad: number = 0;
    precio: number = 0;
    descuento: number = 0;
    totalInd: number = 0;
    destinoBodega: string = "SIN ASIGNAR";
    cargaIva: boolean = true;
    estadoCompra: string = "Procesada";

    /**Controladores Individuales*/
    marcar?: boolean = true;
    descripcionProducto?: string = "";
    disBttnInput?: number = 0;//0 on all, 1 code, 2 nombre
    spinnerLoading?: boolean = false;
    showSearchSelect?: number = 0;//0 off all, 1 code, 2 nombre
    disableSelectBodega?: boolean = false;

    refenciaTemporalId?: number = 0;

    /*Otras clases*/
    ordenE_C?: cOrdenEC;
    producto?: cProducto_B;

    constructor() { }

    rellenarProducto(productoIn: cProducto_B, auto?: number) {
        this.producto = new cProducto_B();
        this.producto.rellenarObjeto(productoIn);
        if (auto == 1) {
            this.producto.precioUltima = this.producto.precioStandar;
            this.producto.precioStandar = this.precio;
        }
        this.precio = this.producto.precioStandar;
    }

    calcularPrecio() {
        if (this.producto != null) {
            if (this.producto.precioStandar != 0)
                this.precio = this.producto.precioStandar;
            if (this.precio != 0)
                this.producto.precioStandar = this.precio;
        }
        this.totalInd = (this.cantidad * this.precio) - this.descuento;
    }
}

export class cProducto_B {
    idProductoStock?: number = undefined;
    planta?: string = "OFICINAS";
    codigo?: string = undefined;
    nombre?: string = "";
    categoria?: string = "SIN ASIGNAR";
    marca?: string = "SIN ASIGNAR";
    proveedor?: string = "SIN ASIGNAR";
    precioStandar?: number = 0.00;
    precioUltima?: number = 0.00;
    tipoUnidad?: string = "UNIDAD";
    rutaArchivo?: string = "/assets/img/imgDefecto.png";
    estado?: number = 1;

    /**Arreglos */
    listBodegaProducto?: cBodegaProducto[] = [];
    /**COntrol de cliente */
    SelectBodega?: string = "SIN ASIGNAR";
    preBodega?: string = "SIN ASIGNAR";//para editar una orden almacenar la bodega anterior
    disBttnInput?: number = 0;
    //cheack?:boolean;

    constructor(plantaIn?: string, proveedorIn?: string) {
        if (plantaIn != null)
            this.planta = plantaIn;
        if (proveedorIn != null)
            this.proveedor = proveedorIn;
    }

    /*Metodos*/
    rellenarObjeto(objIn: cProducto_B) {
        if (objIn.idProductoStock != undefined)
            this.idProductoStock = objIn.idProductoStock;
        this.codigo = objIn.codigo;
        this.planta = objIn.planta;
        this.nombre = objIn.nombre;
        this.categoria = objIn.categoria;
        this.proveedor = objIn.proveedor;
        this.marca = objIn.marca;
        this.precioStandar = objIn.precioStandar;
        this.precioUltima = objIn.precioUltima;
        this.rutaArchivo = objIn.rutaArchivo;
        this.tipoUnidad = objIn.tipoUnidad;
        this.estado = objIn.estado;

        if (objIn.listBodegaProducto != null) {
            this.listBodegaProducto = [];
            if (objIn.listBodegaProducto.length > 0) {
                objIn.listBodegaProducto.forEach(x => {
                    this.agregarOneBodega(x);
                });
                this.SelectBodega = objIn.listBodegaProducto[0].nombreBodega;
            }
        }
    }
    resetProducto() {
        this.idProductoStock = undefined;
        this.categoria = "SIN ASIGNAR";
        this.marca = "SIN ASIGNAR";
        this.precioUltima = 0;
        this.tipoUnidad = "UNIDAD";
        this.estado = 1;
        this.rutaArchivo = "/assets/img/imgDefecto.png";
        this.nombre = "";
        this.proveedor = "SIN ASIGNAR";
        this.disBttnInput = 0;
        this.SelectBodega = "SIN ASIGNAR";
    }
    agregarOneBodega(dataIn?: cBodegaProducto, bodegaIn?: string) {
        var auxBodega = new cBodegaProducto(this.planta, bodegaIn);
        if (dataIn != null) {
            auxBodega.completarObject(dataIn);
        }
        this.listBodegaProducto.push(auxBodega);
    }
}

export class cBodegaProducto {
    idBodegaProducto?: number = undefined;
    planta?: string = "";
    nombreBodega?: string = "";
    inventarioId?: number = undefined;
    cantInicial?: number = 0;
    disponibilidad?: number = 0;
    percha?: number = 0;
    fila?: number = 0;
    numCasillero?: number = 0;
    numPalet?: number = 0;
    estado?: number = 1;

    /**Variables de control */
    ocultarObj?: boolean = true;

    constructor(plantaIn?: string, bodegaIn?: string) {
        if (plantaIn != null)
            this.planta = plantaIn;
        if (bodegaIn != null)
            this.nombreBodega = bodegaIn;
    }

    /*Metodos*/
    completarObject(objIn: cBodegaProducto) {
        if (objIn.idBodegaProducto != undefined)
            this.idBodegaProducto = objIn.idBodegaProducto;
        this.planta = objIn.planta;
        this.nombreBodega = objIn.nombreBodega;
        this.inventarioId = objIn.inventarioId;
        this.cantInicial = objIn.cantInicial;
        this.disponibilidad = objIn.disponibilidad;
        this.percha = objIn.percha;
        this.fila = objIn.fila;
        this.numCasillero = objIn.numCasillero;
        this.numPalet = objIn.numPalet;
        this.estado = objIn.estado;
    }
    resetBodega() {
        this.idBodegaProducto = undefined;
        this.planta = "";
        this.nombreBodega = "";
        this.inventarioId = undefined;
        this.cantInicial = 0;
        this.disponibilidad = 0;
        this.percha = 0;
        this.fila = 0;
        this.numCasillero = 0;
        this.numPalet = 0;
        this.estado = 1;
    }
}

export class cSaldosKardex {
    cantidad: number = 0;
    precioU: number = 0;
    precioTotal: number = 0;

    constructor(cantidadIn?: number, precioUIn?: number) {
        if (cantidadIn != null && precioUIn != null)
            this.calcuarSaldo(cantidadIn,precioUIn);
    }

    calcuarSaldo(cantidadIn: number, precioUIn: number) {
        this.cantidad = cantidadIn;
        this.precioU = precioUIn;
        this.precioTotal = Number((this.cantidad * this.precioU).toFixed(2));
    }

    sacarPrecioUProm(cantidadIn: number, precioTotalIn: number) {//aun nc donde
        this.cantidad = cantidadIn;
        this.precioTotal = precioTotalIn;
        this.precioU = Number((precioTotalIn / cantidadIn).toFixed(2));
    }
}

export class cItemKardex {
    fecha: string = "";
    guia: string = "---";
    factura: string = "---";
    tipoItem: string = ""; //Compra, Salida,Entrada, Devolucion, oredentrabajo
    lugarTransaccion = "";
    relacionGuiaId: number = undefined;
    relacionFacturaId: number = undefined;
    datoEntrada: cSaldosKardex;
    datoSalida: cSaldosKardex;
    datoSaldo: cSaldosKardex;

    constructor() { }

    completarObj(dataIn) {
        this.fecha = dataIn.fecha.substr(0, 10);
        if (dataIn.guia != 0)
            this.guia = "" + dataIn.guia;
        if (dataIn.factura != 0)
            this.factura = "" + dataIn.factura;
        this.tipoItem = dataIn.tipoItem;
        this.lugarTransaccion = dataIn.lugarTransaccion;
        this.relacionGuiaId = dataIn.relacionGuiaId;
        this.relacionFacturaId = dataIn.relacionFacturaId;
        if (this.tipoItem == "Compra"||this.tipoItem=="Entrada") {
            this.datoSalida = new cSaldosKardex();
            this.datoEntrada = new cSaldosKardex(dataIn.cantidad, dataIn.precio);
        } else {
            this.datoEntrada = new cSaldosKardex();
            this.datoSalida = new cSaldosKardex(dataIn.cantidad, dataIn.precio);
        }
        this.datoSaldo = new cSaldosKardex();
    }
}

export class cKardex {
    tipoVista: string = "Mes"// Mes, Trimestral, Semestral
    fechaBusqueda: string = "";
    totalSumE: number = 0;
    totalSumS: number = 0;
    precioSumE: number = 0;
    precioSumS: number = 0;
    totalBalance: number = 0;
    datoInicial: cSaldosKardex;
    BodegaSelect:string="all";
    cantidadDisponible:number=0;
    cantidadInicial:number=0;
    listItems: cItemKardex[] = [];

    constructor(fechaInicial?: string) {
        if (fechaInicial != null)
            this.fechaBusqueda = fechaInicial;
    }

    completarKardex(cantidadInicialIn: number, precioInicialIn: number, listIn: cItemKardex[]) {
        this.datoInicial = new cSaldosKardex(cantidadInicialIn, precioInicialIn);
        this.totalSumE = this.datoInicial.cantidad;
        this.totalSumS = 0;
        this.totalBalance = this.datoInicial.precioTotal;
        this.listItems = [];

        if (listIn.length > 0) {
            var auxCant: number = this.datoInicial.cantidad;
            var auxUltimoP: number = this.datoInicial.precioU;
            for (var i = 0; i < listIn.length; i++) {
                var nuevoItem: cItemKardex = new cItemKardex();
                nuevoItem.completarObj(listIn[i]);
                if (nuevoItem.tipoItem != "Entrada" && nuevoItem.tipoItem!="Compra")
                    nuevoItem.datoSalida.calcuarSaldo(nuevoItem.datoSalida.cantidad, auxUltimoP);
                this.totalSumS = this.totalSumS + nuevoItem.datoSalida.cantidad;
                this.totalSumE = this.totalSumE + nuevoItem.datoEntrada.cantidad;
                this.precioSumS = Number((this.precioSumS + nuevoItem.datoSalida.precioTotal).toFixed(2));
                this.precioSumE = Number((this.precioSumE + nuevoItem.datoEntrada.precioTotal).toFixed(2));
                auxCant = auxCant + nuevoItem.datoEntrada.cantidad - nuevoItem.datoSalida.cantidad;
                this.totalBalance = Number((this.totalBalance + nuevoItem.datoEntrada.precioTotal - nuevoItem.datoSalida.precioTotal).toFixed(2));
                nuevoItem.datoSaldo.sacarPrecioUProm(auxCant, this.totalBalance);
                auxUltimoP = nuevoItem.datoSaldo.precioU;
                this.listItems.push(nuevoItem);
            }
        }
    }
}