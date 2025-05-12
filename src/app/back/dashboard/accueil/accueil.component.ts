import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {
  onsultations$!: Observable<Consultations[]>;
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  voirDashboard = false;
  nom_complet = '';
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false
  realtimeData: Consultations[] = [];
  realtimeDatas: Consultations[] = [];
  filteredData: Consultations[] = [];
  filterMedoc: Medicaments[] = []
  dataMedoc: Medicaments[] =[]
  totalData = 0
  totalMedoc = 0
  searchTerm: string = '';
  logoUrl = 'img/Logo.jpg';


  constructor(
    private authService: AuthService,
    private route: Router,
    private router: ActivatedRoute,
    private realConsult: ConsultationService,
    private realMedicament: MedicamentsService

  ) {
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
              this.nom_complet = data.nom + ' ' + data.prenom;
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
    this.getAllConsultationsSorted()
    this.getAllMedicament()
  }

  newConsultation() {
    this.route.navigate(['/dashboard/consultation/new-consultation']);
  }

  onLogout() {
    this.authService.deconnexion().then(() => {
      this.route.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de la déconnexion', error);
    })
  }

  getAllConsultationsSorted() {
    this.realConsult.getAllConsultations().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.realtimeData = data.sort((a, b) => a.nom.localeCompare(b.nom)); // Sort alphabetically by patient name
        this.filteredData = [...this.realtimeData];
        this.totalData = data.length;
        console.log("Nombre total de consultations: ", this.totalData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des consultations:', err);
      }
    });
  }

  filterConsultations(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.realtimeData
      .filter(consult =>
        (consult.nom?.toLowerCase().includes(term) || '') ||
        (consult.motif ?? '').toLowerCase().includes(term) ||
        (consult.matricule ?? '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nom ?? '').localeCompare(b.nom ?? '')); // Sort alphabetically by patient name
  }

  getAllMedicament() {
    this.realMedicament.getAllMedicaments().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.dataMedoc = data.sort((a, b) => a.nom_commercial.localeCompare(b.nom_commercial)); // Sort alphabetically
        this.filterMedoc = [...this.dataMedoc];
        this.totalMedoc = data.length;
        console.log("Nombre total de données: ", this.totalData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des medicaments:', err);
      }
    });
  }

  filterMedicaments(): void {
    const term = this.searchTerm.toLowerCase();
    this.filterMedoc = this.dataMedoc
      .filter(medoc =>
        (medoc.nom_commercial?.toLowerCase().includes(term) || '') ||
        (medoc.categorie ?? '').toLowerCase().includes(term) ||
        (medoc.forme ?? '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nom_commercial ?? '').localeCompare(b.nom_commercial ?? '')); // Sort alphabetically
  }

  viewConsultation(consult: Consultations): void {
    console.log(consult.id);
    this.route.navigate(['dashboard/consultations/show-consultation', consult.id]);
  }

  editConsultation(id: string) {
    this.route.navigate(['dashboard/consultations/edit-consultation/' + id]);
  }

  deleteConsultation(consult: Consultations): void {
    if (!consult.id) {
      console.error('ID de consultation manquant');
      return;
    }

    this.realConsult.deleteConsultation(consult.id)
      .then(() => {
        console.log('Consultation supprimée avec succès');
      })
      .catch(error => {
        console.error('Erreur lors de la suppression:', error);
      });

  }

  imprimerConsultation(consult: Consultations): void {
    const logoUrl = 'assets/Logo.jpg'; // Corrected path relative to the public folder

    const contenu = `
      <html>
        <head>
          <style>
            body { font-family: Arial; margin: 40px; }
            .header { text-align: center; }
            .logo { width: 100px; }
            .content { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img class="logo" src="${logoUrl}" alt="Logo" />
            <h2>Fiche de consultation</h2>
          </div>
          <div class="content">
            <p><strong>Nom :</strong> ${consult.nom}</p>
            <p><strong>Date :</strong> ${consult.dateConsultation}</p>
            <p><strong>Motif :</strong> ${consult.motif}</p>
            <!-- Ajoute d'autres champs ici si besoin -->
          </div>
        </body>
      </html>
    `;

    const fenetre = window.open('', '_blank', 'height=600,width=800');
    if (fenetre) {
      fenetre.document.write(contenu);
      fenetre.document.close();
      setTimeout(() => {
        fenetre.print();
        fenetre.close();
      }, 500);
    }
  }
}
