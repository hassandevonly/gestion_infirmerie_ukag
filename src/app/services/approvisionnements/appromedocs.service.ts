import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map, Observable, tap } from 'rxjs';
import { Approvisionnements } from 'src/app/models/medicaments/approvisionnements';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AppromedocsService {

  private dbPath = '/approvisionnement';
  fireDbRef: AngularFireList<any>
  constructor(private db: AngularFireDatabase) {
    this.fireDbRef = this.db.list(this.dbPath);
  }

  //Afficher tous les medicaments
  getAllMedicaments() {
    return this.fireDbRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({
          id: c.payload.key,
          ...c.payload.val()
        }))
      ),
      tap(medicaments => {
        console.log('Tous les medicaments:', medicaments);
      })
    );
  }

  //Afficher une consultation specifique
  getMedicamentById(id: string): Observable<Approvisionnements | null> {
    console.log('Chemin du medicament:', `${this.dbPath}/${id}`);
    return this.db.object<Approvisionnements>(`${this.dbPath}/${id}`).valueChanges().pipe(
      tap(medicament => {
        console.log('Consultation récupérée:', medicament);
      })
    );
  }

  //Modifier une medicament
  updateMedicament(id: string, value: Approvisionnements): Promise<void> {
    console.log("ID à modifier:", id);
    console.log("Value dans le service:", value);

    // Utiliser fireDbRef qui est déjà initialisé dans le constructeur
    return this.fireDbRef.update(id, {
      nom_produit: value.nom_produit,
      dosage: value.dosage,
      quantite_total: value.quantite_total,
      date_peremption: value.date_peremption,
      seuil_minimum: value.seuil_minimum,
    });
  }

  //Supprimer une medicament
    async deleteMedicament(id: string): Promise<void> {
       try {
            const result = await Swal.fire({
              title: 'Êtes-vous sûr ?',
              text: 'Cette action est irréversible !',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oui, supprimer!',
              cancelButtonText: 'Annuler'
            });
      
            if (result.isConfirmed) {
              await this.fireDbRef.remove(id);
              await Swal.fire({
                icon: 'success',
                title: 'Supprimé !',
                text: 'Le produit a été supprimée.',
                timer: 1500,
                showConfirmButton: false
              });
            }
          } catch (error) {
            await Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du produit',
              confirmButtonText: 'OK'
            });
            throw error;
          }
    }
}
