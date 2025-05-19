import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Approvisionnements } from 'src/app/models/medicaments/approvisionnements';
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
