import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsultationsService } from 'src/app/services/consultation/consultations.service';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';

@Component({
  selector: 'app-all-consultations',
  templateUrl: './all-consultations.component.html',
  styleUrls: ['./all-consultations.component.scss']
})
export class AllConsultationsComponent {
  consultations$!: Observable<Consultations[]>;
  realtimeData: Consultations[] = [];
  realtimeDatas: Consultations[] = [];
  filteredData: Consultations[] = [];
  totalData = 0
  searchTerm: string = '';
  consultations: Consultations[] = [];
  role!: string | null;

  constructor(private consultationService: ConsultationsService, private router: Router, public cdReg: ChangeDetectorRef, private realConsult: ConsultationService,public authService: AuthService) {
    this.authService.getUserRole().subscribe(userRole => {
      this.role = userRole;
    });
    this.consultations$ = this.consultationService.consultations$;
    this.consultationService.getConsultations().subscribe(data => {
      this.consultations = data;
      console.log(this.consultations);
    });
  }
  ngAfterViewChecked(): void {
    this.cdReg.detectChanges();
  }

  ngOnInit(): void {
    this.getAllConsultationsSorted();
  }

  getAllConsultation() {
    this.realConsult.getAllConsultations().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.realtimeData = data;
        this.totalData = data.length;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des consultations:', err);
      }
    });
  }

  viewConsultation(consult: Consultations): void {
    console.log(consult.id);
    this.router.navigate(['dashboard/consultations/show-consultation', consult.id]);
  }

  editConsultation(id: string) {
    this.router.navigate(['dashboard/consultations/edit-consultation/' + id]);
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


}
