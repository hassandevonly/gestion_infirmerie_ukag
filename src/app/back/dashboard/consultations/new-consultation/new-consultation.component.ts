import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsultationsService } from 'src/app/services/consultation/consultations.service';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';
import { UtilisateursService } from 'src/app/services/utilisateurs/utilisateurs.service';

@Component({
  selector: 'app-new-consultation',
  templateUrl: './new-consultation.component.html',
  styleUrls: ['./new-consultation.component.scss']
})
export class NewConsultationComponent {
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  consultForm!: FormGroup;

  realtimeData: Medicaments[] = [];
  filteredData: Medicaments[] = [];
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];
  medecins: Utilisateurs[] = [];



  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationsService,
    private afStore: AngularFirestore,
    private realConsult: ConsultationService,
    private router: ActivatedRoute,
    private authService: AuthService,
    private realMedicament: MedicamentsService,
    private usersService: UtilisateursService

  ) {
    this.consultForm = this.fb.group({
      nom: ['', Validators.required], // Champ obligatoire
      prenom: ['', Validators.required], // Valeur par défaut: aujourd'hui
      genre: ['', Validators.required],
      age: ['', Validators.required],
      typePatient: ['', Validators.required],
      contact: ['', Validators.required],
      motif: ['', Validators.required],
      diagnostic: ['', Validators.required],
      traitement: ['', Validators.required],
      praticien: ['', Validators.required],
      quantite: [''],
      matricule: [''],
    });

    const user = this.router.snapshot.data['user'];
    if (user && user.uid) {
      this.userID = user.uid;
      console.log("ID récupéré : " + this.userID);

      this.currentUserData = this.authService.getFilteredUserById(this.userID);
      if (this.currentUserData) {
        this.currentUserData.subscribe(
          data => {
            if (data) {
              console.log("Données utilisateur récupérées : ", data);
              this.userData = data;
            } else {
              console.error("Aucune donnée utilisateur trouvée pour l'ID : " + this.userID);
            }
          },
          error => {
            console.error("Erreur lors de la récupération des données utilisateur : ", error);
          }
        );
      }
    } else {
      console.error("L'utilisateur ou l'ID est null.");
    }
  }

  ngOnInit(): void {
    // this.initForm(); // Initialisation du formulaire
    this.getAllConsultation();
    this.getAllMedicaments();
    this.usersService.getUtilisateursMedecins().subscribe(data => {
      this.medecins = data;
      console.log("Voici les comptes medecin : " + this.medecins);

    });
  }

  getAllConsultation() {
    this.realConsult.getAllConsultations().subscribe({
      next: (consultations) => {
        console.log("Consultations avec IDs: ", consultations);
        // Chaque consultation aura maintenant un id et toutes ses propriétés
      }
    });
  }

  //Initialisation du formulaire avec FormBuilder
  // initForm() {

  // }

  //Fonction pour soumettre le formulaire
  onSubmit() {
    if (this.consultForm.valid) {
      const newConsultation: Consultations = {
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
        quantite: this.consultForm.value.quantite,
        nom_medecin: this.userData?.nom + " " + this.userData?.prenom,
        contact: this.userData?.contact,
        email: this.userData?.email

      };

      if (this.consultForm.value.traitement == "Aucune prescription") {
        newConsultation.quantite = '0';

      }
      if (this.consultForm.value.typePatient == "Enseignant" || this.consultForm.value.typePatient == "Personnel" || this.consultForm.value.typePatient == "Autres") {
        newConsultation.matricule = ""
      }

      console.log("Consultation soumise : ", newConsultation);


      this.realConsult.addConsultation(newConsultation)
        .then(() => {
          console.log('Consultation ajoutée avec succès');
          this.formReset();
        })
        .catch(err => {
          console.error('Erreur lors de l\'ajout:', err);
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
        this.realtimeData = data.sort((a, b) => a.nom_commercial.localeCompare(b.nom_commercial)); // Sort alphabetically
        this.filteredData = [...this.realtimeData];
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
    this.filteredData = this.realtimeData
      .filter(medoc =>
        (medoc.nom_commercial?.toLowerCase().includes(term) || '') ||
        (medoc.categorie ?? '').toLowerCase().includes(term) ||
        (medoc.forme ?? '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nom_commercial ?? '').localeCompare(b.nom_commercial ?? '')); // Sort alphabetically
  }

}
