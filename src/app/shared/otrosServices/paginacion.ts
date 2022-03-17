export class cPaginacion {
    startIndex: number = 0;
    endIndex: number = 0;
    selectPagination: number = 10;
    pagActualIndex: number = 0;
    siguienteBlock: boolean = false;
    anteriorBlock: boolean = true;
    pagTotal: any[] = [];

    constructor(inicioSelect:number){
        this.selectPagination=inicioSelect;
    }
    getNumberIndex(n: number) {//Para establecer las paginas del pagination y el numero de elemento por pagina
        const aux:number = n / this.selectPagination;
        var auxEntera = parseInt(aux.toString(), 10);
        var auxValores;
        if ((aux - auxEntera) > 0)
            auxEntera = auxEntera + 1;
        
        if(auxEntera!=this.pagTotal.length){
            this.pagTotal = [];
            for (var i = 0; i < auxEntera; i++) {
                auxValores = {
                    valorB: false,
                    mostrar: false
                }
                this.pagTotal.push(auxValores);
            }
            this.updateIndex(0);
        }
    }
    updateIndex(pageIndex: number) {//Para cambiar de pagina y ademas bloquiar y desbloquiar pag anterior y post si es q no cumple la condiciones
        if(pageIndex<0)
            pageIndex=0;
        if(pageIndex>this.pagTotal.length-1)
            pageIndex=this.pagTotal.length-1;
        if(this.pagActualIndex!=pageIndex)
            this.pagActualIndex = pageIndex;

        this.startIndex = Number(this.pagActualIndex * this.selectPagination);
        this.endIndex = Number(this.startIndex) + Number(this.selectPagination);

        if (this.pagActualIndex + 2 <= this.pagTotal.length)
            this.siguienteBlock = false;
        else
            this.siguienteBlock = true;
    
        if (this.pagActualIndex > 0)
            this.anteriorBlock = false;
        else
            this.anteriorBlock = true;
    
        for (var i = 0; i < this.pagTotal.length; i++) {
            if (i == pageIndex)
                this.pagTotal[i].valorB = true;
            else
                this.pagTotal[i].valorB = false;
    
            if ((pageIndex == 0 && i < 5) || (pageIndex == 1 && i < 5) || (pageIndex == this.pagTotal.length - 1 && i > this.pagTotal.length - 6) || (pageIndex == this.pagTotal.length - 2 && i > this.pagTotal.length - 6))
                this.pagTotal[i].mostrar = false;
            else {
                if ((i >= pageIndex + 3) || (i <= pageIndex - 3))
                    this.pagTotal[i].mostrar = true;
                else
                    this.pagTotal[i].mostrar = false;
            }
        }
    }
}






