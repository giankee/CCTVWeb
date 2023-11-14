export class cRegisterU {
        UserName: string;
        Email?: string;
        PasswordHash?: string;
        phoneNumber?: string;
        estado?: number;
        nombreU?: string;
        rolAsignado?: string;
        ConfirmPassword?: string;
        temporalPassword?: boolean;

        constructor() {
                this.UserName = "";
                this.nombreU = "";
                this.Email = "";
                this.phoneNumber = "593-";
                this.PasswordHash = "";
                this.ConfirmPassword = "";
                this.rolAsignado = "supervisor";
                this.temporalPassword = false;
                this.estado = 1;
        }
}

export class cLoginU {
        UserName: string;
        PasswordHash?: string;

        ConfirmPassword?: string;
        constructor() {
                this.UserName = "";
                this.PasswordHash = "";
                this.ConfirmPassword = "";
        }
}

export class cDataToken {
        id: string;
        sub: string;
        name: string;
        whatsAppPhone: string;
        rboot: string;
        role: string | string[];
        nbf: number;
        exp: number;

        constructor(tokenIn?: string) {
                if (tokenIn != null) {
                        const parts = tokenIn.split('.');
                        if (parts.length == 3) {
                                const payload = parts[1];
                                const decodedPayload = decodeURIComponent(
                                        Array.prototype.map
                                                .call(atob(payload), (char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                                                .join('')
                                );
                                const parsedPayload = JSON.parse(decodedPayload);
                                this.id = parsedPayload.id;
                                this.sub = parsedPayload.sub;
                                this.name = parsedPayload.name;
                                this.whatsAppPhone = parsedPayload.whatsAppPhone;
                                this.rboot = parsedPayload.rboot;
                                this.role = parsedPayload.role;
                                this.nbf = parsedPayload.nbf;
                                this.exp = parsedPayload.exp;
                        }
                }
        }

        completarObj(data: cDataToken) {
                this.id = data.id;
                this.sub = data.sub;
                this.name = data.name;
                this.whatsAppPhone = data.whatsAppPhone;
                this.rboot = data.rboot;
                this.role = data.role;
                this.nbf = data.nbf;
                this.exp = data.exp;
        }
}