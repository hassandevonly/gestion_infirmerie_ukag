import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from '../auth/auth.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class UtilisateursService {
  private utilisateurSubject: BehaviorSubject<Utilisateurs[]> = new BehaviorSubject<Utilisateurs[]>([]);
  public utilisateur$: Observable<Utilisateurs[]> = this.utilisateurSubject.asObservable();
  userCollection!: AngularFirestoreCollection<Utilisateurs>
  private dbPath = '/utilisateurs';

  constructor(
    private afAuth: AuthService,
    private afs: AngularFirestore,
    private db: AngularFireDatabase,
    private firestore : AngularFirestore
  ) { }

  getUser(userId: string): Observable<any | null> {
    if (!userId) {
      console.error('Erreur: userId est indéfini.');
      return new Observable(observer => observer.next(null));
    }
    console.log("getUser", userId);
    
    return this.userCollection.doc(userId).valueChanges().pipe(
      map(user => (user ? { id: userId, ...user } : null))
    );
  }
  //Ajouter un utilisateur
  getUtilisateurs() {
    return this.afs.collection('utilisateurs').valueChanges()
  }

  getUtilisateurById(uid: string): Observable<any | null> {
    return this.firestore.collection('utilisateurs').doc(uid).valueChanges().pipe(
      map(user => (user ? { uid, ...user } : null)) // Ajoute l'UID aux données
    );
  }

  getUtilisateursById(id: string): Observable<Utilisateurs | null> {
    return this.db.object<Utilisateurs>(`utilisateurs/${id}`).valueChanges().pipe(
      map(user => {
        if (user) {
          return { id, ...user }; // Ajoute l'ID à l'objet utilisateur
        }
        return null;
      })
    )
  }

  // getUtilisateursMedecins(): Observable<Utilisateurs[]> {
  //   return this.db.list<Utilisateurs>('utilisateurs').snapshotChanges().pipe(
  //     map(actions =>
  //       actions
  //         .map(a => {
  //           const data = a.payload.val() as Utilisateurs;
  //           const id = a.key!;
  //           return { id, ...data };
  //         })
  //         .filter(user => user.typeCompte === 'Medecin')
  //     )
  //   );
  // }

  getUtilisateursMedecins(): Observable<Utilisateurs[]> {
    return this.db.list<Utilisateurs>(this.dbPath).valueChanges().pipe(
      map(users => {
        const medecins = users.filter(user => user.typeCompte === 'Medecin');
        console.log('Médecins filtrés:', medecins);
        return medecins;
      })
    );
  }

}
