import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map, Observable, tap } from 'rxjs';
import { HistoApprovisionnement } from 'src/app/models/medicaments/histo-approvisionnement';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class HistoApprovisionnementsService {

  private dbPath = '/histo-approvisionnement';
  fireDbRef: AngularFireList<any>
  constructor(private db: AngularFireDatabase) {
    this.fireDbRef = this.db.list(this.dbPath);
  }


  //Afficher toute l'historique
  getHistoApprovisionnement() {
    return this.fireDbRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({
          id: c.payload.key,
          ...c.payload.val()
        }))
      ),
      tap(historiques => {
        console.log('Historiques :', historiques);
      })
    );
  }

  getMedicamentById(id: string): Observable<HistoApprovisionnement | null> {
    console.log("Chemin de l'historique:", `${this.dbPath}/${id}`);
    return this.db.object<HistoApprovisionnement>(`${this.dbPath}/${id}`).valueChanges().pipe(
      tap(historique => {
        console.log('Historique recupérée:', historique);
      })
    );
  }

  //Supprimer une medicament
  async deleteHistorique(id: string): Promise<void> {
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
          text: 'L\'hsitorique a été supprimée.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la suppression de l\'historique',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }
}
