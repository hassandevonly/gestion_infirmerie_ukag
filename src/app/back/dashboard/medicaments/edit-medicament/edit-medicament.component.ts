import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Approvisionnements } from 'src/app/models/medicaments/approvisionnements';
import { HistoApprovisionnement } from 'src/app/models/medicaments/histo-approvisionnement';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AppromedocsService } from 'src/app/services/approvisionnements/appromedocs.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-edit-medicament',
  templateUrl: './edit-medicament.component.html',
  styleUrls: ['./edit-medicament.component.scss']
})
export class EditMedicamentComponent {
  selectedConsultation$!: Observable<Consultations | undefined>;
  medocForm!: FormGroup;
  tableau!: Consultations;
  consultation: any;
  id: string = '';
  realtimeData!: Medicaments | null;
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false
  realtimeDatas: Medicaments[] = [];
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];
  approRealtimeData!: Approvisionnements | null;
  filteredData: Approvisionnements[] = [];



  constructor(
    private authService: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private realMedoc: MedicamentsService,
    private approMedoc: AppromedocsService,
    private fb: FormBuilder
  ) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        console.log('Consultation ID récupéré:', id);
        this.approMedoc.getMedicamentById(id).subscribe(data => {
          console.log("Data unique: ", data);
          this.approRealtimeData = data;
          console.log("Realtime Data dans edit: ", this.approRealtimeData);
          if (this.approRealtimeData) {
            this.medocForm = this.fb.group({
              nom_produit: ['', Validators.required],
              dosage: ['', Validators.required],
              quantite_total: ['', Validators.required],
              seuil_minimum: ['', Validators.required],
              date_peremption: ['', Validators.required],
            });
            this.medocForm.setValue({
              nom_produit: this.approRealtimeData.nom_produit,
              dosage: this.approRealtimeData.dosage,
              quantite_total: this.approRealtimeData.quantite_total,
              date_peremption: this.approRealtimeData.date_peremption,
              seuil_minimum: this.approRealtimeData.seuil_minimum,
            });
          }
        });
      }
    });
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

  }

  onSubmit() {
    if (this.medocForm.valid) {
      console.log("La quantite : " + this.medocForm.value.quantite);

      const updatedMedicaments: Approvisionnements = {
        nom_produit: this.medocForm.value.nom_produit,
        dosage: this.medocForm.value.dosage,
        quantite_total: this.medocForm.value.quantite_total,
        date_peremption: this.medocForm.value.date_peremption,
        seuil_minimum: this.medocForm.value.seuil_minimum,
      };
      console.log(this.id);

      this.approMedoc.updateMedicament(this.id, updatedMedicaments)
        .then(() => {
          console.log('Produit mis à jour avec succès');
          const histoAppro: HistoApprovisionnement = {
            nom_utilisateur: this.userData?.nom + " " + this.userData?.prenom,
            date_action: new Date().toISOString(),
            type_action: "Re-approvisionnement",
            texte_sur_action: "Mise à jour du produit " + this.medocForm.value.nom_produit + ", Dosage : " + this.medocForm.value.dosage + ", Quantité : " + this.medocForm.value.quantite_total
          }
          this.db.list('histo-approvisionnement').push(histoAppro)
            .then(() => {
              console.log("Historique enregistré avec succès");
            })
            .catch(err => {
              console.error("❌ Erreur lors de l'ajout :", err);
            })
          this.router.navigate(['/dashboard/medicaments/list-medicament']);
        })
        .catch(err => {
          console.error('Erreur lors de la mise à jour:', err);
        });
    }
  }


  onLogout() {
    this.authService.deconnexion().then(() => {
      this.router.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de la déconnexion', error);
    })
  }

}
