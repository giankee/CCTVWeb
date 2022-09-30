import { cFecha } from "./otrosServices/varios";

export class cCarro {
    idCarro?: number = undefined;
    numMatricula: string = "";
    colorCarro: string = undefined;
    marca: string = undefined;
    propietario: string = undefined;
    estado: number = 2;

    constructor() {
        this.idCarro = undefined;
        this.numMatricula = "";
        this.colorCarro = "Desconocido";
        this.marca = "Desconocido";
        this.propietario = undefined;
        this.estado = 1;
    }

    completarCarro(objCarroIn: cCarro) {
        this.idCarro = objCarroIn.idCarro;
        this.numMatricula = objCarroIn.numMatricula;
        this.colorCarro = objCarroIn.colorCarro;
        this.marca = objCarroIn.marca;
        this.propietario = objCarroIn.propietario;
        this.estado = objCarroIn.estado;
    }
}

export class cPersonal {
    idPersona?: number = undefined;
    cedula: string = "";
    nombreP: string = "";
    tipoPersona: string = "Desconocido";
    empresa: string = "Desconocido";
    estado: number = 2;

    constructor() {
        this.idPersona = undefined;
        this.cedula = undefined;
        this.nombreP = undefined;
        this.tipoPersona = "Desconocido";
        this.empresa = "Desconocido";
        this.estado = 2;
    }

    resetChofer(cedulaIn, nombreIn) {
        this.idPersona = undefined;
        this.cedula = cedulaIn;
        this.nombreP = nombreIn;
        this.tipoPersona = "Chofer";
        this.empresa = "Manacripex";
        this.estado = 2;
    }

    completarPersonal(objPersonaIn: cPersonal) {
        this.idPersona = objPersonaIn.idPersona;
        this.cedula = objPersonaIn.cedula;
        this.nombreP = objPersonaIn.nombreP;
        this.tipoPersona = objPersonaIn.tipoPersona;
        this.empresa = objPersonaIn.empresa;
        this.estado = objPersonaIn.estado;
    }
}

export class cProducto {
    idProducto?: number = undefined;
    nombre: string = "";
    categoria: string = "Pendiente";
    estado: number = 1;

    /**COntrol de cliente */
    disBttnInput?: number = 0;
    fuente?: string = undefined;
    constructor() {

    }

    completarObj?(dataIn: cProducto) {
        this.idProducto = dataIn.idProducto;
        this.nombre = dataIn.nombre;
        this.categoria = dataIn.categoria;
        this.estado = dataIn.estado;
    }

    resetObj?() {
        this.idProducto = undefined;
        this.nombre = "";
        this.categoria = "Pendiente";
        this.estado = 1;

        this.disBttnInput = 0;
    }
}

export class cBalde {
    idBalde?: number = undefined;
    numBalde: number = undefined;
    propietario: string = "MANACRIPEX";
    ubicacionActual: string = "";
    actividad: string = "Sin Asignar";//Apilada y Cargada
    estadoBalde: string = "Sin Asignar";//entrada=Guardado, si es salida Prestado, si es salida Volteada= Volteado , si es un error Incongruente
    fechaPDevolucion: string = null;
    estado: number = 2;


    /**Otros control */
    colorFecha: string = "normal";
    constructor() {

    }

    completarObj?(dataIn: cBalde) {
        this.idBalde = dataIn.idBalde;
        this.numBalde = dataIn.numBalde;
        this.propietario = dataIn.propietario;
        this.ubicacionActual = dataIn.ubicacionActual;
        this.actividad = dataIn.actividad;
        this.estadoBalde = dataIn.estadoBalde;
        this.fechaPDevolucion = dataIn.fechaPDevolucion;
        this.estado = dataIn.estado;

        if (this.estadoBalde == "Prestado" && this.fechaPDevolucion != null)
            this.revisarPlazo();
    }

    resetObj?() {
        this.idBalde = undefined;
        this.numBalde = undefined;
        this.propietario = "MANACRIPEX";
        this.ubicacionActual = "";
        this.actividad = "Sin Asignar";
        this.estadoBalde = "Sin Asignar";
        this.fechaPDevolucion = null;
        this.estado = 2;

        this.colorFecha = "normal";
    }

    revisarPlazo?() {
        var fechaHoy = new cFecha();
        var auxFecha = this.fechaPDevolucion.split("-");
        this.colorFecha = "normal";
        if (Number(auxFecha[0]) < fechaHoy.anio)
            this.colorFecha = "rojo";
        else
            if (Number(auxFecha[1]) < fechaHoy.mes)
                this.colorFecha = "rojo";
            else {
                if (Number(auxFecha[1]) == fechaHoy.mes) {
                    if (Number(auxFecha[2]) < fechaHoy.dia)
                        this.colorFecha = "rojo";
                    else this.colorFecha = "amarillo"
                } else {
                    if ((Number(auxFecha[1]) - fechaHoy.mes) == 1) {
                        this.colorFecha = "amarillo";
                    }
                }
            }
    }

    setFechaDevolucion?(diasPrestamo:number){
        var fechaHoy = new cFecha();
        this.fechaPDevolucion= fechaHoy.changeByDay("+",diasPrestamo);
    }
}