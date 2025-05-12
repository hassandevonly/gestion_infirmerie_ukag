import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-detail-medicaments',
  templateUrl: './detail-medicaments.component.html',
  styleUrls: ['./detail-medicaments.component.scss']
})
export class DetailMedicamentsComponent {
  selectedConsultation$!: Observable<Medicaments>
  realtimeData!: Medicaments | null;
  userID = ''
  currentUserData?: Observable<Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  medecinViewMenu: boolean = false
  logistiqueViewMenu: boolean = false
  gestionnaireViewMenu: boolean = false

  constructor(
    private medicamentService: MedicamentsService,
    private router: ActivatedRoute,
    private authService: AuthService
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
    this.router.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        console.log('Consultation ID récupéré:', id); // Vérifie si l'ID est bien récupéré
        medicamentService.getMedicamentById(id).subscribe(data => {
          console.log("Data unique: ", data);
          this.realtimeData = data;
          console.log("Realtime Data: ", this.realtimeData);
        })

      }
    });
  }

  ngOnInit(): void {
  }

}
