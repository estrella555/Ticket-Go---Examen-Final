import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any[] = [];

  constructor(private firestore: Firestore, private authService: AuthService) {}

  // Obtener el userId dinámicamente
  private getUserId(): string | null {
    const user = this.authService.getCurrentUser();
    return user ? user.uid : null;
  }

  // Validar si el usuario está autenticado
  private validateUser() {
    const userId = this.getUserId();
    if (!userId) {
      console.error('No se encontró un usuario logueado.');
      throw new Error('No se encontró un usuario logueado.');
    }
    return userId;
  }

  // Cargar los elementos del carrito desde Firestore
  async loadCart() {
    try {
      const userId = this.validateUser();
  
      // Si no hay un usuario logueado, detener la ejecución
      if (!userId) {
        console.warn('Intento de cargar el carrito sin usuario logueado.');
        this.cart = []; // Asegurarte de que el carrito esté vacío
        return;
      }
  
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const snapshot = await getDocs(cartRef);
      this.cart = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Carrito cargado desde Firestore:', this.cart);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  }
  

  // Obtener los items del carrito
  getCartItems(): any[] {
    return [...this.cart]; // Retorna una copia del carrito
  }
  
  async addToCart(evento: any) {
    try {
      const userId = this.validateUser();
  
      // Validar campos del evento
      if (!evento || !evento.eventoId || (!evento.nombre && !evento.name) || evento.precio === undefined) {
        console.error('Evento inválido:', evento);
        throw new Error('Evento inválido. Faltan campos requeridos.');
      }
  
      // Construir el objeto "item" con valores predeterminados
      const item = {
        eventoId: evento.eventoId,
        name: evento.name || evento.nombre || 'Evento sin nombre', // Nombre predeterminado
        location: evento.location || evento.lugar,           // Valor predeterminado para ubicación
        date: evento.date || evento.fecha ||new Date().toISOString(),            // Fecha predeterminada (actual)
        photoURL: evento.photoURL || '',                          // Imagen predeterminada vacía
        cantidadEntradas: evento.cantidadEntradas || 1,           // Cantidad mínima de entradas
        precio: evento.precio || 0,                               // Precio predeterminado 0
        discount: evento.discount || 0,                           // Descuento predeterminado 0
        precioConDescuento: evento.precioConDescuento || evento.precio || 0,
        precioTotal: (evento.cantidadEntradas || 1) * (evento.precioConDescuento || evento.precio || 0),
      };
  
      // Asegurarse de que todos los campos tengan valores válidos
      Object.entries(item).forEach(([key, value]) => {
        if (value === undefined) {
          throw new Error(`Campo inválido detectado: ${key} tiene valor undefined`);
        }
      });
  
      // Guardar en Firestore
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const docRef = await addDoc(cartRef, item);
  
      // Agregar al carrito en la memoria local
      this.cart.push({ ...item, id: docRef.id });
      console.log('Item agregado al carrito:', item);
    } catch (error) {
      console.error('Error al agregar el evento al carrito:', error);
    }
  }
  
  

  // Eliminar un item del carrito en Firestore
  async removeFromCart(eventoId: string) {
    try {
      const userId = this.validateUser();
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const itemDoc = doc(cartRef as CollectionReference, eventoId);
      await deleteDoc(itemDoc);
      this.cart = this.cart.filter(item => item.eventoId !== eventoId);
      console.log(`Evento con ID: ${eventoId} eliminado del carrito`);
    } catch (error) {
      console.error('Error al eliminar el evento del carrito:', error);
    }
  }

  // Actualizar la cantidad de un item en Firestore
  async updateItemQuantity(eventoId: string, newQuantity: number) {
    try {
      const userId = this.validateUser();
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const itemDoc = doc(cartRef as CollectionReference, eventoId);
      await updateDoc(itemDoc, { cantidadEntradas: newQuantity });
      const item = this.cart.find(item => item.eventoId === eventoId);
      if (item) {
        item.cantidadEntradas = newQuantity;
        item.precioTotal = newQuantity * item.precioConDescuento;
        console.log(`Cantidad actualizada para el evento ${eventoId}`);
      }
    } catch (error) {
      console.error('Error al actualizar la cantidad del evento:', error);
    }
  }

  // Vaciar el carrito
  async clearCart() {
    try {
      const userId = this.validateUser();
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const snapshot = await getDocs(cartRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      this.cart = [];
      console.log('Carrito vacío en Firestore');
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
    }
  }
}
