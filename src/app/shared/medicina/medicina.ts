import { cEnterpricePersonal, cFecha } from "../otrosServices/varios";

export class cPacienteMedic {
    idPacienteMedic: number;
    empleadoId:number;
    embarazo: boolean;
    minusvalido: boolean;
    tipoMinusvalido: string;
    porcentajeMinusvalido: number;
    ecnt: boolean;
    tipoECNT: string;

    ultimoPeso: number;
    ultimaAltura: number;
    tipoSangre: string;

    antPersonales: string;
    antFamiliares: string;
    alergiaMedicamento: string;
    habitos: string;
    historiaLaboral: string;
    examenInicio: string;
    tareasAntTrabajo: string;
    medidasPrevencion: string;

    /*Listas*/
    listAccidentes: cAccidenteMedic[];
    listPermisos: cPermisoMedic[];

    /*Control*/
    cedula: string;
    empleado: string;
    idEmpresa:number;

    constructor() {
        this.idPacienteMedic = undefined;
        this.empleadoId=undefined;
        this.embarazo = false;
        this.minusvalido = false;
        this.tipoMinusvalido = "SIN ASIGNAR";
        this.ecnt = false;
        this.tipoECNT = "SIN ASIGNAR";
        this.porcentajeMinusvalido = 0;
        this.ultimoPeso = 0;
        this.ultimaAltura = 0;
        this.tipoSangre = "SIN ASIGNAR";

        this.antPersonales = "";
        this.antFamiliares = "";
        this.alergiaMedicamento = "";
        this.habitos = "";
        this.historiaLaboral = "";
        this.examenInicio = "";
        this.tareasAntTrabajo = "";
        this.medidasPrevencion = "";

        this.cedula = "";
        this.empleado = "";
        this.idEmpresa=undefined;
    }

    completarObject(dataIn: cPacienteMedic) {
        this.idPacienteMedic = dataIn.idPacienteMedic;
        this.empleadoId=dataIn.empleadoId;
        this.embarazo = dataIn.embarazo;
        this.minusvalido = dataIn.minusvalido;
        this.tipoMinusvalido = dataIn.tipoMinusvalido;
        this.porcentajeMinusvalido = dataIn.porcentajeMinusvalido;
        this.ecnt = dataIn.ecnt;
        this.tipoECNT = dataIn.tipoECNT;
        this.ultimoPeso = dataIn.ultimoPeso;
        this.ultimaAltura = dataIn.ultimaAltura;
        this.tipoSangre = dataIn.tipoSangre;
        this.antPersonales = dataIn.antPersonales;
        this.antFamiliares = dataIn.antFamiliares;
        this.alergiaMedicamento = dataIn.alergiaMedicamento;
        this.habitos = dataIn.habitos;
        this.historiaLaboral = dataIn.historiaLaboral;
        this.examenInicio = dataIn.examenInicio;
        this.tareasAntTrabajo = dataIn.tareasAntTrabajo;
        this.medidasPrevencion = dataIn.medidasPrevencion;

        if(dataIn.cedula!=null && dataIn.empleado!=null && dataIn.idEmpresa!=0)
        this.cedula=dataIn.cedula;
        this.empleado=dataIn.empleado;
        this.idEmpresa=dataIn.idEmpresa;
    }
}

export class cPacienteInfoCompleta {
    datosEnterprice: cEnterpricePersonal = null;
    datosPaciente: cPacienteMedic = null;

    constructor() {
        this.datosEnterprice = new cEnterpricePersonal();
        this.datosPaciente = new cPacienteMedic();
    }
}

export class cPermisoMedic {
    idPermisoMedic: number;
    pacienteMedicId: number;
    tipoPermiso: string;
    enfermedadCIE10: string;
    fechaSalida: string;
    fechaRegreso: string;
    totalDias: number;
    totalHoras: number;
    observacion: string;
    regresaConsulta:boolean;
    guardiaCargoUser: string;

    /**Variables de control */
    spinnerLoading: number; //0 offall // 1 en paciente //2 en enfermedad //3 completo paciente //4 completo enfermedad
    showSearchSelect: number; //0 //1 paciente // 2 enfermedad
    auxHoraInicio: string;
    auxHoraFin: string;

    pacienteMedic?: cPacienteMedic;

    constructor() {
        var fechaHoy = new cFecha();

        this.idPermisoMedic = undefined;
        this.pacienteMedicId = undefined;
        this.tipoPermiso = "SIN ASIGNAR";
        this.enfermedadCIE10 = "";
        this.fechaSalida = fechaHoy.strFecha + "T" + fechaHoy.strHoraA;
        this.fechaRegreso = "";
        this.totalDias = 0;
        this.totalHoras = 1;
        this.observacion = "";
        this.regresaConsulta=false;
        this.guardiaCargoUser = "VERONICA CHUMO";

        this.spinnerLoading = 0;
        this.showSearchSelect = 0;

        this.changeHours(0);
    }

    completarObject(dataIn: cPermisoMedic) {
        this.idPermisoMedic = dataIn.idPermisoMedic;
        this.pacienteMedicId = dataIn.pacienteMedicId;
        this.tipoPermiso = dataIn.tipoPermiso;
        this.enfermedadCIE10 = dataIn.enfermedadCIE10;
        this.fechaSalida = dataIn.fechaSalida;
        this.fechaRegreso = dataIn.fechaRegreso;
        this.totalDias = dataIn.totalDias;
        this.totalHoras = dataIn.totalHoras;
        this.observacion = dataIn.observacion;
        this.regresaConsulta=dataIn.regresaConsulta;
        this.guardiaCargoUser = dataIn.guardiaCargoUser;

        if (dataIn.pacienteMedic != null) {
            this.pacienteMedic = new cPacienteMedic();
            this.pacienteMedic.completarObject(dataIn.pacienteMedic);
        }
    }

    changeHours(strInicio: number) {
        let fechaHoy: cFecha = new cFecha();

        var auxSepararFechaSalida = this.fechaSalida.split("T");
        var soloHoraSalida = auxSepararFechaSalida[1].split(':');
        var newHoraFin: number;
        if (strInicio == 0) {
            newHoraFin = Number(soloHoraSalida[0]) + 1;
            if (newHoraFin < 10)
                this.fechaRegreso = "0" + newHoraFin + ":" + soloHoraSalida[1];
            else this.fechaRegreso = newHoraFin + ":" + soloHoraSalida[1];
            this.fechaRegreso = fechaHoy.strFecha + "T" + this.fechaRegreso;
        } else {
            if (strInicio == 2) {
                var auxSepararFechaRegreso = this.fechaRegreso.split("T");
                var soloHoraRegreso = auxSepararFechaRegreso[1].split(':');
                this.totalDias = fechaHoy.compararFechasDias(auxSepararFechaSalida[0], auxSepararFechaRegreso[0]);
                var horasDif = (Number(soloHoraRegreso[0]) - Number(soloHoraSalida[0]));
                if (horasDif < 0) {
                    this.totalDias--;
                    this.totalHoras = (this.totalDias * 24) + (24 + horasDif);
                } else this.totalHoras = (this.totalDias * 24) + (horasDif);
            }
            if (strInicio == 3 || strInicio == 4) {
                var auxDiferenciaHoras = 0;
                var diasDif = 0;

                if (strInicio == 4) {
                    this.totalHoras = 24 * this.totalDias;
                    diasDif = this.totalDias;
                }
                else {
                    auxDiferenciaHoras = this.totalHoras;
                    while (auxDiferenciaHoras > 23) {
                        diasDif++;
                        auxDiferenciaHoras = auxDiferenciaHoras - 24;
                    }
                    this.totalDias = diasDif;
                }

                var soloFechaSalida = auxSepararFechaSalida[0].split("-");
                var soloHora = "";
                newHoraFin = Number(soloHoraSalida[0]) + auxDiferenciaHoras;
                if (newHoraFin >= 24) {
                    diasDif++;
                    newHoraFin = newHoraFin - 24;
                }
                if (newHoraFin < 10)
                    soloHora = "T0" + newHoraFin + ":" + soloHoraSalida[1];
                else soloHora = "T" + newHoraFin + ":" + soloHoraSalida[1];

                if (diasDif > 0) {
                    var auxContador = Number(soloFechaSalida[1]) - 1;
                    var auxNewDia: any = Number(soloFechaSalida[2]) + diasDif;
                    var auxDia: string = soloFechaSalida[0] + "-";
                    while (Number(auxNewDia) > Number(fechaHoy.arrayMes[auxContador].maxDias)) {
                        auxNewDia = Number(auxNewDia) - Number(fechaHoy.arrayMes[auxContador].maxDias);
                        auxContador++;
                        if (auxContador == 12) {
                            auxContador = 0;
                            auxDia = (Number(soloFechaSalida[0]) + 1) + "-";
                        }
                    }
                    if (fechaHoy.arrayMes[auxContador].id < 10)
                        this.fechaRegreso = auxDia + "0" + fechaHoy.arrayMes[auxContador].id + "-";
                    else this.fechaRegreso = auxDia + fechaHoy.arrayMes[auxContador].id + "-";
                    if (Number(auxNewDia) < 10)
                        this.fechaRegreso = this.fechaRegreso + "0" + auxNewDia + soloHora;
                    else this.fechaRegreso = this.fechaRegreso + auxNewDia + soloHora;
                } else this.fechaRegreso = auxSepararFechaSalida[0] + soloHora;
            }
        }
    }
}

export class cAtencionMedic {
    idAtencionMedic: number;
    pacienteMedicId: number;
    enfermedadCIE10: string;
    fechaAtencion: string;
    peso: number;
    altura: number;

    temperatura: number;
    presion: string;
    fCardiaca: number;
    fRespiratoria: number;
    sp02: number;
    reposo: boolean;
    permisoIdOpcional: number;

    motivoAtencion: string;
    enfermedadesActuales: string;
    prescripcion: string;
    indicaciones: string;
    observacion: string;


    pacienteMedic?: cPacienteMedic;
    permisoMedic?: cPermisoMedic;

    /**Variables de control */
    auxIMC: number;
    spinnerLoading: boolean;
    showSearchSelect: boolean;
    presionA:number;
    presionB:number;

    constructor() {
        this.idAtencionMedic = undefined;
        this.pacienteMedicId = undefined;
        this.enfermedadCIE10 = "";
        this.peso = 0;
        this.altura = 0;
        this.temperatura = undefined;
        this.presion = undefined;
        this.fCardiaca = undefined;
        this.fRespiratoria = undefined;
        this.sp02 = undefined;
        this.reposo = false;
        this.permisoIdOpcional = 0;
        this.motivoAtencion = "";
        this.enfermedadesActuales = "";
        this.prescripcion = "";
        this.indicaciones = "";
        this.observacion = "";

        var fechaHoy = new cFecha();
        this.fechaAtencion = fechaHoy.strFecha;

        this.auxIMC = 0;
        this.spinnerLoading = false;
        this.showSearchSelect = false;
        this.presionA=undefined;
        this.presionB=undefined;
    }

    completarObject(dataIn: cAtencionMedic) {
        this.idAtencionMedic = dataIn.idAtencionMedic;
        this.pacienteMedicId = dataIn.pacienteMedicId;
        this.enfermedadCIE10 = dataIn.enfermedadCIE10;
        this.fechaAtencion = dataIn.fechaAtencion;
        this.peso = dataIn.peso;
        this.altura = dataIn.altura;
        this.temperatura = dataIn.temperatura;
        this.presion = dataIn.presion;
        this.fCardiaca = dataIn.fCardiaca;
        this.fRespiratoria = dataIn.fRespiratoria;
        this.sp02 = dataIn.sp02;
        this.reposo = dataIn.reposo;
        this.permisoIdOpcional = dataIn.permisoIdOpcional;
        this.motivoAtencion = dataIn.motivoAtencion;
        this.enfermedadesActuales = dataIn.enfermedadesActuales;
        this.prescripcion = dataIn.prescripcion;
        this.indicaciones = dataIn.indicaciones;
        this.observacion = dataIn.observacion;

        if (dataIn.pacienteMedic != null) {
            this.pacienteMedic = new cPacienteMedic();
            this.pacienteMedic.completarObject(dataIn.pacienteMedic);
        }
        if (dataIn.reposo) {
            this.permisoMedic = new cPermisoMedic();
            if (dataIn.permisoIdOpcional != 0)
                this.permisoMedic.completarObject(dataIn.permisoMedic);
        }
    }

    calcularIMC() {
        if (this.altura != 0) {
            this.auxIMC = this.peso / (this.altura * this.altura);
            this.auxIMC = Number(this.auxIMC.toFixed(1));
        } else this.auxIMC = 0;
    }
}

export class cAccidenteMedic {
    idAccidenteMedic: number = undefined;
    pacienteMedicId: number = undefined;
    fechaRegistro: string;
    fechaRegreso: string;
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
        this.pacienteMedicId = undefined;
        this.fechaRegistro = fechaHoy.strFecha + "T" + fechaHoy.strHoraA;
        this.fechaRegreso = "";
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
        var auxTotalDias: number;
        var auxSepararFechaSalida = this.fechaRegistro.split("T");
        var soloHoraSalida = auxSepararFechaSalida[1].split(':');
        var newHoraFin: number;
        if (strInicio == 0) {
            newHoraFin = Number(soloHoraSalida[0]) + 1;
            if (newHoraFin < 10)
                this.fechaRegreso = "0" + newHoraFin + ":" + soloHoraSalida[1];
            else this.fechaRegreso = newHoraFin + ":" + soloHoraSalida[1];
            this.fechaRegreso = fechaHoy.strFecha + "T" + this.fechaRegreso;
        } else {
            if (strInicio == 2) {
                var auxSepararFechaRegreso = this.fechaRegreso.split("T");
                var soloHoraRegreso = auxSepararFechaRegreso[1].split(':');
                auxTotalDias = fechaHoy.compararFechasDias(auxSepararFechaSalida[0], auxSepararFechaRegreso[0]);
                var horasDif = (Number(soloHoraRegreso[0]) - Number(soloHoraSalida[0]));
                if (horasDif < 0) {
                    auxTotalDias--;
                    this.totalHoras = (auxTotalDias * 24) + (24 + horasDif);
                } else this.totalHoras = (auxTotalDias * 24) + (horasDif);
            }
            if (strInicio == 3 || strInicio == 4) {
                var auxDiferenciaHoras = 0;
                var diasDif = 0;

                if (strInicio == 4) {
                    this.totalHoras = 24 * auxTotalDias;
                    diasDif = auxTotalDias;
                }
                else {
                    auxDiferenciaHoras = this.totalHoras;
                    while (auxDiferenciaHoras > 23) {
                        diasDif++;
                        auxDiferenciaHoras = auxDiferenciaHoras - 24;
                    }
                    auxTotalDias = diasDif;
                }

                var soloFechaSalida = auxSepararFechaSalida[0].split("-");
                var soloHora = "";
                newHoraFin = Number(soloHoraSalida[0]) + auxDiferenciaHoras;
                if (newHoraFin >= 24) {
                    diasDif++;
                    newHoraFin = newHoraFin - 24;
                }
                if (newHoraFin < 10)
                    soloHora = "T0" + newHoraFin + ":" + soloHoraSalida[1];
                else soloHora = "T" + newHoraFin + ":" + soloHoraSalida[1];

                if (diasDif > 0) {
                    var auxContador = Number(soloFechaSalida[1]) - 1;
                    var auxNewDia: any = Number(soloFechaSalida[2]) + diasDif;
                    var auxDia: string = soloFechaSalida[0] + "-";
                    while (Number(auxNewDia) > Number(fechaHoy.arrayMes[auxContador].maxDias)) {
                        auxNewDia = Number(auxNewDia) - Number(fechaHoy.arrayMes[auxContador].maxDias);
                        auxContador++;
                        if (auxContador == 12) {
                            auxContador = 0;
                            auxDia = (Number(soloFechaSalida[0]) + 1) + "-";
                        }
                    }
                    if (fechaHoy.arrayMes[auxContador].id < 10)
                        this.fechaRegreso = auxDia + "0" + fechaHoy.arrayMes[auxContador].id + "-";
                    else this.fechaRegreso = auxDia + fechaHoy.arrayMes[auxContador].id + "-";
                    if (Number(auxNewDia) < 10)
                        this.fechaRegreso = this.fechaRegreso + "0" + auxNewDia + soloHora;
                    else this.fechaRegreso = this.fechaRegreso + auxNewDia + soloHora;
                } else this.fechaRegreso = auxSepararFechaSalida[0] + soloHora;
            }
        }
    }

    completarObject(dataIn: cAccidenteMedic) {
        this.idAccidenteMedic = dataIn.idAccidenteMedic;
        this.pacienteMedicId = dataIn.pacienteMedicId;
        this.fechaRegistro=dataIn.fechaRegistro;
        this.fechaRegreso=dataIn.fechaRegreso;
        this.totalHoras = dataIn.totalHoras;
        this.descripcion = dataIn.descripcion;
        this.jefeInmediato = dataIn.jefeInmediato;
        this.lugarAccidente = dataIn.lugarAccidente;
        this.causaAccidente = dataIn.causaAccidente;
        this.laborRealizaba = dataIn.laborRealizaba;

        if (dataIn.listTestigosAccidente != null) {
            this.listTestigosAccidente = dataIn.listTestigosAccidente;
        }
        if (dataIn.listGaleriaAccidente != null) {
            this.listGaleriaAccidente = dataIn.listGaleriaAccidente;
        }
    }
}

export class cTestigosMedic {
    idTestigo: number;
    accidenteId: number;
    nombreTestigo: string;
    relato: string;

    ocultarObj: boolean;

    constructor() {
        this.idTestigo = undefined;
        this.accidenteId = undefined;
        this.nombreTestigo = "";
        this.relato = "";
        this.ocultarObj = true;
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

export class cParametroReporteMedic {
    tipoR: string;
    idEmpresa: number;
    strPeriodo: string;
    strArea: string;

    constructor() {
        var fechaHoy = new cFecha();
        this.idEmpresa=undefined;
        this.tipoR = "SIN ASIGNAR";
        this.strPeriodo = fechaHoy.sacaSoloMes();
        this.strArea = "SIN ASIGNAR";
    }

    resetObj() {
        var fechaHoy = new cFecha();
        this.idEmpresa=undefined;
        this.tipoR = "SIN ASIGNAR";
        this.strPeriodo = fechaHoy.sacaSoloMes();
        this.strArea = "SIN ASIGNAR";
    }
}

export class cReportGeneralMedic{
    enfermedadCIE10:string;
    contadorOcurrencia:number;
    listDepartamentos:cReportGeneralMedicArea[];
}

export class cReportGeneralMedicArea{
    departamento:string;
    contadorOcurrencia:number;
}

export class cDepartamentoR {
    departamento:string;
    contOcurrenciaTotal: number;
    contOcurrenciaNormal: number;
    contOcurrenciaControl: number;

    constructor(nombreIn){
        this.departamento=nombreIn;
        this.contOcurrenciaTotal=0;
        this.contOcurrenciaNormal=0;
        this.contOcurrenciaControl=0;
    }
  }