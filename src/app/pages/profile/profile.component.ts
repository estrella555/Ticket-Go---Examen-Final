import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: any = {}; // Garantiza que sea un objeto válido
  favorites: any[] = [];
  showFavorites: boolean = false;

  constructor(
    public auth: AuthService,
    public db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.verifyIsLogued()) {
      this.router.navigateByUrl('/login'); // Redirige al login si no está logueado
      return;
    }
    
    // Asignar el perfil si está autenticado
    this.profile = this.auth.profile || {};
    
    // Cargar favoritos
    this.loadFavorites();
  }

  // Cargar lista de favoritos
  async loadFavorites() {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }

    try {
      const userId = currentUser.uid;

      // Limpiar favoritos previos antes de cargar nuevos
      this.favorites = [];

      const querySnapshot = await this.db.queryFavorites(userId);
      this.favorites = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Favoritos cargados:', this.favorites);
    } catch (error) {
      console.error('Error al cargar los favoritos:', error);
    }
  }

  // Mostrar/Ocultar sección de favoritos
  toggleFavorites() {
    this.showFavorites = !this.showFavorites;
  }

  // Añadir o eliminar un favorito
  async toggleFavorite(evento: any) {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }

    try {
      const userId = currentUser.uid;

      if (evento.isFavorite) {
        await this.db.removeFavorite(userId, evento.id);
        evento.isFavorite = false;
      } else {
        await this.db.addFavorite(userId, evento);
        evento.isFavorite = true;
      }

      // Refrescar la lista de favoritos
      await this.loadFavorites();
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
    }
  }

  // Cerrar sesión
  logout() {
    this.auth.logoutUser()
      .then(() => {
        localStorage.clear(); // Borra todos los datos del local storage
        this.router.navigateByUrl('/login'); // Redirige al login después de cerrar sesión
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
      });
  }
}
