import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { EditProfileComponent } from './pages/profile/edit-profile/edit-profile.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { EventoComponent } from './pages/evento/evento.component';
import { EventoFormComponent } from './pages/evento-form/evento-form.component';
import { RecomendacionesComponent } from './pages/recomendaciones/recomendaciones.component';
import { ConfirmacionCompraComponent } from './pages/confirmacion-compra/confirmacioncompra.component';
import { ConfirmacionExitosaComponent } from './pages/confirmacion-exitosa/confirmacion-exitosa.component';
import { HistorialComprasComponent } from './pages/historial-compras/historial-compras.component';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';

export const routes: Routes = [
  { path: "inicio", component: HomeComponent },
  { path: "profile", component: ProfileComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "carrito", component: CarritoComponent },
  { path: "edit", component: EditProfileComponent },
  { path: "forgot", component: ForgotPasswordComponent },
  { path: 'evento/:id', component: EventoComponent },
  { path: 'evento-form', component: EventoFormComponent }, // Formulario base
  { path: 'evento-form/create', component: EventoFormComponent }, // Crear nuevo evento
  { path: 'evento-form/edit/:id', component: EventoFormComponent }, // Editar evento
  { path: 'evento-form/view/:id', component: EventoFormComponent }, // Ver detalles de evento
  { path: 'descuentos', component: DescuentosComponent },
  { path: "reco", component: RecomendacionesComponent },
  { path: 'confirmacion-compra', component: ConfirmacionCompraComponent },
  { path: 'confirmacion-exitosa', component: ConfirmacionExitosaComponent },
  { path: 'historial-compras', component: HistorialComprasComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/inicio' }
];
