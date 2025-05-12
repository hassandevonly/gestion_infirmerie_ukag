import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
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
  filteredData: Medicaments[] = [];
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];



  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private realMedoc: MedicamentsService,
    private fb : FormBuilder
  ) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        console.log('Consultation ID récupéré:', id);
        this.realMedoc.getMedicamentById(id).subscribe(data => {
          console.log("Data unique: ", data);
          this.realtimeData = data;
          console.log("Realtime Data dans edit: ", this.realtimeData);
          if (this.realtimeData) {
            this.medocForm = this.fb.group({
              nom_commercial: ['', Validators.required],
              nom_generique: ['', Validators.required],
              categorie: ['', Validators.required],
              forme: ['', Validators.required],
              dosage: ['', Validators.required],
              quantite_dispo: ['', Validators.required],
              seuil_minimum: ['', Validators.required],
              date_peremption: ['', Validators.required],
            });
            this.medocForm.setValue({
              nom_commercial: this.realtimeData.nom_commercial,
              nom_generique: this.realtimeData.nom_generique,
              categorie: this.realtimeData.categorie,
              forme: this.realtimeData.forme,
              dosage: this.realtimeData.dosage,
              quantite_dispo: this.realtimeData.quantite_dispo,
              seuil_minimum: this.realtimeData.seuil_minimum,
              date_peremption: this.realtimeData.date_peremption,
            });
          }
        });
      }
    });

  }

  ngOnInit(): void {

  }

  onSubmit() {
    if (this.medocForm.valid) {
      console.log("La quantite : " + this.medocForm.value.quantite);

      const updatedConsultation: Medicaments = {
        nom_commercial: this.medocForm.value.nom_commercial,
              nom_generique: this.medocForm.value.nom_generique,
              categorie: this.medocForm.value.categorie,
              forme: this.medocForm.value.forme,
              dosage: this.medocForm.value.dosage,
              quantite_dispo: this.medocForm.value.quantite_dispo,
              seuil_minimum: this.medocForm.value.seuil_minimum,
              date_peremption: this.medocForm.value.date_peremption,
      };
      console.log(this.id);

      this.realMedoc.updateMedicament(this.id, updatedConsultation)
        .then(() => {
          console.log('Produit mis à jour avec succès');
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
