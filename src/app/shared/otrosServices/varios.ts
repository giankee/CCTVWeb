export class cVario {
    idVarios?: number;
    nombre: string;
    tipoVario: string;
    estado: number = 2;
    categoria: string;
    diasPrestamo?: number = 0;
    encargadoBodega?: string = null;
    telefonoEncargado?: string = null;
    prioridadNivel?: number = 0;
}

export class cEnterpriceEmpleados {
    idEmpleado: number;
    cedula: string;
    empleado: string;
    grupo: string;
}

export class cWhatsapp {
    phone?: string;
    phones?: string[];//new
    chatname?: string;
    message?: string;
    media?: string;
    caption?: string;
    type?: string;
    title?: string;
    password?: string;
}

export class cFecha {
    dia: number;
    mes: number;
    anio: number;

    hora: number;
    minutos: number;

    strFecha: string = undefined;
    strHoraA: string = undefined;
    inDesde: string = undefined;
    inHasta: string = undefined;

    arrayMes: Array<{ id: number, nombre: string, maxDias }> = [
        { id: 1, nombre: 'Enero', maxDias: 31 },
        { id: 2, nombre: 'Febrero', maxDias: 28 },
        { id: 3, nombre: 'Marzo', maxDias: 31 },
        { id: 4, nombre: 'Abril', maxDias: 30 },
        { id: 5, nombre: 'Mayo', maxDias: 31 },
        { id: 6, nombre: 'Junio', maxDias: 30 },
        { id: 7, nombre: 'Julio', maxDias: 31 },
        { id: 8, nombre: 'Agosto', maxDias: 31 },
        { id: 9, nombre: 'Septiembre', maxDias: 30 },
        { id: 10, nombre: 'Octubre', maxDias: 31 },
        { id: 11, nombre: 'Noviembre', maxDias: 30 },
        { id: 12, nombre: 'Diciembre', maxDias: 31 }
    ]
    constructor(a?, m?, d?) {
        if (a == null && m == null && d == null) {
            let hoy = new Date();
            this.dia = hoy.getDate();
            this.mes = hoy.getMonth() + 1;
            this.anio = hoy.getFullYear();
            this.hora = hoy.getHours();
            this.minutos = hoy.getMinutes();
            this.fechaActual();
        } else {
            this.dia = d;
            this.mes = m;
            this.anio = a;
            this.strFecha = a + "-" + m + "-" + d;
        }

    }

    fechaActual(): string {
        var strmonth = "";
        var strday = "";
        var strHour = "" + this.hora;
        var strMinute = "" + this.minutos;
        if (this.mes < 10)
            strmonth = "0" + this.mes;
        else
            strmonth = "" + this.mes;
        if (this.dia < 10)
            strday = "0" + this.dia;
        else
            strday = "" + this.dia;
        this.strFecha = this.anio + '-' + strmonth + '-' + strday;
        this.inHasta = this.strFecha;
        if (this.mes == 1)
            this.inDesde = (this.anio - 1) + '-12-' + strday;
        else {
            if (this.mes <= 10)
                strmonth = "0" + (this.mes - 1);
            else strmonth = "" + (this.mes - 1);
            this.inDesde = this.anio + '-' + strmonth + '-' + strday;
        }
        if (this.hora < 10)
            strHour = "0" + this.hora;
        if (this.minutos < 10)
            strMinute = "0" + this.minutos;

        this.strHoraA = strHour + ':' + strMinute;
        return this.strFecha;
    }

    actualizarFecha(): string {
        let hoy = new Date();
        this.dia = hoy.getDate();
        this.mes = hoy.getMonth() + 1;
        this.anio = hoy.getFullYear();
        this.hora = hoy.getHours();
        this.minutos = hoy.getMinutes();
        this.fechaActual();
        return this.strFecha;
    }

    changeByDay(op: string, numDias: number): string {
        var nuevaFecha = "";
        if (op == "+") {
            this.dia = this.dia + numDias;
            if (this.arrayMes.find(x => x.id == (this.mes)).maxDias >= this.dia)
                nuevaFecha = this.anio + "-" + this.mes + "-" + this.dia;
            else {
                do {
                    this.dia = this.dia - this.arrayMes.find(x => x.id == (this.mes)).maxDias;
                    if (this.mes < 12)
                        this.mes++;
                    else {
                        this.mes = 1;
                        this.anio++;
                    }
                } while (this.arrayMes.find(x => x.id == (this.mes)).maxDias < this.dia);
            }
        }
        return this.fechaActual();
    }

    sacaSoloMes(): string {
        var strmonth = "";

        if (this.mes < 10)
            strmonth = "0" + this.mes;
        else
            strmonth = "" + this.mes;

        return this.anio + "-" + strmonth;
    }

    transformarStrMes(mesIn: string): string {
        var strValor = mesIn;
        if (mesIn.includes("-")) {
            let aux = mesIn.split('-');
            strValor = aux[1];
        }
        return this.arrayMes.find(x => x.id == (Number(strValor))).nombre;
    }

    compararFechasDias(strFechaA: string, strFechaB: string) {//regla debe ingresar siempre A fecha menor y b Fecha mas actual
        var separarA = strFechaA.split("-");
        var separarB = strFechaB.split("-");
        var difAnio = 0;
        var difMes = 0;
        var difDia = 0;
        if (Number(separarA[0]) < Number(separarB[0]))
            difAnio = Number(separarB) - Number(separarA);

        if (difAnio != 0)
            difMes= (12-Number(separarA[1]))+Number(separarB[1]);
        else difMes=(Number(separarB[1])-Number(separarA[1]));
        if(difMes!=0){
            if(Number(separarA[2]) < Number(separarB[2]))
                difDia= (difMes*30)+(Number(separarB[2])-Number(separarA[2]));
            else difDia=(difMes*30)+(Number(separarA[2])-Number(separarB[2]));
        }else difDia=Number(separarB[2]) - Number(separarA[2]);
        return difDia;
    }
}

export class cParemetos {
    tipoO: string = "Default";
    tipoPersona: string = "null";
    strPersona: string = "";
    personaCodigo: string = "null";
    tipoProducto: string = "null";
    strProducto: string = "";
    productoCodigo: string = "null";
    strLugar: string = "";
    numGuia: number = undefined;
    spinLoadingG: number = 0;//0 offf, 1 es personal, 2 varios ,3 producto,4 guia
    showSearchSelectG: number = 0;//0 offf, 1 es personal, 2 varios, 3 producto

    constructor() {

    }
    transformarParametro(fDesdeIn: string, fHastaIn: string): string {
        var strparam = this.tipoO + "@" + fDesdeIn + "@" + fHastaIn + "@" + this.tipoPersona + "@" + this.personaCodigo + "@" + this.tipoProducto + "@" + this.productoCodigo + "@"
        if (this.strLugar != "")
            strparam = strparam + this.strLugar;
        else strparam = strparam + "null"
        return strparam;
    }
}

export class cParemetosOrdenInterna {
    tipoO: string = "Trabajo Interno";
    strPersona: string = "";
    strBodegaOrigen: string = "GENERAL";
    strArea: string = "null";
    strProducto: string = "";
    productoCodigo: string = "null";
    spinLoadingG: number = 0;//0 offf, 1 inventario
    showSearchSelectG: number = 0;//0 offf, 1 inventario

    /**solo para consultas */
    disableCheck: boolean = false;
    marea: number = 1;
    anio: string = "";
    constructor() {

    }
    transformarParametro(fDesdeIn: string, fHastaIn: string): string {
        var strparam = "P MANACRIPEX@" + this.tipoO + "@" + fDesdeIn + "@" + fHastaIn + "@" + this.strBodegaOrigen + "@" + this.strArea + "@" + this.productoCodigo + "@";
        if (this.strPersona != "")
            strparam = strparam + this.strPersona;
        else strparam = strparam + "null";
        return strparam;
    }
    transformarParametroConsulta(fDesdeIn: string, fHastaIn: string): string {
        var strparam = fDesdeIn + "@" + fHastaIn + "@";
        if (this.strPersona != "")
            strparam = strparam + this.strPersona;
        else strparam = strparam + "null";
        strparam = strparam + "@" + this.productoCodigo + "@" + this.strBodegaOrigen + "@";
        if (this.disableCheck)
            strparam = strparam + this.marea + "-" + this.anio;
        else strparam = strparam + "null";
        return strparam;
    }
}

export class cEnterpriceProveedor {
    idproveedor: number = undefined;
    fuente: string = "CCTV";
    cedrucpas: string = undefined;
    proveedor: string = undefined;

    constructor() { }

    completarObj(datoIn: cEnterpriceProveedor) {
        this.idproveedor = datoIn.idproveedor;
        this.fuente = datoIn.fuente;
        this.cedrucpas = datoIn.cedrucpas;
        this.proveedor = datoIn.proveedor;
    }
}

export class cEnterpriceDocumento {
    idDocumento: number;
    claveacceso: string;
    rS_Proveedor: string;
    crp_Proveedor: string;
    tP_Documento: string;
    documento: string;
    emi_Fecha: string;
    rS_Cliente: string;
    crp_Cliente: string = "";
    nro_contespecial: string = "";

    listCompraO: cEnterpriceArticulosDocumento[];

    constructor() {

    }

    completar(dataIn: cEnterpriceDocumento) {
        this.idDocumento = dataIn.idDocumento;
        this.claveacceso = dataIn.claveacceso;
        this.rS_Proveedor = dataIn.rS_Proveedor;
        this.crp_Proveedor = dataIn.crp_Proveedor;
        this.tP_Documento = dataIn.tP_Documento;
        this.documento = dataIn.documento;
        this.emi_Fecha = dataIn.emi_Fecha.substr(0, 10);
        this.rS_Cliente = dataIn.rS_Cliente;
        this.crp_Cliente = dataIn.crp_Cliente;
        this.nro_contespecial = dataIn.nro_contespecial;
    }
}

export class cEnterpriceArticulosDocumento {
    idregistro: number;
    iddocumento: number;
    codigoprincipal: string;
    codigoauxiliar: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    descuento: number;
    subtotal: number;
    documento?: cEnterpriceDocumento;
}

export class cVistaSalida {
    Fuente: string;
    id: number;
    cat: string;
    nombreLugar: string;
    subCat: string;
}

export class cParmtoReporte {
    planta: string = "P Manacripex";
    tipoR: string = "null";
    strProveedor: string = "--Sin Asignar--";
    tipoPeriodo: string = "null";
    strProducto: string = "";
    productoId: string = "null";
    strRazonSocial: string = "null";


    spinLoadingG: number = 0;//0 offf, 1 proveedor, 2 producto
    showSearchSelectG: number = 0;//0 offf, 1 proveedor, 2  producto

    constructor(plantaIn: string) {
        this.planta = plantaIn;

    }

    resetObj() {
        this.strProveedor = "--Sin Asignar--";
        this.tipoPeriodo = "null";
        this.strProducto = "";
        this.productoId = "null";
        this.strRazonSocial = "null";
    }

    transformarParametroCasesAB(): string {
        var params = this.planta + "@" + this.tipoR + "@";
        if (this.strProveedor == "" || this.strProveedor == "--Sin Asignar--")
            params = params + 'null';
        else params = params + this.strProveedor;
        return params;
    }

    transformarParametroCasesCD(fDesdeIn: string): string {
        var params = this.planta + "@" + this.tipoR + "@" + this.tipoPeriodo + "@" + fDesdeIn + "@";

        if (this.tipoR == "CaseC") {
            if (this.strProveedor != "--Sin Asignar--") {
                params = params + "null@" + this.strProveedor + "@" + this.productoId;
            }
        } else {
            if (this.strRazonSocial != "null") {
                params = params + this.strRazonSocial + "@";
                if (this.strProveedor != "--Sin Asignar--")
                    params = params + this.strProveedor;
                else params = params + "null";
            }
        }
        return params;
    }
}

export class cFiltroTablaProducto {
    filtroProducto: string = '';
    checkCategoria: boolean = false;
    checkMarca: boolean = false;
    checkPrecio: boolean = false;
    checkBodega: boolean = false;
    checkExistencia: boolean = false;
    chechPerchaFila: boolean = false;
    CheckCasillero: boolean = false;
    CheckPalet: boolean = false;
    constructor() { }
}

export class cFiltroTablaCompra {
    filtroCompra: string = '';
    checkGuiaRemision: boolean = false;
    checkFechaAutorizacion: boolean = false;
    checkRazonSocialCliente: boolean = false;
    checkSubLibre: boolean = false;
    checkTotalImpuesto: boolean = false;
    constructor() { }
}

export class cEnterpricePersonal {
    idEmpleado: number;
    empleado: string;
    cedula: string;
    departamento: string;
    funcion: string;
    barco: string;
}