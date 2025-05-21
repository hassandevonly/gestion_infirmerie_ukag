import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HistoApprovisionnement } from 'src/app/models/medicaments/histo-approvisionnement';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HistoApprovisionnementsService } from 'src/app/services/histo-approvisionnements/histo-approvisionnements.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-histo-medicament',
  templateUrl: './histo-medicament.component.html',
  styleUrls: ['./histo-medicament.component.scss']
})
export class HistoMedicamentComponent {
  realtimeData: HistoApprovisionnement[] = [];
  filteredData: HistoApprovisionnement[] = [];
  approRealtimeData: HistoApprovisionnement[] = []
  searchTerm: string = '';
  totalData = 0
  consultations: Medicaments[] = [];
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false
  timelinedView : boolean = true
  tableauView : boolean = false

  constructor(
    private realMedicament: MedicamentsService,
    private router: Router,
    private approMedocs: HistoApprovisionnementsService,
    private route: ActivatedRoute,
    private authService: AuthService
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
                } else if (data.typeCompte === 'Gestionnaire') {
                  this.gestionnaireViewMenu = true
                } else if (data.typeCompte === 'Medecin') {
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
  }

  ngOnInit(): void {
    this.getHistoAppro()
  }

  timelineView(){
    this.tableauView =false
    this.timelinedView = true
  }

  tableView(){
    this.timelinedView = false
    this.tableauView = true
    
  }





  getHistoAppro() {
    this.approMedocs.getHistoApprovisionnement().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.approRealtimeData = data.sort((a, b) => a.nom_utilisateur.localeCompare(b.nom_utilisateur)); // Sort alphabetically
        this.filteredData = [...this.approRealtimeData];
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
        (medoc.nom_utilisateur?.toLowerCase().includes(term) || '') ||
        (medoc.type_action ?? '').toLowerCase().includes(term) ||
        (medoc.texte_sur_action ?? '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nom_utilisateur ?? '').localeCompare(b.nom_utilisateur ?? '')); // Sort alphabetically
  }


}
