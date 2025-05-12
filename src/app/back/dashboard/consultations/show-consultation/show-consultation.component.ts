import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import { ConsultationService } from 'src/app/services/consultation/realtime/consultation.service';

@Component({
  selector: 'app-show-consultation',
  templateUrl: './show-consultation.component.html',
  styleUrls: ['./show-consultation.component.scss']
})
export class ShowConsultationComponent {
  selectedConsultation$!: Observable<Consultations>
  realtimeData!: Consultations | null;

  constructor(private consultService: ConsultationService, private router: ActivatedRoute) {
    this.router.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        console.log('Consultation ID récupéré:', id); // Vérifie si l'ID est bien récupéré
        consultService.getConsultationById(id).subscribe(data => {
          console.log("Data unique: ", data);
          this.realtimeData = data;
          console.log("Realtime Data: ", this.realtimeData);
        })
        
      }
    });
  }

  ngOnInit(): void {
    
    // this.consultation$ = this.consultationsService.getConsultationById(this.selectedConsultationId);
    // this.consultation$.subscribe(
    //   (consultation) => {
    //     console.log('Selected consultation:', consultation);
    //   },
    //   (error) => {
    //     console.error('Error fetching consultation by ID:', error);
    //   }
    // );
  }

}
