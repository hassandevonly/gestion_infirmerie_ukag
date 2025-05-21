import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  canSeeConsultations = false;
  userRole$: Observable<string | null>;
  menuOpen = false; // toggle d'ouverture du menu
  medicamentsMenuOpen = false;
  consultationMenuOpen = false;
  dashboardMenuOpen = false;
  role: Observable<string | null>;


  constructor(
    public authService: AuthService,
    private route: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userRole$ = this.authService.getUserRole();
    this.role = this.authService.getUserRole(); // ou autre méthode
    console.log('Role utilisateur :', this.role); 
  }

  ngOnInit(): void {
    // Manually trigger change detection
    // vérifie la valeur ici
    this.cdr.detectChanges();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleConsultationMenu() {
    this.consultationMenuOpen = !this.consultationMenuOpen;
  }

  
  toggleDashboardMenu() {
    this.dashboardMenuOpen = !this.dashboardMenuOpen;
  }

  toggleMedicamentsMenu() {
    this.medicamentsMenuOpen = !this.medicamentsMenuOpen;
  }

  onLogout() {
    this.authService.deconnexion().then(() => {
      this.route.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de la déconnexion', error);
    })
  }

}
