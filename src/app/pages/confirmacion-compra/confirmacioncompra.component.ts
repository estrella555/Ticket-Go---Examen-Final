import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, CollectionReference, addDoc, deleteDoc, updateDoc, doc } from '@angular/fire/firestore'; // Importar addDoc y deleteDoc
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirmacion-compra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmacioncompra.component.html',
  styleUrls: ['./confirmacioncompra.component.scss']
})
export class ConfirmacionCompraComponent implements OnInit {
  cartItems: any[] = [];
  totalCarrito: number = 0;
  metodoPago: string = 'Tarjeta';
  comprobante: File | null = null;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    try {
      const user = this.auth.getCurrentUser();
      if (!user) {
        console.error('No se encontró un usuario logueado.');
        this.router.navigate(['/login']);
        return;
      }
      console.log('Usuario autenticado:', user);
      
    
  
      // Continuar si hay usuario logueado
      const userId = user.uid;
      const cartRef = collection(this.firestore, `users/${userId}/cart`) as CollectionReference;
      const snapshot = await getDocs(cartRef);
  
      this.cartItems = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
  
      console.log('Datos del carrito cargados desde Firebase:', this.cartItems);
      this.calcularTotal();
    } catch (error) {
      console.error('Error al cargar los datos del carrito desde Firebase:', error);
    }
  }
  

  calcularTotal() {
    this.totalCarrito = this.cartItems.reduce((total, item) => {
      const precioTotal = isNaN(item.precioTotal) ? 0 : item.precioTotal;
      return total + precioTotal;
    }, 0);
    console.log('Total a pagar calculado en confirmación:', this.totalCarrito);
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.comprobante = event.target.files[0];
      console.log('Comprobante seleccionado:', this.comprobante);
    }
  }
  async confirmarCompra() {
    if (!this.comprobante) {
      console.error('Debe adjuntar un comprobante de pago para finalizar la compra.');
      return;
    }
  
    const user = this.auth.getCurrentUser();
    if (user) {
      const userId = user.uid;
  
      // Verificar y mapear los datos correctamente
      const compra = {
        items: this.cartItems.map(item => ({
          nombre: item.nombre || item.name || 'Sin nombre',
          lugar: item.lugar || item.location || 'Ubicación no especificada',
          fecha: item.fecha || item.date || 'Sin fecha',
          cantidadEntradas: item.cantidadEntradas || 0,
          precio: item.precio || 0,
          precioTotal: item.precioTotal || 0
        })),
        total: this.totalCarrito || 0,
        metodoPago: this.metodoPago || 'Sin método de pago',
        fecha: new Date().toISOString(),
        comprobante: this.comprobante?.name || 'Sin comprobante'
      };
  
      // Validar datos antes de guardar
      if (compra.items.some(item => item.nombre === 'Sin nombre' || item.precioTotal === 0)) {
        console.error('Error: Algunos campos del carrito están incompletos o son inválidos.');
        return;
      }
  
      try {
        // Restablecer el estado de los eventos (addedToCart: false) **ANTES** de confirmar la compra
        await this.resetAddedToCart(userId);
  
        // Guardar la compra en Firebase
        const comprasRef = collection(this.firestore, `users/${userId}/compras`) as CollectionReference;
        await addDoc(comprasRef, compra);
        console.log('Compra guardada en la base de datos');
  
        // Limpiar el carrito
        const cartRef = collection(this.firestore, `users/${userId}/cart`) as CollectionReference;
        const snapshot = await getDocs(cartRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
  
        console.log('Carrito vacío después de la compra.');
        this.router.navigate(['/confirmacion-exitosa']);
      } catch (error) {
        console.error('Error al procesar la compra en Firebase:', error);
      }
    }
  }
  
  // Función para restablecer addedToCart a false en Firestore
  private async resetAddedToCart(userId: string) {
    try {
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const snapshot = await getDocs(cartRef);
  
      const resetPromises = snapshot.docs.map(async (docSnap) => {
        const eventoId = docSnap.data()['eventoId']; // Acceder correctamente al eventoId
        const eventDocRef = doc(this.firestore, `events/${eventoId}`);
        await updateDoc(eventDocRef, { addedToCart: false });
      });
  
      await Promise.all(resetPromises);
      console.log('Estados de addedToCart restablecidos a false.');
    } catch (error) {
      console.error('Error al restablecer addedToCart:', error);
    }
  }
  
  
}  