import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { HistoApprovisionnement } from 'src/app/models/medicaments/histo-approvisionnement';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';
import { HistoApprovisionnementsService } from 'src/app/services/histo-approvisionnements/histo-approvisionnements.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';
import { UtilisateursService } from 'src/app/services/utilisateurs/utilisateurs.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {
  @ViewChild('zoneAImprimer') zoneAImprimer!: ElementRef;
  voirOrdonance : boolean = false
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
  filterHisto: HistoApprovisionnement[] = []
  dataHisto: HistoApprovisionnement[] = []
  dataMedoc: Medicaments[] = []
  totalData = 0
  totalMedoc = 0
  totalHisto = 0
  searchTerm: string = '';
  logoUrl = 'img/Logo.jpg';
  medecins: Utilisateurs[] = [];
  today: string = new Date().toLocaleDateString();
  histoAppro: HistoApprovisionnement[] = []
  role : string | null = null


  constructor(
    private authService: AuthService,
    private route: Router,
    private router: ActivatedRoute,
    private realConsult: ConsultationService,
    private realMedicament: MedicamentsService,
    private histoApprovisionnement: HistoApprovisionnementsService,
    private usersService: UtilisateursService

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
    this.getHistoApprovisionnement()
    // Si le rôle est un Observable
    this.authService.getUserRole().pipe(first()).subscribe(role => {
      this.role = role;
      console.log('Rôle utilisateur :', this.role);
    });
    this.usersService.getUtilisateursMedecins().subscribe(data => {
      this.medecins = data;
      console.log("Voici les comptes medecin : " + this.medecins);

    });
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

  getHistoApprovisionnement(){
    this.histoApprovisionnement.getHistoApprovisionnement().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.dataHisto = data.sort((a, b) => a.nom_utilisateur.localeCompare(b.nom_utilisateur)); // Sort alphabetically
        this.filterHisto = [...this.dataHisto];
        this.totalHisto = data.length;
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

  // imprimerConsultation(consult: Consultations): void {
  //   const contenu = this.zoneAImprimer.nativeElement.innerHTML;
  //   const logoUrl = `${location.origin}/assets/img/Logo.jpg`;

  //   const fenetre = window.open('', '', 'height=700,width=900');
  //   if (fenetre) {
  //     fenetre.document.write(`
  //       <html>
  // <head>
  //   <title>Ordonnance Médicale</title>
  //   <style>
  //     * {
  //       box-sizing: border-box;
  //     }

  //     body {
  //       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  //       padding: 40px;
  //       color: #2e2e2e;
  //       background-color: white;
  //       line-height: 1.6;
  //     }

  //     .header {
  //       display: flex;
  //       align-items: center;
  //       margin-bottom: 30px;
  //       border-bottom: 2px solid #444;
  //       padding-bottom: 10px;
  //     }

  //     .logo {
  //       max-width: 100px;
  //       height: auto;
  //       margin-right: 20px;
  //     }

  //     .clinic-info {
  //       flex: 1;
  //     }

  //     .clinic-info h2 {
  //       margin: 0;
  //       font-size: 22px;
  //       color: #007b9a;
  //     }

  //     .clinic-info p {
  //       margin: 2px 0;
  //       font-size: 14px;
  //     }

  //     .patient-info {
  //       margin: 30px 0;
  //       font-size: 16px;
  //     }

  //     .patient-info p {
  //       margin: 6px 0;
  //     }

  //     h3 {
  //       margin-top: 30px;
  //       color: #007b9a;
  //       border-bottom: 1px dashed #007b9a;
  //       padding-bottom: 4px;
  //     }

  //     .ordonnance-list {
  //       list-style: disc;
  //       padding-left: 25px;
  //       font-size: 15px;
  //     }

  //     .signature {
  //       margin-top: 50px;
  //       font-size: 16px;
  //     }

  //     .signature p {
  //       margin: 5px 0;
  //     }
  //   </style>
  // </head>
  // <body>

  //           <img src="${logoUrl}" alt="Logo" class="logo" />
  //           ${contenu}
  //         </body>
  //       </html>
  //     `);
  //     fenetre.document.close();
  //     fenetre.focus();
  //     fenetre.print();
  //     fenetre.close();
  //   }
  // }
  // imprimerConsultation(consultation: Consultations) {
  //   const imageUrl = window.location.origin + '/assets/img/Logo.jpg';
  
  //   const patient = consultation.nom || consultation.prenom || 'Inconnu';
  //   const date = consultation.dateConsultation || 'Date non précisée';
  //   const medecin = consultation.nom_medecin || 'Médecin inconnu';
  //   const traitements: string | string[] = consultation.traitement || ['Aucun traitement'];
  
  //   const printWindow = window.open('', '_blank');
  //   printWindow!.document.write(`
  //     <html>
  //       <head>
  //         <title>Ordonnance Médicale</title>
  //         <style>
  //           body {
  //             font-family: Arial, sans-serif;
  //             padding: 40px;
  //             color: #333;
  //           }
  //           .header {
  //             display: flex;
  //             align-items: center;
  //             margin-bottom: 30px;
  //             border-bottom: 2px solid #ccc;
  //             padding-bottom: 10px;
  //           }
  //           .logo {
  //             width: 100px;
  //             height: auto;
  //             margin-right: 20px;
  //             object-fit: contain;
  //           }
  //           .clinic-info h2 {
  //             margin: 0;
  //             font-size: 22px;
  //             color: #2c3e50;
  //           }
  //           .clinic-info p {
  //             margin: 2px 0;
  //             font-size: 14px;
  //             color: #555;
  //           }
  //           .ordonnance-section {
  //             margin-top: 30px;
  //           }
  //           .ordonnance-section h3 {
  //             font-size: 18px;
  //             color: #2980b9;
  //             border-bottom: 1px solid
  
  //             padding-bottom: 5px;
  //           }
  //           .ordonnance-list {
  //             list-style: disc;
  //             margin-left: 20px;
  //             margin-top: 10px;
  //           }
  //           .signature {
  //             margin-top: 60px;
  //             text-align: right;
  //             font-style: italic;
  //             color: #555;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="header">
  //           <img src="${imageUrl}" class="logo" alt="Logo Clinique" />
  //           <div class="clinic-info">
  //             <h2>Clinique Santé+</h2>
  //             <p>Adresse : 123 Rue de la Santé</p>
  //             <p>Téléphone : +224 620 00 00 00</p>
  //             <p>Email : contact@cliniquesanteplus.com</p>
  //           </div>
  //         </div>
  
  //         <div class="ordonnance-section">
  //           <h3>Ordonnance Médicale</h3>
  //           <p><strong>Patient :</strong> ${consultation.nom} ${consultation.prenom}</p>
  //           <p><strong>Date :</strong> ${consultation.dateConsultation}</p>
  
  //           <ul class="ordonnance-list">
  //             <li>${consultation.traitement}</li>
              
  //           </ul>
  //         </div>
  
  //         <div class="signature">
  //           <p>Dr. ${consultation.nom_medecin}</p>
  //           <p>Signature :</p>
  //         </div>
  
  //         <script>
  //           window.onload = function() {
  //             window.print();
  //             window.close();
  //           }
  //         </script>
  //       </body>
  //     </html>
  //   `);
  // }

  loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  imprimerConsultation(consultation: Consultations) {
    this.loadImageAsBase64('/assets/img/Logo.jpg').then((base64Logo) => {
      const patient = `${consultation.nom || ''} ${consultation.prenom || ''}`.trim() || 'Inconnu';
      const date = consultation.dateConsultation || 'Date non précisée';
      const medecin = consultation.nom_medecin || 'Médecin inconnu';
      const traitements = Array.isArray(consultation.traitement)
        ? consultation.traitement
        : [consultation.traitement || 'Aucun traitement'];
  
      const printWindow = window.open('', '', 'width=900,height=700');
  
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ordonnance Médicale</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 40px;
                  color: #333;
                }
                .header {
                  display: flex;
                  align-items: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #ccc;
                  padding-bottom: 10px;
                }
                .logo {
                  width: 100px;
                  height: auto;
                  margin-right: 20px;
                  object-fit: contain;
                }
                .clinic-info h2 {
                  margin: 0;
                  font-size: 22px;
                  color: #2c3e50;
                }
                .clinic-info p {
                  margin: 2px 0;
                  font-size: 14px;
                  color: #555;
                }
                .ordonnance-section {
                  margin-top: 30px;
                }
                .ordonnance-section h3 {
                  font-size: 18px;
                  color: #2980b9;
                  border-bottom: 1px solid #2980b9;
                  padding-bottom: 5px;
                }
                .ordonnance-list {
                  list-style: disc;
                  margin-left: 20px;
                  margin-top: 10px;
                }
                .signature {
                  margin-top: 60px;
                  text-align: right;
                  font-style: italic;
                  color: #555;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="${base64Logo}" class="logo" alt="Logo Clinique" />
                <div class="clinic-info">
                  <h2>Infirmerie de l'Université Kofi Annan de Guinée</h2>
                  <p>Adresse : Nongo C/Lambanyi</p>
                  <p>Téléphone : +224 620 00 00 00</p>
                  <p>Email : infirmerie@ukaguinee.org</p>
                </div>
              </div>
  
              <div class="ordonnance-section">
                <h3>Ordonnance Médicale</h3>
                <p><strong>Patient :</strong> ${patient}</p>
                <p><strong>Date :</strong> ${date}</p>
  
                <ul class="ordonnance-list">
                  ${traitements.map(traitement => `<li>${traitement}</li>`).join('')}
                </ul>
              </div>
  
              <div class="signature">
                <p>Dr. ${medecin}</p>
                <p>Signature :</p>
              </div>
            </body>
          </html>
        `);
  
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }).catch(error => {
      console.error('Erreur lors du chargement du logo :', error);
    });
  }
  
  histoApprovisionnements(){
    this.route.navigateByUrl('dashboard/medicaments/histo-approvisionnement')
  }
  
}
