import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cPlantillaIees } from 'src/app/shared/medicina/medicina';
import { cFecha } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-formulario-iees',
  templateUrl: './formulario-iees.component.html',
  styleUrls: ['./formulario-iees.component.css']
})
export class FormularioIeesComponent implements OnInit {

  @Input() crearFormulario: cPlantillaIees;
  @Output() rellenarFormulario: EventEmitter<cPlantillaIees> = new EventEmitter<cPlantillaIees>();

  fechaHoy = new cFecha();

  fasave = faSave; fatimescircle = faTimesCircle;
  constructor() { }

  ngOnInit(): void {
  }
  onTerminar(op: number) {
    this.crearFormulario.isOpen=op;
    this.rellenarFormulario.emit(this.crearFormulario);
  }
  onSubmit(form: NgForm){
    this.onTerminar(2);
  }
  onComprobarTime(){
    let fechaHoy: cFecha = new cFecha();
    this.crearFormulario.totalDias = fechaHoy.compararFechasDias(this.crearFormulario.fechaSalida, this.crearFormulario.fechaRegreso, this.crearFormulario.incluirFinSemana);
  }
}
