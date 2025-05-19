import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MedicamentsService } from 'src/app/services/medicaments/medicaments.service';

@Component({
  selector: 'app-new-medicament',
  templateUrl: './new-medicament.component.html',
  styleUrls: ['./new-medicament.component.scss']
})
export class NewMedicamentComponent {
  ajoutMedoc: boolean = false
  approvisionnerMedoc: boolean = false
  medocForm!: FormGroup
  approForm!: FormGroup 
  userID = ''
  currentUserData?: Observable <Utilisateurs | null>
  userData!: Utilisateurs | undefined;
  realtimeData: Medicaments[] = [];
  filteredData: Medicaments[] = [];
  searchTerm: string = '';
  totalData = 0
  dosagesDisponibles: string[] = [];


  constructor(
    private fb: FormBuilder,
    private medocService: MedicamentsService,
    private db: AngularFireDatabase,
    private authService: AuthService,
    private router: ActivatedRoute
  ) {
    this.medocForm = this.fb.group({
      nom_commercial: ['', Validators.required],
      nom_generique: ['', Validators.required],
      categorie: ['', Validators.required],
      forme: ['', Validators.required],
      dosage: ['', Validators.required],
    })

    this.approForm = fb.group({
      nom_produit: ['',Validators.required],
      dosage: ['', Validators.required],
      quantite_total: ['',Validators.required],
      seuil_minimum: ['', Validators.required],
      date_peremption: ['', Validators.required]
    })

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
              this.userData = data;
            } else {
              console.error("Aucune donnée utilisateur trouvée pour l'ID : " + this.userID);
            }
          },
          error => {
            console.error("Erreur lors de la récupération des données utilisateur : ", error);
          }
        );
      }
    } else {
      console.error("L'utilisateur ou l'ID est null.");
    }
  }

  ngOnInit(): void {
    this.approForm = this.fb.group({
      nom_produit: ['',Validators.required],
      dosage: ['', Validators.required],
      quantite_total: ['',Validators.required],
      seuil_minimum: ['', Validators.required],
      date_peremption: ['', Validators.required]
    })
    this.getAllMedicament()

    this.approForm.get('nom_produit')?.valueChanges.subscribe(nomProduit => {
      const produitSelectionne = this.filteredData.find(p => p.nom_commercial === nomProduit);
      this.dosagesDisponibles = produitSelectionne?.dosage ?? [];
    });
    
  }
  getAllApprovisionnements() {
    this.db.list('approvisionnement').snapshotChanges().subscribe(actions => {
      this.realtimeData = actions.map(a => {
        const key = a.key;
        const data = a.payload.val() as any;
        return { id: key, ...data };
      });
    });
  }

  onSubmit() {
    if (this.approForm.valid) {
      const formData = this.approForm.value;
      const nomProduit = formData.nom_produit;
      const dosage = formData.dosage;
      const quantite = Number(formData.quantite_total);
  
      if (isNaN(quantite)) {
        console.error("Quantité invalide !");
        alert("Veuillez entrer une quantité valide !");
        return;
      }
  
      // Utilisation d'un abonnement temporaire (prise de 1 seul résultat)
      const sub = this.db.list('approvisionnement', ref =>
        ref.orderByChild('nom_produit').equalTo(nomProduit)
      ).snapshotChanges().subscribe(res => {
        let found = false;
  
        res.forEach(item => {
          const data: any = item.payload.val();
          const ancienneQuantite = Number(data.quantite_total);
  
          if (data.dosage === dosage) {
            if (isNaN(ancienneQuantite)) {
              console.error("Quantité existante invalide !");
              return;
            }
  
            const nouvelleQuantite = ancienneQuantite + quantite;
  
            this.db.object(`approvisionnement/${item.key}`).update({
              quantite_total: nouvelleQuantite
            }).then(() => {
              console.log("✅ Produit mis à jour avec succès !");
              alert("Produit mis à jour avec succès !");
            }).catch((err) => {
              console.error("❌ Erreur lors de la mise à jour :", err);
            });
  
            found = true;
          }
        });
  
        if (!found) {
          this.db.list('approvisionnement').push(formData)
            .then(() => {
              console.log("✅ Nouveau produit ajouté avec succès !");
              alert("Nouveau produit ajouté avec succès !");
            })
            .catch(err => {
              console.error("❌ Erreur lors de l'ajout :", err);
            });
        }
  
        // 🔒 Désabonnement ici pour éviter la boucle infinie
        sub.unsubscribe();
      });
    }
  }
  

  getAllMedicament() {
    this.medocService.getAllMedicaments().subscribe({
      next: (data) => {
        console.log("Data reçue: ", data);
        this.realtimeData = data.sort((a, b) => a.nom_commercial.localeCompare(b.nom_commercial)); // Sort alphabetically
        this.filteredData = [...this.realtimeData];
        this.totalData = data.length;
        console.log("Nombre total de données: ", this.totalData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des medicaments:', err);
      }
    });
  }

  onSubmitAjout() {
    if (this.medocForm.valid) {
      const newMedoc: Medicaments = {
        nom_commercial: this.medocForm.value.nom_commercial,
        nom_generique: this.medocForm.value.nom_generique,
        categorie: this.medocForm.value.categorie,
        forme: this.medocForm.value.forme,
        dosage: this.medocForm.value.dosage,
        quantite_dispo: 0,
        seuil_minimum: 0,
        date_peremption: '',
        date_entree_stock: new Date().toISOString(),
        date_approvisionnement: '',
        nom_fournisseur: '',
        contact: '',
        adresse_email: ''

        // ... Autres champs requis
      }
      // Envoi du nouveau médicament à la base de données
      this.medocService.addMedicament(newMedoc)
        .then(() => {
          this.formReset();
        })
    }

  }

  ajouterMedoc(){
    this.approvisionnerMedoc = false
    this.ajoutMedoc = true
    
  }
  approMedoc(){
    this.ajoutMedoc = false
    this.approvisionnerMedoc = true
    this.approForm.invalid 
  }


  formReset() {
    this.medocForm.reset();
  }

}
