import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title: string = "Home";
  eventos: any[] = [];
  filteredEventos: any[] = [];
  categories: string[] = [];
  locations: string[] = [];
  selectedCategory: string = '';
  selectedLocation: string = '';
  selectedDate: string = '';

  constructor(
    public auth: AuthService,
    public db: DatabaseService
  ) {}

  ngOnInit() {
     // Verificar el estado del usuario antes de llamar loadFavorites
    const userCheck = setInterval(() => {
      if (this.auth.getCurrentUser()) {
        clearInterval(userCheck);
        this.loadFavorites();
      }
    }); // Verificar cada 1 segundo


    // Obtener y mostrar eventos de Firestore
    this.db.fetchFirestoreCollection('events').subscribe(
      (collection: any[]) => {
        this.eventos = collection ?? [];
        this.filteredEventos = collection ?? [];
        this.extractCategories();
        this.extractLocations();
        console.log('Eventos:', this.eventos);
      },
      (error) => {
        console.error('Error al obtener la colección:', error);
      }
    );

  // Cargar favoritos al inicio
  this.loadFavorites();
}



  

  extractCategories() {
    this.categories = Array.from(new Set(this.eventos.map(evento => evento?.category)));
    console.log('Categorías extraídas:', this.categories);
  }

  extractLocations() {
    this.locations = Array.from(new Set(this.eventos.map(evento => evento?.location)));
    console.log('Ubicaciones extraídas:', this.locations);
  }

  filterByCategory(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  filterByLocation(event: Event) {
    this.selectedLocation = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  filterByDate(event: Event) {
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    console.log('Aplicando filtros en home...');
    this.filteredEventos = this.eventos
      .filter(evento => this.selectedCategory === '' || evento.category === this.selectedCategory)
      .filter(evento => this.selectedLocation === '' || evento.location === this.selectedLocation)
      .filter(evento => this.selectedDate === '' || new Date(evento.date).toDateString() === new Date(this.selectedDate).toDateString());
    console.log('Eventos filtrados:', this.filteredEventos);
  }

  isFilterModalOpen: boolean = false;

  openFilters() {
    this.isFilterModalOpen = true;
  }

  closeFilters() {
    this.isFilterModalOpen = false;
  }



  clearFilters() {
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.applyFilters();
  }

  async toggleFavorite(evento: any) {
    if (!this.auth.getCurrentUser()) {
      alert('Debes iniciar sesión para agregar a favoritos.');
      return;
    }
  
    try {
      if (evento.isFavorite) {
        // Eliminar de favoritos
        await this.db.updateEventField(evento.id, { isFavorite: false });
        evento.isFavorite = false;
        console.log('Evento eliminado de favoritos');
      } else {
        // Agregar a favoritos
        await this.db.updateEventField(evento.id, { isFavorite: true });
        evento.isFavorite = true;
        console.log('Evento agregado a favoritos');
      }
  
      await this.loadFavorites(); // Recargar la lista de favoritos
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
    }
  }
  
  
  

  favorites: any[] = []; // Lista para almacenar los favoritos

  async loadFavorites() {
    const retryInterval = setInterval(() => {
      const currentUser = this.auth.getCurrentUser();
  
      if (currentUser) {
        clearInterval(retryInterval); // Detiene el reintento
        console.log('Usuario autenticado:', currentUser);
  
        this.fetchFavorites(currentUser.uid); // Cargar favoritos
      }
    }, 500); // Reintenta cada 500ms
  }
  
  async fetchFavorites(userId: string) {
    try {
      const querySnapshot = await this.db.queryFavorites(userId);
      this.favorites = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Favoritos cargados:', this.favorites);
    } catch (error) {
      console.error('Error al cargar los favoritos:', error);
    }
  }
  
}
