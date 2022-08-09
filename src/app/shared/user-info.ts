export class cUsuario {
        userName: string;
        Email?: string;
        PasswordHash?: string;
        phoneNumber?: string;
        estado?: number;
        nombreU?: string;
        rolAsignado?: string;
        ConfirmPassword?: string;
        temporalPassword?: boolean;

        constructor() {
                this.userName = "";
                this.PasswordHash = "";
                this.ConfirmPassword = "";
        }

        objCompletar?(dataIn:cUsuario){
                this.userName=dataIn.userName;
                this.nombreU=dataIn.nombreU;
                this.rolAsignado=dataIn.rolAsignado;
                this.phoneNumber=dataIn.phoneNumber;
        }
}

