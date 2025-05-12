import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private consultationsSubject: BehaviorSubject<Consultations[]> = new BehaviorSubject<Consultations[]>([]);
  public consultations$: Observable<Consultations[]> = this.consultationsSubject.asObservable();
private dbPath = '/consultations';
fireDbRef: AngularFireList<any>

constructor(private db: AngularFireDatabase) { 
  this.fireDbRef = this.db.list(this.dbPath);
  
  // Afficher toutes les consultations
  this.getAllConsultations().subscribe(consultations => {
    console.log('Liste des consultations:', consultations);
  });

  // Tester une consultation spécifique
  this.getConsultationById("OQRWTp5AAMS3p2HdEFXY").subscribe(data => {
    console.log('Consultation spécifique:', data);
  });
}

getAllConsultations() {
  return this.fireDbRef.snapshotChanges().pipe(
    map(changes => 
      changes.map(c => ({
        id: c.payload.key,
        ...c.payload.val()
      }))
    ),
    tap(consultations => {
      console.log('Toutes les consultations:', consultations);
    })
  );
}

//Ajouter une consultation
async addConsultation(consultation: Consultations) {
  try {
    await this.fireDbRef.push(consultation);
    await Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Consultation ajoutée avec succès',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Erreur lors de l\'ajout de la consultation',
      confirmButtonText: 'OK'
    });
    throw error;
  }
}

//Afficher une consultation specifique 
getConsultationById(id: string): Observable<Consultations | null> {
  console.log('Chemin de la consultation:', `${this.dbPath}/${id}`);
  return this.db.object<Consultations>(`${this.dbPath}/${id}`).valueChanges().pipe(
    tap(consultation => {
      console.log('Consultation récupérée:', consultation);
    })
  );
}

//Modifier une consultation
async updateConsultation(id: string, value: Consultations): Promise<void> {
  try {
    await this.fireDbRef.update(id, {
      nom: value.nom,
      prenom: value.prenom,
      matricule: value.matricule,
      age: value.age,
      sexe: value.sexe,
      telephone: value.telephone,
      motif: value.motif,
      dateConsultation: value.dateConsultation,
      heureConsultation: value.heureConsultation,
      diagnostic: value.diagnostic,
      traitement: value.traitement,
      quantite: value.quantite
    });
    
    await Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Consultation mise à jour avec succès',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Erreur lors de la mise à jour de la consultation',
      confirmButtonText: 'OK'
    });
    throw error;
  }
}

//Supprimer une consultation
async deleteConsultation(id: string): Promise<void> {
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
        text: 'La consultation a été supprimée.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Erreur lors de la suppression de la consultation',
      confirmButtonText: 'OK'
    });
    throw error;
  }
}
}
