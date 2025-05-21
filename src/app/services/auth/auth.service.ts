import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Inscription } from 'src/app/models/auth/inscription';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  utilisateur!: AngularFirestoreCollection<Inscription>
  tableau: [] = []
  private dbPath = '/utilisateurs';
  fireDbRef: AngularFireList<any>;

  constructor(public auth: AngularFireAuth, private route: Router, private afStore: AngularFirestore, private db: AngularFireDatabase) {
    this.utilisateur = this.afStore.collection('utilisateurs');
    this.fireDbRef = this.db.list(this.dbPath);
  }

  saveUsers(user: Utilisateurs) {

    return this.utilisateur.add(user).then(() => {
      console.log('Utilisateur enregistré avec succès');

      this.route.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de l\'enregistrement de l\'utilisateur', error);

    })
  }
  //inscription de l'utilisateur
  inscription(email: string, password: string, userForm: any) {
    return this.auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => { // ❌ Pas besoin de async ici
        const user = userCredential.user;
        if (!user) throw new Error("Utilisateur non trouvé après inscription");

        // 📌 Créer l'utilisateur dans Firestore
        const userRef = this.afStore.collection('utilisateur').doc(user.uid);

        const userData = {
          id: user.uid, // Utiliser l'UID Firebase
          nom: userForm.nom,
          prenom: userForm.prenom,
          email: user.email, // Récupérer l'email depuis Firebase Auth
          contact: userForm.contact,
          genre: userForm.genre,
          matricule: '',
          password: password, // ⚠️ Éviter de stocker les mots de passe en clair !
          status: 'actif',
          typeCompte: userForm.typeCompte || 'utilisateur',
          dateInscription: new Date().toISOString()
        };

        // ✅ Retourner la promesse pour bien gérer l'attente
        return userRef.set(userData)
          .then(() => {
            return Swal.fire({
              icon: 'success',
              title: 'Compte créé avec succès',
              text: 'Un email de vérification vous a été envoyé',
              confirmButtonText: 'OK'
            }).then(() => userData); // Retourner les infos de l'utilisateur
          });
      })
      .catch((error) => {
        return Swal.fire({
          icon: 'error',
          title: 'Erreur d\'inscription',
          text: error.message,
          confirmButtonText: 'OK'
        }).then(() => {
          throw error; // Relancer l'erreur pour la gestion dans le composant
        });
      });
  }

  // Méthode pour sauvegarder l'utilisateur avec authentification
  async saveUser(user: Utilisateurs, password: string) {
    try {
      // 1. Créer l'authentification
      const credential = await this.auth.createUserWithEmailAndPassword(user.email, password);

      if (credential.user) {
        // 2. Envoyer l'email de vérification
        await credential.user.sendEmailVerification();

        // 3. Enregistrer les infos de l'utilisateur dans Realtime Database
        const userData = {
          id: credential.user.uid,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          contact: user.contact,
          genre: user.genre,
          matricule: '',
          password: password,
          status: 'actif',
          typeCompte: user.typeCompte || 'utilisateur',
          date_inscription: new Date().toISOString()
        };

        await this.fireDbRef.push(userData);

        // Afficher une alerte de succès
        await Swal.fire({
          icon: 'success',
          title: 'Inscription réussie!',
          text: 'Veuillez vérifier votre email pour activer votre compte',
          confirmButtonText: 'OK'
        });

        this.route.navigate(['/login']);
      }
    } catch (error: any) {
      // Afficher une alerte d'erreur
      await Swal.fire({
        icon: 'error',
        title: 'Erreur lors de l\'inscription',
        text: error.message || 'Une erreur est survenue',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }

  createUser(user: any, userForm: Utilisateurs) {

  }

  // Méthode de connexion avec SweetAlert
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user?.emailVerified) {
        await Swal.fire({
          icon: 'success',
          title: 'Connexion réussie!',
          text: 'Bienvenue sur votre tableau de bord',
          timer: 1500,
          showConfirmButton: false
        });

        this.route.navigate(['/dashboard/home']);
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Email non vérifié',
          text: 'Veuillez vérifier votre adresse mail pour vous connecter',
          confirmButtonText: 'OK'
        });
      }
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.message || 'Identifiants incorrects',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }

  // Méthode de déconnexion avec SweetAlert
  async deconnexion() {
    try {
      await this.auth.signOut();
      await Swal.fire({
        icon: 'success',
        title: 'Déconnexion réussie',
        timer: 1500,
        showConfirmButton: false
      });
      this.route.navigate(['/login']);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur lors de la déconnexion',
        text: 'Une erreur est survenue',
        confirmButtonText: 'OK'
      });
    }
  }

  //récupérer l'utilisateur connecté
  getUser() {
    return this.auth.authState
  }



  //envoyer un mail de verification de l'adresse mail
  async sendVerificationMail() {
    try {
      const user = await this.auth.currentUser;
      await user?.sendEmailVerification();
      await Swal.fire({
        icon: 'info',
        title: 'Vérification email',
        text: 'Un email de vérification a été envoyé à votre adresse',
        confirmButtonText: 'OK'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Erreur lors de l\'envoi de l\'email de vérification',
        confirmButtonText: 'OK'
      });
    }
  }

  //réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      await Swal.fire({
        icon: 'success',
        title: 'Email envoyé',
        text: 'Un email de réinitialisation a été envoyé à votre adresse',
        confirmButtonText: 'OK'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  }

  //Afficher un utilisateur specifique 
  getInfosById(id: string): Observable<Utilisateurs | null> {
    console.log('Chemin de la collection:', `${this.dbPath}/${id}`);
    return this.db.object<Utilisateurs>(`${this.dbPath}/${id}`).valueChanges().pipe(
      map(utilisateur => {
        if (utilisateur) {
          console.log('Utilisateur récupéré:', utilisateur);
          return utilisateur;
        } else {
          console.log('Aucun utilisateur trouvé avec cet ID.');
          return null;
        }
      })
    );
  }

  //je veux une methode qui va me recuperer la liste des utilisateurs dans la collection utilisateurs dans realtime database et me filtrer cette liste pour m'afficher uniquement celui donc l'id est passe en aguments dans la methode
  getUserById(id: string): Observable<Utilisateurs | null> {
    console.log('Chemin de la consultation:', `${this.dbPath}/${id}`);
    return this.db.object<Utilisateurs>(`${this.dbPath}/${id}`).valueChanges().pipe(
      tap(utilisateurs => {
        console.log('Utilisateur récupéré:', utilisateurs);
      })
    );
  }

  getFilteredUserById(id: string): Observable<Utilisateurs | null> {
    return this.db.list<Utilisateurs>(this.dbPath).valueChanges().pipe(
      map(users => {
        const user = users.find(u => u.id === id) || null;
        console.log('Utilisateur filtré:', user);
        return user;
      })
    );
  }

  // Récupère le typeCompte (rôle) de l'utilisateur connecté
  getUserRole(): Observable<string | null> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of(null);

        // Recherche par l'id unique Firebase (stocké dans "id")
        return this.db.list('/utilisateurs', ref =>
          ref.orderByChild('id').equalTo(user.uid)
        ).valueChanges().pipe(
          map(users => {
            const userData: any = users[0];
            return userData?.typeCompte || null;
          })
        );
      })
    );
  }

  // Vérifie si l'utilisateur a un rôle spécifique
  isRole(role: string): Observable<boolean> {
    return this.getUserRole().pipe(
      map(userRole => userRole === role)
    );
  }

  // Vérifie si l'utilisateur a un rôle parmi une liste autorisée
  hasAccess(allowedRoles: string[]): Observable<boolean> {
    return this.getUserRole().pipe(
      map(userRole => allowedRoles.includes(userRole || ''))
    );
  }


  //Recuperer les information de l'utilisateur connecté
  // getConnectedUsers(){
  //   return this.auth.authState.subscribe(user => {
  //     if(user){
  //       this.tableau.push(user)
  //     }
  //   })
  //   return this.tableau;
  // }

  // Vérifier si l'utilisateur est admin
  isAdmin(uid: string): Observable<boolean> {
    return this.db.list(this.dbPath, ref =>
      ref.orderByChild('uid').equalTo(uid)
    ).valueChanges().pipe(
      map(users => {
        console.log('Users from isAdmin:', users);
        return users.length > 0 && (users[0] as any)['role'] === 'admin';
      })
    );
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): Observable<boolean> {
    return this.auth.authState.pipe(
      map(user => user !== null && user.emailVerified)
    );
  }

  // Récupérer les informations de l'utilisateur connecté
  getCurrentUser(): Observable<any> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          // Récupérer les données de l'utilisateur depuis Realtime Database
          return this.db.list(this.dbPath, ref =>
            ref.orderByChild('id').equalTo(user.uid)
          ).valueChanges().pipe(
            map(users => {
              if (users.length > 0) {
                console.log('Utilisateur connecté:', users[0]);
                return users[0];
              }
              return null;
            })
          );
        }
        return new Observable(subscriber => subscriber.next(null));
      })
    );
  }

  // Utilisation simplifiée avec un ID spécifique
  getUserData(userId: string): Observable<any> {
    return this.db.list(this.dbPath, ref =>
      ref.orderByChild('id').equalTo(userId)
    ).valueChanges().pipe(
      map(users => users.length > 0 ? users[0] : null)
    );
  }
}
