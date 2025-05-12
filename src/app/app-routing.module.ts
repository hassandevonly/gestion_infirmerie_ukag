import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './back/auth/login/login.component';
import { InscriptionComponent } from './back/auth/inscription/inscription.component';
import { ForgotPasswordComponent } from './back/auth/forgot-password/forgot-password.component';
import { AllConsultationsComponent } from './back/dashboard/consultations/all-consultations/all-consultations.component';
import { NewConsultationComponent } from './back/dashboard/consultations/new-consultation/new-consultation.component';
import { ShowConsultationComponent } from './back/dashboard/consultations/show-consultation/show-consultation.component';
import { EditConsultationComponent } from './back/dashboard/consultations/edit-consultation/edit-consultation.component';
import { AccueilComponent } from './back/dashboard/accueil/accueil.component';
import { NewMedicamentComponent } from './back/dashboard/medicaments/new-medicament/new-medicament.component';
import { ListMedicamentComponent } from './back/dashboard/medicaments/list-medicament/list-medicament.component';
import { DetailMedicamentsComponent } from './back/dashboard/medicaments/detail-medicaments/detail-medicaments.component';
import { UpdateMedicamentComponent } from './back/dashboard/medicaments/update-medicament/update-medicament.component';
import { EditMedicamentComponent } from './back/dashboard/medicaments/edit-medicament/edit-medicament.component';
import { FirebaseUserResolverService } from './services/resolver/firebase-user-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard/home', component: AccueilComponent,resolve: {user: FirebaseUserResolverService}},
  { path: 'inscription', component: InscriptionComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard/consultation/all-consultation', component: AllConsultationsComponent },
  { path: 'dashboard/consultation/new-consultation', component: NewConsultationComponent, resolve: {user: FirebaseUserResolverService}},
  { path: 'dashboard/consultations/show-consultation/:id', component: ShowConsultationComponent },
  { path: 'dashboard/consultations/edit-consultation/:id', component: EditConsultationComponent, resolve: {user: FirebaseUserResolverService} },
  { path: 'dashboard/medicaments/new-medicament', component: NewMedicamentComponent, resolve: {user: FirebaseUserResolverService}},
  { path: 'dashboard/medicaments/list-medicament', component: ListMedicamentComponent},
  { path: 'dashboard/medicaments/detail-medicament/:id', component: DetailMedicamentsComponent, resolve: {user: FirebaseUserResolverService}},
  { path: 'dashboard/medicaments/update-medicament', component: UpdateMedicamentComponent},
  { path: 'dashboard/medicaments/edit-medicament/:id', component: EditMedicamentComponent, resolve: {user: FirebaseUserResolverService} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
