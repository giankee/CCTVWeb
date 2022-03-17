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
/*Services*/
import { CarroService } from './shared/carro.service';
import { UserService } from './shared/user.service';
import { ConexionService } from './shared/otrosServices/conexion.service';

import { ListComprasComponent } from './bodega/list-compras/list-compras.component';
import { ListBaldesComponent } from './tinas/list-baldes/list-baldes.component';
import { ListMovTinasComponent } from './tinas/list-mov-tinas/list-mov-tinas.component';
import { KardexComponent } from './bodega/kardex/kardex.component';
import { ViewCompraModelComponent } from './bodega/view-compra-model/view-compra-model.component';
import { CargarXLSXComponent } from './bodega/cargar-xlsx/cargar-xlsx.component';
import { ControlESComponent } from './bodega/control-es/control-es.component';
import { TraspasoInternoComponent } from './bodega/traspaso-interno/traspaso-interno.component';
import { OrdenTrabajoPlantaComponent } from './bodega/orden-trabajo-planta/orden-trabajo-planta.component';
import { PopOutXListPipe } from './pipes/pop-out-xlist.pipe';
import { DevolucionCompraComponent } from './bodega/devolucion-compra/devolucion-compra.component';
import { ViewTrabajoModelComponent } from './bodega/orden-trabajo-planta/view-trabajo-model/view-trabajo-model.component';
import { MainReporteComponent } from './bodega/reportes/main/main-reporte.component';
import { ReporteProductoComponent } from './bodega/reportes/reporte-producto/reporte-producto.component';
import { ReporteCompraComponent } from './bodega/reportes/reporte-compra/reporte-compra.component';
import { SumCantBodegaPipe } from './pipes/sum-cant-bodega.pipe';
import { ComprasNoRealizadasComponent } from './bodega/compra-proveedor/compras-no-realizadas/compras-no-realizadas.component';
import { FechaMesPipe } from './pipes/fecha-mes.pipe';



/*import { ServiceWorkerModule } from '@angular/service-worker';
*/



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
    FechaMesPipe
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
    NgxGalleryModule
  ],
  entryComponents: [ViewOrdenModalComponent,EditOrdenComponent,KardexComponent],
  providers: [UserService,ConexionService,CarroService,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorError, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor,multi: true},],
  bootstrap: [AppComponent]
})
export class AppModule { }
