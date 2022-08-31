/**Basic */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/*Librerias Adiciones*/
import { ToastrModule} from 'ngx-toastr'; //las notificaciones al ingresar modificar, elimianr
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDialogModule} from '@angular/material/dialog';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatSelectModule} from '@angular/material/select';
//import { NgxChartsModule } from '@swimlane/ngx-charts';

/**Directivas y Pipes*/
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { Interceptor } from './auth/interceptor';
import { InterceptorError } from './errores/error/interceptorError';
import { UpperLowerCasePipe } from './pipes/upper-lower-case.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { LugaresCatPipe } from './pipes/lugares-cat.pipe';
import { TemporalescantPipe } from './pipes/temporalescant.pipe';
import { CurrencyPipe } from './pipes/currency.pipe';
import { FiltroBodegahPipe } from './pipes/filtroBodega.pipe';
import { PopOutXListPipe } from './pipes/pop-out-xlist.pipe';
import { SumCantBodegaPipe } from './pipes/sum-cant-bodega.pipe';
import { FechaMesPipe } from './pipes/fecha-mes.pipe';
import { FiltrarCie10Pipe } from './pipes/filtrar-cie10.pipe';
import { SearchMaterialPipe } from './pipes/search-material.pipe';
/*Componentes*/
import { UserComponent } from './user/user.component';
import { AccessDenegadoComponent } from './errores/access-denegado/access-denegado.component';
import { ErrorComponent } from './errores/error/error.component';
import { MenuComponent } from './menu/menu.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ListOrdenesComponent } from './OrdenAdmin/list-ordenes/list-ordenes.component';
import { ListCarrosComponent } from './carro/carros-list/list-carros.component';
import { RegistroComponent } from './user/registro/registro.component';
import { PersonalListComponent } from './personal/personal-list/personal-list.component';
import { ListProductosComponent } from './producto/list-productos/list-productos.component';
import { ViewOrdenModalComponent } from './OrdenAdmin/view-orden-modal/view-orden-modal.component';
import { PuertoComponent } from './puerto/puerto.component';
import { VisitantesComponent } from './visitantes/visitantes.component';
import { EditOrdenComponent } from './OrdenAdmin/edit-orden/edit-orden.component';
import { ForcedOutComponent } from './user/forced-out/forced-out.component';
import { ListProductoBComponent } from './bodega/list-producto-b/list-producto-b.component';
import { CompraProveedorComponent } from './bodega/compra-proveedor/compra-proveedor.component';
import { ListComprasComponent } from './bodega/list-compras/list-compras.component';
import { ListBaldesComponent } from './tinas/list-baldes/list-baldes.component';
import { ListMovTinasComponent } from './tinas/list-mov-tinas/list-mov-tinas.component';
import { KardexComponent } from './bodega/kardex/kardex.component';
import { ViewCompraModelComponent } from './bodega/view-compra-model/view-compra-model.component';
import { CargarXLSXComponent } from './bodega/cargar-xlsx/cargar-xlsx.component';
import { ControlESComponent } from './bodega/control-es/control-es.component';
import { TraspasoInternoComponent } from './bodega/traspaso-interno/traspaso-interno.component';
import { OrdenTrabajoPlantaComponent } from './bodega/orden-trabajo-planta/orden-trabajo-planta.component';
import { DevolucionCompraComponent } from './bodega/devolucion-compra/devolucion-compra.component';
import { ViewTrabajoModelComponent } from './bodega/orden-trabajo-planta/view-trabajo-model/view-trabajo-model.component';
import { MainReporteComponent } from './bodega/reportes/main/main-reporte.component';
import { ReporteProductoComponent } from './bodega/reportes/reporte-producto/reporte-producto.component';
import { ReporteCompraComponent } from './bodega/reportes/reporte-compra/reporte-compra.component';
import { ComprasNoRealizadasComponent } from './bodega/compra-proveedor/compras-no-realizadas/compras-no-realizadas.component';
import { ComprasVerificacionComponent } from './bodega/compra-proveedor/compras-verificacion/compras-verificacion.component';
import { ConsultaMedicComponent } from './bodega/consulta-medic/consulta-medic.component';
import { ListConsultaMedicComponent } from './bodega/consulta-medic/list-consulta-medic/list-consulta-medic.component';
import { ViewConsultaComponent } from './bodega/consulta-medic/view-consulta/view-consulta.component';
import { CrearMedicamentoComponent } from './bodega/crear-medicamento/crear-medicamento.component';
import { PedirMedicamentoComponent } from './bodega/pedir-medicamento/pedir-medicamento.component';
import { NewAccidenteComponent } from './medicina/new-accidente/new-accidente.component';
import { AgruparInventarioComponent } from './bodega/list-producto-b/agrupar-inventario/agrupar-inventario.component';
import { FichaTecnicaComponent } from './medicina/ficha-tecnica/ficha-tecnica.component';
import { PermisosComponent } from './medicina/permisos/permisos.component';
import { AtencionMedicComponent } from './medicina/atencion-medic/atencion-medic.component';
import { ListAtencionesComponent } from './medicina/list-atenciones/list-atenciones.component';
import { ViewAtencionModalComponent } from './medicina/atencion-medic/view-atencion-modal/view-atencion-modal.component';
import { ListPermisosPersonalesComponent } from './medicina/list-historial-persona/list-permisosPersonales/list-permisos-personales.component';
import { ListAccidentesPersonalesComponent } from './medicina/list-historial-persona/list-accidentesPersonales/list-accidentes-personales.component';
import { ViewAccidenteModelComponent } from './medicina/new-accidente/view-accidente-model/view-accidente-model.component';
import { AvisoFaltanteComponent } from './bodega/compra-proveedor/compras-verificacion/aviso-faltante/aviso-faltante.component';
import { ListPermisosComponent } from './medicina/list-permisos/list-permisos.component';
/*Services*/
import { CarroService } from './shared/carro.service';
import { UserService } from './shared/user.service';
import { ConexionService } from './shared/otrosServices/conexion.service';
import { ReportesMedicComponent } from './medicina/reportes-medic/reportes-medic.component';
import { EnfermedadReportComponent } from './medicina/reportes-medic/enfermedad-report/enfermedad-report.component';
import { AusentisimoReportComponent } from './medicina/reportes-medic/ausentisimo-report/ausentisimo-report.component';
import { ReportEnfermedadesPipe } from './pipes/report-enfermedades.pipe';
import { NullDepartamentosPipe } from './pipes/null-departamentos.pipe';


@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    AccessDenegadoComponent,
    ErrorComponent,
    AutoFocusDirective,
    MenuComponent,
    ClienteComponent,
    ListOrdenesComponent,
    ListCarrosComponent,
    RegistroComponent,
    PersonalListComponent,
    UpperLowerCasePipe,
    SortPipe,
    SearchPipe,
    ListProductosComponent,
    ViewOrdenModalComponent,
    PuertoComponent,
    VisitantesComponent,
    EditOrdenComponent,
    LugaresCatPipe,
    ForcedOutComponent,
    ListProductoBComponent,
    CompraProveedorComponent,
    CurrencyPipe,
    ListComprasComponent,
    ListBaldesComponent,
    ListMovTinasComponent,
    KardexComponent,
    ViewCompraModelComponent,
    CargarXLSXComponent,
    ControlESComponent,
    TraspasoInternoComponent,
    OrdenTrabajoPlantaComponent,
    TemporalescantPipe,
    FiltroBodegahPipe,
    PopOutXListPipe,
    DevolucionCompraComponent,
    ViewTrabajoModelComponent,
    MainReporteComponent,
    ReporteProductoComponent,
    ReporteCompraComponent,
    SumCantBodegaPipe,
    ComprasNoRealizadasComponent,
    FechaMesPipe,
    ComprasVerificacionComponent,
    ConsultaMedicComponent,
    ListConsultaMedicComponent,
    ViewConsultaComponent,
    CrearMedicamentoComponent,
    PedirMedicamentoComponent,
    NewAccidenteComponent,
    AgruparInventarioComponent,
    SearchMaterialPipe,
    FichaTecnicaComponent,
    PermisosComponent,
    AtencionMedicComponent,
    FiltrarCie10Pipe,
    ListAtencionesComponent,
    ViewAtencionModalComponent,
    ListPermisosPersonalesComponent,
    ListAccidentesPersonalesComponent,
    ViewAccidenteModelComponent,
    AvisoFaltanteComponent,
    ListPermisosComponent,
    ReportesMedicComponent,
    EnfermedadReportComponent,
    AusentisimoReportComponent,
    ReportEnfermedadesPipe,
    NullDepartamentosPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    //ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ToastrModule.forRoot(),
    FontAwesomeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSelectModule,
    NgxGalleryModule,
    //NgxChartsModule
  ],
  entryComponents: [ViewOrdenModalComponent,ViewConsultaComponent,EditOrdenComponent,KardexComponent],
  providers: [UserService,ConexionService,CarroService,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorError, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor,multi: true},],
  bootstrap: [AppComponent]
})
export class AppModule { }
