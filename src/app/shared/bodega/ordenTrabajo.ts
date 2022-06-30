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

export class cAccidenteMedic {
    idAccidenteMedic: number = undefined;
    paciente: string = "";
    fechaRegistro: string;
    horaInicio: string;
    horaFin: string;
    totalHoras: number = 1;
    descripcion: string = "";
    jefeInmediato: string = "";
    lugarAccidente: string = "";
    causaAccidente: string = "";
    laborRealizaba: string = "";

    listTestigosAccidente: cTestigosMedic[] = [];
    listGaleriaAccidente: cGaleriaAccidente[] = [];

    /*extras*/
    showSearchSelect: boolean = false;
    spinnerLoading: boolean = false;

    constructor() {
        let fechaHoy: cFecha = new cFecha();
        this.idAccidenteMedic = undefined;
        this.paciente = "";
        this.fechaRegistro = fechaHoy.strFecha;
        this.horaInicio = fechaHoy.strHoraA;
        this.horaFin = "";
        this.totalHoras = 1;
        this.descripcion = "";
        this.jefeInmediato = "";
        this.lugarAccidente = "";
        this.causaAccidente = "";
        this.laborRealizaba = "";
        this.listTestigosAccidente = [];
        this.listGaleriaAccidente = [];

        this.showSearchSelect = false;
        this.spinnerLoading = false;

        this.changeHours(0);
    }

    agregarOneTestigo(dataIn?: cTestigosMedic) {
        var auxTestigo = new cTestigosMedic();
        if (dataIn != null) {
            auxTestigo.completarObject(dataIn);
        }
        this.listTestigosAccidente.push(auxTestigo);
    }

    agregarOneGaleria(dataIn?: cGaleriaAccidente) {
        var auxGaleria = new cGaleriaAccidente();
        if (dataIn != null) {
            auxGaleria.completarObject(dataIn);
        }
        this.listGaleriaAccidente.push(auxGaleria);
    }

    changeHours(strInicio: number) {
        let fechaHoy: cFecha = new cFecha();
        var auxSepararInicio = this.horaInicio.split(':');
        var newHoraFin: number;
        if (strInicio == 0) {
            newHoraFin = Number(auxSepararInicio[0]) + 1;
            if (newHoraFin < 10)
                this.horaFin = "0" + newHoraFin + ":" + auxSepararInicio[1];
            else this.horaFin = newHoraFin + ":" + auxSepararInicio[1];
            this.horaFin = this.fechaRegistro + "T" + this.horaFin;
        } else {
            var auxDiferencia = this.totalHoras;
            var diasDif = 0;
            while (auxDiferencia > 23) {
                diasDif++;
                auxDiferencia = auxDiferencia - 24;
            }
            if (strInicio == 3) {
                var auxSepararFechaInicio = this.fechaRegistro.split("-");
                this.horaFin=auxSepararFechaInicio[0]+"-";
                var soloHora = "";
                newHoraFin = Number(auxSepararInicio[0]) + auxDiferencia;
                if (newHoraFin >= 24) {
                    diasDif++;
                    newHoraFin = newHoraFin - 24;
                }
                if (newHoraFin < 10)
                    soloHora = "T0" + newHoraFin + ":" + auxSepararInicio[1];
                else soloHora = "T" + newHoraFin + ":" + auxSepararInicio[1];

                var auxContador = Number(auxSepararFechaInicio[1]) - 1;
                var auxNewDia: any = Number(auxSepararFechaInicio[2]) + diasDif;
                if (diasDif > 0) {
                    while (Number(auxNewDia) > Number(fechaHoy.arrayMes[auxContador].maxDias)) {
                        auxNewDia = Number(auxNewDia) - Number(fechaHoy.arrayMes[auxContador].maxDias);
                        auxContador++;
                        if (auxContador == 12){
                            auxContador = 0;
                            this.horaFin= (Number(auxSepararFechaInicio[0])+1)+"-";
                        }
                    }
                    if(fechaHoy.arrayMes[auxContador].id<10)
                        this.horaFin = this.horaFin + "0"+fechaHoy.arrayMes[auxContador].id+"-";
                    else this.horaFin = this.horaFin +fechaHoy.arrayMes[auxContador].id+ "-";
                    if (Number(auxNewDia) < 10)
                        this.horaFin= this.horaFin + "0"+auxNewDia + soloHora;
                    else this.horaFin=this.horaFin + auxNewDia +soloHora;
                } else this.horaFin = this.fechaRegistro + soloHora;
            }
            if (strInicio == 2) {
                var auxSepararFechaFin = this.horaFin.split("T");
                var soloHoraFin = auxSepararFechaFin[1].split(':');
                var auxDias = fechaHoy.compararFechasDias(this.fechaRegistro, auxSepararFechaFin[0]);
                var horasDif = (Number(soloHoraFin[0]) - Number(auxSepararInicio[0]));
                if (horasDif < 0) {
                    this.totalHoras = ((auxDias - 1) * 24) + (24 + horasDif);
                } else this.totalHoras = (auxDias * 24) + horasDif;
            }
        }
    }
}

export class cTestigosMedic {
    idTestigo: number;
    accidenteId: number;
    nombreTestigo: string;
    relato: string;

    ocultarObj:boolean;

    constructor() {
        this.idTestigo = undefined;
        this.accidenteId = undefined;
        this.nombreTestigo = "";
        this.relato = "";
        this.ocultarObj=true;
    }

    completarObject(dataIn: cTestigosMedic) {
        this.idTestigo = dataIn.idTestigo;
        this.accidenteId = dataIn.accidenteId;
        this.nombreTestigo = dataIn.nombreTestigo;
        this.relato = dataIn.relato;
    }
}

export class cGaleriaAccidente {
    idArchivo: number = undefined;
    accidenteId: number = undefined;
    nombreArchivo: string = "";
    tipoArchivo: string = "Image";
    rutaArchivo: string = "";

    constructor() {
        this.idArchivo = undefined;
        this.accidenteId = undefined;
        this.nombreArchivo = "";
        this.tipoArchivo = "Image";
        this.rutaArchivo = "";
    }

    completarObject?(dataIn: cGaleriaAccidente) {
        this.idArchivo = dataIn.idArchivo;
        this.accidenteId = dataIn.accidenteId;
        this.nombreArchivo = dataIn.nombreArchivo;
        this.tipoArchivo = dataIn.tipoArchivo;
        this.rutaArchivo = dataIn.rutaArchivo;
    }
}
