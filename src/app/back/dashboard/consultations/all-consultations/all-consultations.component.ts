import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
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

  constructor(private consultationService: ConsultationsService, private router: Router, public cdReg: ChangeDetectorRef, private realConsult: ConsultationService) {
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


}
