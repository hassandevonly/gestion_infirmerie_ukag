import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Approvisionnements } from 'src/app/models/medicaments/approvisionnements';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AppromedocsService } from 'src/app/services/approvisionnements/appromedocs.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-update-medicament',
  templateUrl: './update-medicament.component.html',
  styleUrls: ['./update-medicament.component.scss']
})
export class UpdateMedicamentComponent {

  realtimeData: Medicaments[] = [];
  approRealtimeData: Approvisionnements[] =[]
  filteredData: Approvisionnements[] = [];
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false

  constructor(
    private realMedicament: MedicamentsService,
    private approMedocs: AppromedocsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private realMedoc: MedicamentsService
  ) {

  }

  ngOnInit(): void {
    this.getApproMedocs();
  }

  getApproMedocs(){
    this.approMedocs.getAllMedicaments().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.approRealtimeData = data.sort((a, b) => a.nom_produit.localeCompare(b.nom_produit)); // Sort alphabetically
        this.filteredData = [...this.approRealtimeData];
        this.totalData = data.length;
        console.log("Nombre total de données: ", this.totalData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des medicaments:', err);
      }
    });
  }

  // getAllMedicament() {
  //   this.realMedicament.getAllMedicaments().subscribe({
  //     next: (data) => {
  //       console.log("Data reçue: ", data);
  //       this.realtimeData = data.sort((a, b) => a.nom_commercial.localeCompare(b.nom_commercial)); // Sort alphabetically
  //       this.filteredData = [...this.realtimeData];
  //       this.totalData = data.length;
  //       console.log("Nombre total de données: ", this.totalData);
  //     },
  //     error: (err) => {
  //       console.error('Erreur lors de la récupération des medicaments:', err);
  //     }
  //   });
  // }

  filterMedicaments(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.approRealtimeData
      .filter(medoc =>
        (medoc.nom_produit?.toLowerCase().includes(term) || '')
      )
      .sort((a, b) => (a.nom_produit ?? '').localeCompare(b.nom_produit ?? '')); // Sort alphabetically
  }

  editMedicament(id: string) {
    this.router.navigate(['dashboard/medicaments/edit-medicament/' + id]);
  }

  deleteMedicament(medoc: Approvisionnements): void {
    if (!medoc.id) {
      console.error('ID du medicament manquant');
      return;
    }

    this.approMedocs.deleteMedicament(medoc.id)
      .then(() => {
        console.log('Medicament supprimé avec succès');
      })
      .catch(error => {
        console.error('Erreur lors de la suppression:', error);
      });

  }
}
