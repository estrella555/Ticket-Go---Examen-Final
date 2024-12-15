import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, addDoc, doc, updateDoc, deleteDoc, setDoc, query, where, DocumentData, getDoc, getDocs, docData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(
    public firestore: Firestore,
    private http: HttpClient
  ) { }

  // Método para obtener una colección de Firestore
  fetchFirestoreCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' }); // Retorna los datos incluyendo el ID
  }

  // Recuperar un documento por su ID, incluyendo el UID como parte de los datos
  getDocumentById(collectionName: string, documentId: string): Observable<any> {
    const docRef = doc(this.firestore, `${collectionName}/${documentId}`);
    return docData(docRef, { idField: 'id' }); // Incluye el UID como parte de los datos
  }

  // Función para recuperar varios documentos según un campo específico
  getDocumentsByField(collectionName: string, field: string, value: any): Observable<DocumentData[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const queryRef = query(collectionRef, where(field, '==', value));
    return collectionData(queryRef, { idField: 'id' });
  }

  // Método para agregar un documento a una colección en Firestore
  addFirestoreDocument(collectionName: string, data: any): Promise<any> {
    const collectionRef = collection(this.firestore, collectionName);
    return addDoc(collectionRef, data);  // Añade un nuevo documento con los datos proporcionados
  }

  // Método para actualizar un documento existente en una colección en Firestore
  updateFirestoreDocument(collectionName: string, uuid: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${collectionName}/${uuid}`);
    return updateDoc(docRef, data);  // Actualiza el documento con los datos proporcionados
  }

  // Método para eliminar un documento de una colección en Firestore
  deleteFirestoreDocument(collectionName: string, uuid: string): Promise<void> {
    const docRef = doc(this.firestore, `${collectionName}/${uuid}`);
    return deleteDoc(docRef);  // Elimina el documento con el UUID proporcionado
  }

  async addEvents(events: any[]): Promise<void> { 
    const eventsCollection = collection(this.firestore, 'eventos'); 
    for (const event of events) { await addDoc(eventsCollection, event); 
    } 
  }

  // Método para guardar la compra 
  async guardarCompra(userId: string, compra: any) { 
    const compraRef = doc(collection(this.firestore, `users/${userId}/compras`)); 
    await setDoc(compraRef, compra); 
    
  } // Método para obtener las compras de un usuario 
  getCompras(userId: string): Observable<DocumentData[]> { 
    const comprasRef = collection(this.firestore, `users/${userId}/compras`); 
    const q = query(comprasRef); 
    return collectionData(q, { idField: 'id' }); 
  }


  // Obtener favoritos usando una consulta
  async queryFavorites(userId: string) {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, where('isFavorite', '==', true));
    return await getDocs(q);
  }
  
  // Añadir un evento a la lista de favoritos
  async addFavorite(userId: string, evento: any) {
    const favoritesRef = collection(this.firestore, `users/${userId}/favorites`);
    const favoriteDoc = doc(favoritesRef, evento.id); // El ID del evento será el nombre del documento
    await setDoc(favoriteDoc, { ...evento });
  }

  // Eliminar un evento de la lista de favoritos
  async removeFavorite(userId: string, eventId: string) {
    const favoriteDocRef = doc(this.firestore, `users/${userId}/favorites/${eventId}`);
    await deleteDoc(favoriteDocRef);
  }

  // Obtener la lista de favoritos
  async getFavorites(userId: string) {
    const favoritesRef = collection(this.firestore, `users/${userId}/favorites`);
    const snapshot = await getDocs(favoritesRef);
    return snapshot.docs.map((doc) => doc.data());
  }

  // Método para actualizar un campo específico de un documento en Firestore
async updateEventField(eventId: string, data: any): Promise<void> {
  const docRef = doc(this.firestore, `events/${eventId}`);
  await updateDoc(docRef, data);
}

}
