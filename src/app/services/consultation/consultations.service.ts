import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Consultations } from 'src/app/models/consultations/consultations';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {
  
  
  private consultationsSubject: BehaviorSubject<Consultations[]> = new BehaviorSubject<Consultations[]>([]);
  public consultations$: Observable<Consultations[]> = this.consultationsSubject.asObservable();

  Consultation: AngularFirestoreCollection<Consultations>
  tableau: [] = []

  private collectionName = 'consultations';

  constructor(private afs: AngularFirestore) {
    this.Consultation = afs.collection<Consultations>(this.collectionName, ref => ref.orderBy('nom'));
    console.log(this.getConsultationById('iReflWXu3Zz4QElnMJZJ').subscribe(data => {
      this.tableau = data as any;
      console.log("tableau : ",this.tableau);
      
    }));
    
  }

  // Récupérer toutes les consultations 
  getConsultations(): Observable<Consultations[]> {
    return this.Consultation.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Consultations; // Récupère les données
        const id = a.payload.doc.id; // Récupère l'ID Firestore
        console.log('Consultation data:', { id, ...data }); // Log the data
        return { id, ...data }; // Fusionne l'ID avec les données
      }))
    ).pipe(
      catchError(error => {
        console.error('Error fetching consultations:', error); // Log any errors
        return throwError(error); // Rethrow the error
      })
    );
  }

  getConsultationById(id: string): Observable<Consultations | undefined> {
    return this.Consultation.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Consultations;
        const docId = a.payload.doc.id;
        return { id: docId, ...data }; // Fusionne l'ID Firestore avec les données
      })),
      map(consultations => consultations.find(consultation => consultation.id === id)), // Filtrer par ID
      catchError(error => {
        console.error('Erreur lors de la récupération de la consultation :', error);
        return throwError(error);
      })
    );
  }

  testGetConsultationById(id: string): void {
    this.getConsultationById(id).subscribe(
      (consultation) => {
        console.log('Test consultation:', consultation);
      },
      (error) => {
        console.error('Error in testGetConsultationById:', error);
      }
    );
  }

  // getConsultationId(id: string){
  //   return this.afs.collection<Consultations>('consultations').doc(id).valueChanges();
  // }

  // Récupérer une seule consultation par son ID
  // getConsultationById(id: string): Observable<any> {
  //   return this.Consultation.doc(id).valueChanges();
  // }

  // Ajouter une consultation
  addConsultation(consultation: Consultations) {
    return this.Consultation.add(consultation).then(() => {
      console.log('Consultation ajoutée avec succès !');
    }).catch((error) => {
      console.log('Erreur lors de l\'ajout de la consultation : ', error);
    });
  }
  

  // Trouver l'ID firestore de mes donnees 
  getFirestoreIdByConsultationId(consultationId: string): Observable<string | null> {
    return this.afs.collection('consultations', ref =>
      ref.where('id', '==', consultationId).limit(1) // 🔍 Recherche par champ `id`
    ).snapshotChanges().pipe(
      map(actions => {
        if (actions.length === 0) {
          console.error(`❌ Aucun document trouvé avec id=${consultationId}`);
          return null;
        }
        console.log('✅ Document trouvé avec id=', consultationId);
        
        return actions[0].payload.doc.id; // ✅ Retourne le Document ID Firestore
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération de l\'ID Firestore :', error);
        return throwError(error);
      })
    );
  }
  // 🔹 Met à jour une consultation spécifique
  updateConsultationByConsultationId(consultationId: string, newConsultationData: Consultations): void {
    
  
      console.log("voici l'id: ",consultationId);
      this.getFirestoreIdByConsultationId(consultationId).subscribe(
        (firestoreId) => {
          if (firestoreId) {
            this.Consultation.doc(firestoreId).update(newConsultationData).then(() => {
              console.log('Consultation mise à jour avec succès !');
            }).catch((error) => {
              console.error('Erreur lors de la mise à jour de la consultation :', error);
            });
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération de l\'ID Firestore :', error);
        }
      );
  }

  // Supprimer une consultation
  deleteConsultation(consultationId: string): void {
    this.getFirestoreIdByConsultationId(consultationId).subscribe(
      (firestoreId) => {
        if (firestoreId) {
          this.Consultation.doc(firestoreId).delete().then(() => {
            console.log('Consultation supprimée avec succès !');
          }).catch((error) => {
            console.error('Erreur lors de la suppression de la consultation :', error);
          });
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'ID Firestore :', error);
      }
    );
  }
}
