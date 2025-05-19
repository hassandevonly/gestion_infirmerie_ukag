import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  
  constructor(
    private authService: AuthService, 
    private route: Router,
    private cdr: ChangeDetectorRef
  ) { 
    
  }

  ngOnInit(): void {
    // Manually trigger change detection
    this.cdr.detectChanges();
  }
  onLogout() {
    this.authService.deconnexion().then(() => {
      this.route.navigate(['/login'])
    }).catch(error => {
      console.log('Erreur lors de la déconnexion', error);
    })
  }
}
