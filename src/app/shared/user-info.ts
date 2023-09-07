export class cRegisterU {
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
                this.temporalPassword=false;
                this.estado=1;
        }
}

export class cLoginU {
        UserName: string;
        PasswordHash?: string;


        constructor() {
                this.UserName = "";
                this.PasswordHash = "";
        }
}

export class cDataToken {
        id: string;
        sub: string;
        name: string;
        whatsAppPhone: string;
        reboot:string;
        role: string | string[];
        nbf: number;
        exp: number;

        constructor(tokenIn?: string) {
                if (tokenIn != null) {
                        const payLoad = JSON.parse(window.atob(tokenIn.split('.')[1]));
                        this.id = payLoad.id;
                        this.sub = payLoad.sub;
                        this.name = payLoad.name;
                        this.whatsAppPhone = payLoad.whatsAppPhone;
                        this.reboot=payLoad.reboot;
                        this.role = payLoad.role;
                        this.nbf = payLoad.nbf;
                        this.exp = payLoad.exp;
                }

        }

        completarObj(data: cDataToken) {
                this.id = data.id;
                this.sub = data.sub;
                this.name = data.name;
                this.whatsAppPhone = data.whatsAppPhone;
                this.reboot=data.reboot;
                this.role = data.role;
                this.nbf = data.nbf;
                this.exp = data.exp;
        }
}