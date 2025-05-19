import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './back/auth/login/login.component';
import { LandingPageComponent } from './back/auth/landing-page/landing-page.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment.development';
import { InscriptionComponent } from './back/auth/inscription/inscription.component';
import { RegisterComponent } from './back/auth/register/register.component';
import { ForgotPasswordComponent } from './back/auth/forgot-password/forgot-password.component';
import { AccueilComponent } from './back/dashboard/accueil/accueil.component';
import { AllConsultationsComponent } from './back/dashboard/consultations/all-consultations/all-consultations.component';
import { EditConsultationComponent } from './back/dashboard/consultations/edit-consultation/edit-consultation.component';
import { NewConsultationComponent } from './back/dashboard/consultations/new-consultation/new-consultation.component';
import { ShowConsultationComponent } from './back/dashboard/consultations/show-consultation/show-consultation.component';
import { SidebarComponent } from './back/dashboard/includes/sidebar/sidebar.component';
import { DetailMedicamentsComponent } from './back/dashboard/medicaments/detail-medicaments/detail-medicaments.component';
import { ListMedicamentComponent } from './back/dashboard/medicaments/list-medicament/list-medicament.component';
import { EditMedicamentComponent } from './back/dashboard/medicaments/edit-medicament/edit-medicament.component';
import { NewMedicamentComponent } from './back/dashboard/medicaments/new-medicament/new-medicament.component';
import { UpdateMedicamentComponent } from './back/dashboard/medicaments/update-medicament/update-medicament.component';
import { FooterComponent } from './back/dashboard/includes/footer/footer.component';
import { HistoMedicamentComponent } from './back/dashboard/medicaments/histo-medicament/histo-medicament.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingPageComponent,
    InscriptionComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    AccueilComponent,
    AllConsultationsComponent,
    EditConsultationComponent,
    NewConsultationComponent,
    ShowConsultationComponent,
    SidebarComponent,
    DetailMedicamentsComponent,
    ListMedicamentComponent,
    EditMedicamentComponent,
    NewMedicamentComponent,
    UpdateMedicamentComponent,
    FooterComponent,
    HistoMedicamentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    FormsModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
