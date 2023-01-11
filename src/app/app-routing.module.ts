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
import { CrearMedicamentoComponent } from './bodega/crear-medicamento/crear-medicamento.component';
import { PedirMedicamentoComponent } from './bodega/pedir-medicamento/pedir-medicamento.component';
import { NewAccidenteComponent } from './medicina/new-accidente/new-accidente.component';
import { AgruparInventarioComponent } from './bodega/list-producto-b/agrupar-inventario/agrupar-inventario.component';
import { FichaTecnicaComponent } from './medicina/ficha-tecnica/ficha-tecnica.component';
import { PermisosComponent } from './medicina/permisos/permisos.component';
import { AtencionMedicComponent } from './medicina/atencion-medic/atencion-medic.component';
import { ListAtencionesComponent } from './medicina/list-atenciones/list-atenciones.component';
import { ListPermisosPersonalesComponent } from './medicina/list-historial-persona/list-permisosPersonales/list-permisos-personales.component';
import { ListAccidentesPersonalesComponent } from './medicina/list-historial-persona/list-accidentesPersonales/list-accidentes-personales.component';
import { ListPermisosComponent } from './medicina/list-permisos/list-permisos.component';
import { ReportesMedicComponent } from './medicina/reportes-medic/reportes-medic.component';
import { OrdenPedidoComponent } from './pedido/orden-pedido/orden-pedido.component';
import { PedidosVerificacionComponent } from './pedido/pedidos-verificacion/pedidos-verificacion.component';
import { ListPedidosComponent } from './pedido/list-pedidos/list-pedidos.component';
import { ListBoodegasComponent } from './bodega/list-boodegas/list-boodegas.component';
import { PedidosAprobarComponent } from './pedido/pedidos-aprobar/pedidos-aprobar.component';
import { ListProveedorComponent } from './proveedor/list-proveedor/list-proveedor.component';

const routes: Routes = [

  { path: '', redirectTo: '/user-Login', pathMatch: 'full' },

  {path: '', component: MenuComponent, canActivateChild: [AdminGuard],
    children: [
      {
        path: 'OrdenSupervisor', children: [
          { path: '', data: { permittedRoles: ['admin','gpv-o','gv-m'] }, component: ListOrdenesComponent, canDeactivate: [CanDeactivateGuard] },
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
          { path: 'consumoList', data: { permittedRoles: ['enfermeria','verificador-medic','gpv-o'] }, component: ListConsultaMedicComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'crearMedicamento', data: { permittedRoles: ['enfermeria'] }, component: CrearMedicamentoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'solicitarMedicamento', data: { permittedRoles: ['enfermeria','verificador-medic'] }, component: PedirMedicamentoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'accidente', data: { permittedRoles: ['enfermeria'] }, component: NewAccidenteComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'inventGroup', data: { permittedRoles: ['verificador-bodeguero'] }, component: AgruparInventarioComponent, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      {
        path: 'Medicina', children: [
          { path: 'fichaMedica', data: { permittedRoles: ['enfermeria'] }, component: FichaTecnicaComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'permisoMedico', data: { permittedRoles: ['enfermeria'] }, component: PermisosComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'atencionMedica', data: { permittedRoles: ['enfermeria'] }, component: AtencionMedicComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'atencionList', data: { permittedRoles: ['enfermeria'] }, component: ListAtencionesComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'list_permisosPersonales', data: { permittedRoles: ['enfermeria'] }, component: ListPermisosPersonalesComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'list_accidentesPersonales', data: { permittedRoles: ['enfermeria'] }, component: ListAccidentesPersonalesComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'list_permisosGeneral', data: { permittedRoles: ['enfermeria'] }, component: ListPermisosComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'reportes', data: { permittedRoles: ['enfermeria'] }, component: ReportesMedicComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'Tina', children: [
          { path: 'BaldesList', data: { permittedRoles: ['admin','tinabg-m'] }, component: ListBaldesComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'movTinas', data: { permittedRoles: ['admin','tinabg-m'] }, component: ListMovTinasComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'Pedido', children: [
          { path: 'Orden', data: { permittedRoles: ['pedido-flota','pedido-planta','pedido-super'] }, component: OrdenPedidoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'PedidosList', data: { permittedRoles: ['pedido-flota','pedido-planta','pedido-super'] }, component: ListPedidosComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'VerificacionPedido', data: { permittedRoles: ['pedido-flota','pedido-planta'] }, component: PedidosVerificacionComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'AprobacionPedido', data: { permittedRoles: ['pedido-flota','pedido-planta'] }, component: PedidosAprobarComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'Reporte', data: { permittedRoles: ['pedido-flota','pedido-planta','pedido-super'] }, component: OrdenPedidoComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      { path: 'List-bodegas', component: ListBoodegasComponent, data: { permittedRoles: ['admin','gpv-o','tinabg-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'List-proveedor', component: ListProveedorComponent, data: { permittedRoles: ['gpv-o','tinabg-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'registrar', component: RegistroComponent, data: { permittedRoles: ['admin'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'Entrada-Salida', component: ClienteComponent, data: { permittedRoles: ['gpv-o','gv-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'Verificador', component: PuertoComponent, data: { permittedRoles: ['gpv-o','bodega_verificador-m'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'BuscarFactura', component: ComprasNoRealizadasComponent, data: { permittedRoles: ['gpv-o','bodega_verificador-m','tinabg-m','enfermeria'] }, canDeactivate: [CanDeactivateGuard] },
    ]
  },
  { path: 'OrdenGuardia', data: { permittedRoles: ['guardia'] }, component: ClienteComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateGuard] },
  // { path: 'OrdenVerificacion', data: { permittedRoles: ['verificador-p','verificador-m',] }, component: PuertoComponent, canActivate: [AdminGuard], canDeactivate: [CanDeactivateGuard] },

  { path: 'user-Login', component: UserComponent },
  { path: 'denegado', component: AccessDenegadoComponent },
  { path: 'forceOut', component: ForcedOutComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
