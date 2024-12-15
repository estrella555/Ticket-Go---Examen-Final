import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {
  cartItems: any[] = [];
  totalCarrito: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  // Cargar los datos del carrito
  cargarCarrito() {
    this.cartService.loadCart().then(() => {
      this.cartItems = this.cartService.getCartItems(); // Obtiene los datos del carrito
      this.calcularTotal(); // Calcula el total del carrito
      console.log('Elementos del carrito cargados:', this.cartItems);
    }); // Cerramos correctamente el método
  }

  // Vaciar el carrito
  clearCart() {
    this.cartService.clearCart();
    this.cartItems = [];
    this.totalCarrito = 0;
    console.log('Carrito vaciado');
  }

  // Eliminar un elemento del carrito

  removeItem(eventoId: string) {
    if (!eventoId) {
      console.error('ID del evento inválido:', eventoId);
      return;
    }
  
    this.cartService.removeFromCart(eventoId).then(() => {
      this.cartItems = this.cartItems.filter(item => item.eventoId !== eventoId); // Eliminar del array local
      this.calcularTotal(); // Recalcular el total
      console.log(`Evento con ID: ${eventoId} eliminado del carrito`);
    }).catch(error => {
      console.error('Error al eliminar el evento del carrito:', error);
    });
  }
  

  // Actualizar la cantidad de un ítem
  updateQuantity(eventoId: string, newQuantity: any) {
    const cantidadNumerica = Number(newQuantity);
    if (isNaN(cantidadNumerica) || cantidadNumerica < 1) {
      console.log(`Valor inválido para cantidad: ${newQuantity}`);
      return;
    }

    this.cartService.updateItemQuantity(eventoId, cantidadNumerica);
    this.cargarCarrito();
    console.log(`Cantidad actualizada para el evento con ID: ${eventoId}`);
  }

  // Calcular el total del carrito
  calcularTotal() {
    this.totalCarrito = this.cartItems.reduce((total, item) => {
      const precioUnitario = item.precioConDescuento && item.precioConDescuento < item.precio
        ? item.precioConDescuento
        : item.precio;
      return total + (precioUnitario * (item.cantidadEntradas || 1));
    }, 0);
    console.log('Total calculado:', this.totalCarrito);
  }
  
  
  

  // Ir al checkout
  irACheckout() {
    console.log('Redirigiendo al checkout...');
    this.router.navigate(['/confirmacion-compra']).then(success => {
      if (success) {
        console.log('Navegación exitosa.');
      } else {
        console.error('Error al redirigir.');
      }
    });
  }
  
  
}
