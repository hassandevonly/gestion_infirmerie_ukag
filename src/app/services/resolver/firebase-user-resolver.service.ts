import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Resolve } from '@angular/router';
import { filter, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUserResolverService implements Resolve<Observable<FirebaseUserResolverService>>{

  constructor(
    private afAuth : AngularFireAuth
  ) { }
  resolve(): any{
    return this.afAuth.user.pipe(
      filter((user: any) => user !== undefined),
      take(1)
    )
  }
}
