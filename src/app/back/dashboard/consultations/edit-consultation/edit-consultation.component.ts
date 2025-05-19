import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-edit-consultation',
  templateUrl: './edit-consultation.component.html',
  styleUrls: ['./edit-consultation.component.scss']
})
export class EditConsultationComponent {
  selectedConsultation$!: Observable<Consultations | undefined>;
  consultForm!: FormGroup;
  tableau!: Consultations;
  consultation: any;
  id: string = '';
  realtimeData!: Consultations | null;
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false
  realtimeDatas: Medicaments[] = [];
  filteredData: Medicaments[] = [];
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];

  constructor(
    private fb: FormBuilder,
    private afStore: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private realConsult: ConsultationService,
    private db: AngularFireDatabase,
    private realMedicament: MedicamentsService,
  ) {
    const user = this.route.snapshot.data['user'];
    if (user && user.uid) {
      this.userID = user.uid;
      console.log("ID récupéré : " + this.userID);

      this.currentUserData = this.authService.getFilteredUserById(this.userID);
      if (this.currentUserData) {
        this.currentUserData.subscribe(
          data => {
            if (data) {
              console.log("Données utilisateur récupérées : ", data);
              if (data.typeCompte) { // Assuming 'typeCompte' is the intended property
                console.log("Type de compte : ", data.typeCompte);
                if (data.typeCompte === 'Logistique') {
                  this.logistiqueViewMenu = true;
                  this.gestionnaireViewMenu = true
                }else if(data.typeCompte === 'Gestionnaire'){
                  this.gestionnaireViewMenu = true
                }else if(data.typeCompte === 'Medecin'){
                  this.medecinViewMenu = true
                  this.gestionnaireViewMenu = true
                }
              } else {
                console.error("Propriété 'typeCompte' manquante dans les données utilisateur.");
              }
            } else {
              console.error("Aucune donnée utilisateur trouvée pour l'ID : " + this.userID);
            }
          },
          error => {
            console.error("Erreur lors de la récupération des données utilisateur : ", error);
          }
        );
      } else {
        console.error("currentUserData est null ou undefined.");
      }
    } else {
      console.error("L'utilisateur ou l'ID est null.");
    }
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        console.log('Consultation ID récupéré:', id);
        this.realConsult.getConsultationById(id).subscribe(data => {
          console.log("Data unique: ", data);
          this.realtimeData = data;
          console.log("Realtime Data dans edit: ", this.realtimeData);
          if (this.realtimeData) {
            this.consultForm = this.fb.group({
              nom: ['', Validators.required],
              prenom: ['', Validators.required],
              genre: ['', Validators.required],
              age: ['', Validators.required],
              typePatient: ['', Validators.required],
              matricule: ['', Validators.required],
              contact: ['', Validators.required],
              motif: ['', Validators.required],
              diagnostic: ['', Validators.required],
              traitement: ['', Validators.required],
              praticien: ['', Validators.required],
              quantite: ['', Validators.required]
            });
            this.consultForm.setValue({
              nom: this.realtimeData.nom,
              prenom: this.realtimeData.prenom,
              genre: this.realtimeData.sexe,
              age: this.realtimeData.age,
              matricule: this.realtimeData.matricule,
              contact: this.realtimeData.telephone,
              motif: this.realtimeData.motif,
              diagnostic: this.realtimeData.diagnostic,
              traitement: this.realtimeData.traitement,
              quantite: this.realtimeData.quantite
            });
          }
        });
      }
    });
  }

  ngOnInit(): void {
   
    this.getAllMedicaments()
  }

  loadConsultation(id: string) {
    this.realConsult.getConsultationById(id).subscribe(data => {
      if (data) {
        console.log("Data dans edit: ", data);
      }
    });
  }

  onSubmit() {
    if (this.consultForm.valid) {
      console.log("La quantite : " + this.consultForm.value.quantite);

      const updatedConsultation: Consultations = {
        nom: this.consultForm.value.nom,
        prenom: this.consultForm.value.prenom,
        matricule: this.consultForm.value.matricule,
        age: this.consultForm.value.age,
        typePatient: this.consultForm.value.typePatient,
        sexe: this.consultForm.value.genre,
        telephone: this.consultForm.value.contact,
        motif: this.consultForm.value.motif,
        dateConsultation: new Date().toISOString().substring(0, 10),
        heureConsultation: new Date().toISOString().substring(11, 16),
        diagnostic: this.consultForm.value.diagnostic,
        traitement: this.consultForm.value.traitement,
        praticien: this.consultForm.value.praticien,
        quantite: this.consultForm.value.quantite
      };
      console.log(this.id);

      this.realConsult.updateConsultation(this.id, updatedConsultation)
        .then(() => {
          console.log('Consultation mise à jour avec succès');
          this.router.navigate(['/dashboard/consultation/all-consultation']);
        })
        .catch(err => {
          console.error('Erreur lors de la mise à jour:', err);
        });
    }
  }

  formReset() {
    this.consultForm.reset();
  }

  getAllMedicaments() {
    this.realMedicament.getAllMedicaments().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.realtimeDatas = data.sort((a, b) => a.nom_commercial.localeCompare(b.nom_commercial)); // Sort alphabetically
        this.filteredData = [...this.realtimeDatas];
        this.totalData = data.length;
        console.log("Nombre total de données: ", this.totalData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des medicaments:', err);
      }
    });
  }

  filterMedicaments(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.realtimeDatas
      .filter(medoc =>
        (medoc.nom_commercial?.toLowerCase().includes(term) || '') ||
        (medoc.categorie ?? '').toLowerCase().includes(term) ||
        (medoc.forme ?? '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nom_commercial ?? '').localeCompare(b.nom_commercial ?? '')); // Sort alphabetically
  }

  onLogout() {
    this.authService.deconnexion().then(() => {
      this.router.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de la déconnexion', error);
    })
  }
}
