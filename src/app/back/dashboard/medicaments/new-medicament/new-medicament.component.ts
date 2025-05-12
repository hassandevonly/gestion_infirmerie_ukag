import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-new-medicament',
  templateUrl: './new-medicament.component.html',
  styleUrls: ['./new-medicament.component.scss']
})
export class NewMedicamentComponent {
  medocForm!: FormGroup
  userID = ''
  currentUserData?: Observable <Utilisateurs | null>
  userData!: Utilisateurs | undefined;

  constructor(
    private fb: FormBuilder,
    private medocService: MedicamentsService,
    private authService: AuthService,
    private router: ActivatedRoute
  ) {
    this.medocForm = this.fb.group({
      nom_commercial: ['', Validators.required],
      nom_generique: ['', Validators.required],
      categorie: ['', Validators.required],
      forme: ['', Validators.required],
      dosage: ['', Validators.required],
      quantite_dispo: ['', Validators.required],
      seuil_minimum: ['', Validators.required],
      date_peremption: ['', Validators.required],
    })

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

  }

  onSubmit() {
    if (this.medocForm.valid) {
      const newMedoc: Medicaments = {
        nom_commercial: this.medocForm.value.nom_commercial,
        nom_generique: this.medocForm.value.nom_generique,
        categorie: this.medocForm.value.categorie,
        forme: this.medocForm.value.forme,
        dosage: this.medocForm.value.dosage,
        quantite_dispo: this.medocForm.value.quantite_dispo,
        seuil_minimum: this.medocForm.value.seuil_minimum,
        date_peremption: this.medocForm.value.date_peremption,
        date_entree_stock: new Date().toISOString(),
        nom_fournisseur: this.userData?.nom + ' ' + this.userData?.prenom,
        contact: this.userData?.contact,
        adresse_email: this.userData?.email

        // ... Autres champs requis
      }
      // Envoi du nouveau médicament à la base de données
      this.medocService.addMedicament(newMedoc)
        .then(() => {
          this.formReset();
        })
    }

  }

  formReset() {
    this.medocForm.reset();
  }

}
