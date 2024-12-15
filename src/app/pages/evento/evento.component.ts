import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { RouterModule, Router } from '@angular/router';
import { RecomendacionesComponent } from '../recomendaciones/recomendaciones.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RecomendacionesComponent],
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss']
})
export class EventoComponent implements OnInit {
  userId: string | null = null;
  eventId: string | null = null;
  evento: any = null;
  cantidadEntradas: number = 0;
  botonActivo: boolean = false;
  precioConDescuento: number = 0;

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService,
    private cartService: CartService,
    private firestore: Firestore,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.getEventDetail(this.eventId);
    }

    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.userId = currentUser.uid; // Asignar el userId
    } else {
      console.error('No se encontró un usuario logueado');
    }
  }

  // Obtener los detalles del evento desde Firestore
  getEventDetail(eventId: string) {
    this.db.getDocumentById('events', eventId).subscribe(
      (evento: any) => {
        this.evento = { ...evento, id: eventId }; // Incluye el ID del documento
        this.evento.location = evento.location || 'Ubicación no especificada'; // Valor predeterminado
        this.calcularPrecioConDescuento();
      },
      (error: any) => {
        console.error('Error al obtener el detalle del evento:', error);
      }
    );
  }

  // Calcular el precio con descuento
  calcularPrecioConDescuento() {
    if (this.evento && this.evento.discount) {
      this.precioConDescuento =
        this.evento.price - (this.evento.price * this.evento.discount) / 100;
    } else {
      this.precioConDescuento = this.evento.price; // Si no hay descuento, usar el precio regular
    }
  }

  

  // Actualizar el estado del botón basado en la cantidad seleccionada
  actualizarBoton() {
    // Asegúrate de que la cantidad sea válida
    this.cantidadEntradas = Math.max(0, this.cantidadEntradas);
    this.botonActivo = this.cantidadEntradas > 0 && this.cantidadEntradas <= this.evento.cantidadEntradas;
  }

  // Agregar el evento al carrito
  async addToCart(evento: any) {
    try {
      if (!this.auth.getCurrentUser()) {
        alert('Para añadir al carrito debes iniciar sesión.');
        return;
      }

      if (!this.botonActivo) {
        console.error('No se puede agregar al carrito. Verifica la cantidad seleccionada.');
        return;
      }

      const newTicketsAvailable =
        this.evento.cantidadEntradas - this.cantidadEntradas;

      // Actualizar el evento en Firestore
      const eventDocRef = doc(this.firestore, `events/${this.evento.id}`);
      await updateDoc(eventDocRef, {
        cantidadEntradas: newTicketsAvailable,
        addedToCart: true
      });

      console.log(`Evento "${this.evento.name}" actualizado en Firestore`);

      // Agregar al carrito usando el servicio
      this.cartService.addToCart({
        eventoId: this.evento.id,
        nombre: this.evento.name,
        photoURL: this.evento.photoURL,
        lugar: this.evento.location,
        fecha: this.evento.date,
        cantidadEntradas: this.cantidadEntradas,
        precio: this.evento.price,
        precioConDescuento: this.precioConDescuento,
        precioTotal: this.cantidadEntradas * this.precioConDescuento
      });

      // Redirigir al carrito
      this.router.navigate(['/carrito']);
    } catch (error) {
      console.error('Error al agregar el evento al carrito:', error);
    }
  }
}
