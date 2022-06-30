import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';
import { CanDeactivateGuard } from './auth/can-deactive.guard';
import { ComprasNoRealizadasComponent } from './bodega/compra-proveedor/compras-no-realizadas/compras-no-realizadas.component';
import { ComprasVerificacionComponent } from './bodega/compra-proveedor/compras-verificacion/compras-verificacion.component';
import { ConsultaMedicComponent } from './bodega/consulta-medic/consulta-medic.component';
import { ControlESComponent } from './bodega/control-es/control-es.component';
import { ListComprasComponent } from './bodega/list-compras/list-compras.component';
import { ListConsultaMedicComponent } from './bodega/consulta-medic/list-consulta-medic/list-consulta-medic.component';
import { ListProductoBComponent } from './bodega/list-producto-b/list-producto-b.component';
import { OrdenTrabajoPlantaComponent } from './bodega/orden-trabajo-planta/orden-trabajo-planta.component';
import { MainReporteComponent } from './bodega/reportes/main/main-reporte.component';
import { ListCarrosComponent } from './carro/carros-list/list-carros.component';
import { ClienteComponent } from './cliente/cliente.component';
import { AccessDenegadoComponent } from './errores/access-denegado/access-denegado.component';
import { MenuComponent } from './menu/menu.component';
import { ListOrdenesComponent } from './OrdenAdmin/list-ordenes/list-ordenes.component';
import { PersonalListComponent } from './personal/personal-list/personal-list.component';
import { ListProductosComponent } from './producto/list-productos/list-productos.component';
import { PuertoComponent } from './puerto/puerto.component';
import { ListBaldesComponent } from './tinas/list-baldes/list-baldes.component';
import { ListMovTinasComponent } from './tinas/list-mov-tinas/list-mov-tinas.component';
import { ForcedOutComponent } from './user/forced-out/forced-out.component';
import { RegistroComponent } from './user/registro/registro.component';
import { UserComponent } from './user/user.component';
import { VisitantesComponent } from './visitantes/visitantes.component';
import { CrearMedicamentoComponent } from './bodega/crear-medicamento/crear-medicamento.component';
import { PedirMedicamentoComponent } from './bodega/pedir-medicamento/pedir-medicamento.component';
import { cAccidenteMedic } from './shared/bodega/ordenTrabajo';
import { NewAccidenteComponent } from './bodega/accidente/new-accidente/new-accidente.component';
import { AgruparInventarioComponent } from './bodega/list-producto-b/agrupar-inventario/agrupar-inventario.component';

const routes: Routes = [

  { path: '', redirectTo: '/user-Login', pathMatch: 'full' },

  {path: '', component: MenuComponent, canActivateChild: [AdminGuard],
    children: [
      {
        path: 'OrdenSupervisor', children: [
          { path: '', data: { permittedRoles: ['admin', 'supervisor','gpv-o','gv-m'] }, component: ListOrdenesComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'VehiculosList', children: [
          { path: '', data: { permittedRoles: ['admin'] }, component: ListCarrosComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'PersonalList', children: [
          { path: '', data: { permittedRoles: ['admin'] }, component: PersonalListComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'ProductosList', children: [
          { path: '', data: { permittedRoles: ['admin','gpv-o'] }, component: ListProductosComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'Bodega', children: [
          { path: 'inventarioList', data: { permittedRoles: ['admin','gpv-o','tinabg-m','bodega_verificador-m','enfermeria','verificador-medic','verificador-bodeguero'] }, component: ListProductoBComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'comprasInv', data: { permittedRoles: ['admin','gpv-o','tinabg-m','bodega_verificador-m','enfermeria'] }, component: ListComprasComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'controlBodega', data: { permittedRoles: ['tinabg-m','bodega_verificador-m','enfermeria'] }, component: ControlESComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'trabajosInter', data: { permittedRoles: ['tinabg-m','bodega_verificador-m','verificador-bodeguero',] }, component: OrdenTrabajoPlantaComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'reportes', data: { permittedRoles: ['gpv-o','tinabg-m','bodega_verificador-m'] }, component: MainReporteComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'verificacion', data: { permittedRoles: ['verificador-medic'] }, component: ComprasVerificacionComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'consulta', data: { permittedRoles: ['enfermeria','verificador-medic'] }, component: ConsultaMedicComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'consumoList', data: { permittedRoles: ['enfermeria','verificador-medic'] }, component: ListConsultaMedicComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'crearMedicamento', data: { permittedRoles: ['enfermeria'] }, component: CrearMedicamentoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'solicitarMedicamento', data: { permittedRoles: ['enfermeria','verificador-medic'] }, component: PedirMedicamentoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'accidente', data: { permittedRoles: ['enfermeria'] }, component: NewAccidenteComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'inventGroup', data: { permittedRoles: ['verificador-bodeguero'] }, component: AgruparInventarioComponent, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      {
        path: 'Tina', children: [
          { path: 'BaldesList', data: { permittedRoles: ['admin','tinabg-m'] }, component: ListBaldesComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'movTinas', data: { permittedRoles: ['admin','tinabg-m'] }, component: ListMovTinasComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      
      { path: 'registrar', component: RegistroComponent, data: { permittedRoles: ['admin','supervisor'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'Entrada-Salida', component: ClienteComponent, data: { permittedRoles: ['gpv-o','gv-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'Verificador', component: PuertoComponent, data: { permittedRoles: ['gpv-o','bodega_verificador-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'BuscarFactura', component: ComprasNoRealizadasComponent, data: { permittedRoles: ['gpv-o','bodega_verificador-m','tinabg-m','enfermeria'] }, canDeactivate: [CanDeactivateGuard] },
    ]
  },
  { path: 'OrdenGuardia', data: { permittedRoles: ['guardia'] }, component: ClienteComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateGuard] },
  { path: 'OrdenVerificacion', data: { permittedRoles: ['verificador-p','verificador-m',] }, component: PuertoComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateGuard] },
  { path: 'OrdenVisitante', data: { permittedRoles: ['visitante'] }, component: VisitantesComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateGuard] },

  { path: 'user-Login', component: UserComponent },
  { path: 'denegado', component: AccessDenegadoComponent },
  { path: 'forceOut', component: ForcedOutComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
