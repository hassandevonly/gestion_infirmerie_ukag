import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utilisateurs } from 'src/app/models/utilisateurs/utilisateurs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent {
  inscriptionForm!: FormGroup

  constructor(
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private authService: AuthService,
    private afStore: AngularFirestore

  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required], // Champ obligatoire
      prenom: ['', Validators.required],
      email: ['', Validators.required],
      contact: ['', Validators.required],
      genre: ['', Validators.required],
      password: ['',Validators.required],
      confirmPassword: ['', Validators.required],
      typeCompte: ['', Validators.required]
    });
   }

  ngOnInit(): void {
  }

  onSubmit() {
    if(this.inscriptionForm.valid){
      console.log(this.inscriptionForm.value);
      const userData : Utilisateurs = {
        id: this.afStore.createId(),
        nom: this.inscriptionForm.value.nom,
        prenom: this.inscriptionForm.value.prenom,
        email: this.inscriptionForm.value.email,
        contact: this.inscriptionForm.value.contact,
        genre: this.inscriptionForm.value.genre,
        matricule: '',
        password: this.inscriptionForm.value.password,
        status: 'actif',
        typeCompte: this.inscriptionForm.value.typeCompte || 'utilisateur',
        dateInscription: new Date().toISOString()
      };
      this.authService.saveUser(this.inscriptionForm.value,this.inscriptionForm.value.password);
      
    }else{
      console.log("Formulaire invalide "+this.inscriptionForm.value.nom);
    }
  }
}
