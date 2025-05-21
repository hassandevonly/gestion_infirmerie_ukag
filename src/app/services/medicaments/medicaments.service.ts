import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { map, Observable, tap } from 'rxjs';
import { Medicaments } from 'src/app/models/medicaments/medicaments';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MedicamentsService {
  private dbPath = '/medicaments';
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

  //Ajouter un nouveau medicament
  addMedicament(medicament: Medicaments): Promise<any> {
    return this.fireDbRef.push(medicament)
      .then(ref => {
        console.log('Médicament ajouté avec succès, ID:', ref.key);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Médicament ajoutée avec succès',
          timer: 1500,
          showConfirmButton: false
        });
        return ref;

      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du médicament:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'ajout du médicament',
          confirmButtonText: 'OK'
        });
        throw error;
      });
  }

  //Afficher une consultation specifique
  getMedicamentById(id: string): Observable<Medicaments | null> {
    console.log('Chemin du medicament:', `${this.dbPath}/${id}`);
    return this.db.object<Medicaments>(`${this.dbPath}/${id}`).valueChanges().pipe(
      tap(medicament => {
        console.log('Consultation récupérée:', medicament);
      })
    );
  }

  // Rechercher un médicament par nom
  getMedicamentByName(name: string): Observable<Medicaments[]> {
    console.log('Recherche du médicament par nom:', name);
    return this.db.list<Medicaments>(this.dbPath, ref => ref.orderByChild('nom_commercial').equalTo(name))
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({
            id: c.payload.key ?? undefined, // Ensure id is undefined if null
            ...c.payload.val()
          }))
        ),
        tap(medicaments => {
          console.log('Médicaments récupérés:', medicaments);
        })
      );
  }

  //Modifier une medicament
  updateMedicament(id: string, value: Medicaments): Promise<void> {
    console.log("ID à modifier:", id);
    console.log("Value dans le service:", value);

    // Utiliser fireDbRef qui est déjà initialisé dans le constructeur
    return this.fireDbRef.update(id, {
      nom_commercial: value.nom_commercial,
      nom_generique: value.nom_generique,
      categorie: value.categorie,
      forme: value.forme,
      dosage: value.dosage,
      quantite_dispo: value.quantite_dispo,
      seuil_minimum: value.seuil_minimum,
      date_peremption: value.date_peremption,
    });
  }

  //Modifier uniquement la quantité d'un médicament
  updateMedicamentQuantity(id: string, newQuantity: number): Promise<void> {
    console.log("ID du médicament à modifier:", id);
    console.log("Nouvelle quantité:", newQuantity);

    return this.fireDbRef.update(id, {
      quantite_dispo: newQuantity
    }).then(() => {
      console.log("Quantité mise à jour avec succès pour le médicament ID:", id);
    }).catch(error => {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      throw error;
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

  //Afficher tous les medicaments
  getHistoMedicaments() {
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
}
