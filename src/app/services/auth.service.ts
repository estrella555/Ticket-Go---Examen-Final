import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  updateEmail,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLogued = false;
  profile: any = null;
  private currentUser: User | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  // Inicializar el estado de autenticación
  private initializeAuthState() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      this.isLogued = !!user;
      if (user) {
        this.profile = await this.getProfile(user.uid);
      } else {
        this.profile = null;
      }
    });
  }

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Verificar si el usuario está logueado
  verifyIsLogued(): boolean {
    return this.isLogued;
  }

  // Obtener perfil del usuario desde Firestore
  async getProfile(uid: string) {
    try {
      const profileDocRef = doc(this.firestore, `users/${uid}`);
      const profileSnap = await getDoc(profileDocRef);
      return profileSnap.exists() ? profileSnap.data() : null;
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return null;
    }
  }

  // Verificar contraseña
  async verifyPassword(password: string): Promise<boolean> {
    const user = this.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(user.email || '', password);
      try {
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        return false;
      }
    }
    return false;
  }

  // Registrar un nuevo usuario
  async registerUser(email: string, password: string, additionalData: { name: string; phone: string; username: string }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      const userDocRef = doc(this.firestore, `users/${userId}`);
      await setDoc(userDocRef, { ...additionalData, email });
      console.log('Usuario registrado y documento creado en Firestore');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Iniciar sesión con email y contraseña
 // Iniciar sesión con email y contraseña
    async loginUser(email: string, password: string) {
      try {
        // Autenticar al usuario con Firebase
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

        // Establecer los datos del usuario actual
        this.currentUser = userCredential.user;
        this.isLogued = true;

        // Obtener el perfil del usuario desde Firestore
        this.profile = await this.getProfile(userCredential.user.uid);

        // Mensaje de éxito
        console.log('Usuario autenticado:', userCredential.user);

        // Redirigir al perfil
        this.router.navigateByUrl('/profile');
      } catch (error: any) {
        console.error('Error al iniciar sesión:', error);

        // Mostrar un mensaje de error personalizado según el código de error de Firebase
        const errorMessage = this.getFirebaseErrorMessage(error.code);
        alert(`Error al iniciar sesión: ${errorMessage}`);
        
        throw error; // Re-lanzar el error para que pueda manejarse externamente si es necesario
      }
    }

    // Método auxiliar para obtener mensajes de error más claros
    private getFirebaseErrorMessage(code: string): string {
      const errorMessages: { [key: string]: string } = {
        'auth/user-not-found': 'Usuario no encontrado. Verifique su email.',
        'auth/wrong-password': 'Contraseña incorrecta. Intente nuevamente.',
        'auth/invalid-email': 'El formato del email es inválido.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
        'auth/too-many-requests': 'Demasiados intentos. Por favor, intente más tarde.'
      };

      return errorMessages[code] || 'Ocurrió un error desconocido. Intente nuevamente.';
    }


  // Iniciar sesión con Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);

      this.currentUser = userCredential.user;
      this.isLogued = true;

      const profile = await this.getProfile(userCredential.user.uid);
      if (!profile) {
        const userDocRef = doc(this.firestore, `users/${userCredential.user.uid}`);
        await setDoc(userDocRef, {
          name: userCredential.user.displayName || 'Sin nombre',
          email: userCredential.user.email || 'Sin email',
          phone: userCredential.user.phoneNumber || 'Sin teléfono',
        });
      }

      this.profile = await this.getProfile(userCredential.user.uid);
      console.log('Usuario autenticado con Google:', userCredential.user);
      this.router.navigateByUrl('/profile');
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logoutUser() {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      this.isLogued = false;
      this.profile = null;
      console.log('Usuario cerró sesión');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Actualizar contraseña
  async updateUserPassword(newPassword: string) {
    const user = this.currentUser;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        console.log('Contraseña actualizada');
      } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        throw error;
      }
    } else {
      console.error('No hay usuario logueado para actualizar la contraseña');
    }
  }

  // Actualizar perfil del usuario en Firestore
  async updateUserProfile(updateData: { email?: string; name?: string; phone?: string }) {
    const user = this.currentUser;
    if (user) {
      try {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        await updateDoc(userDocRef, updateData);

        if (updateData.email) {
          await updateEmail(user, updateData.email);
        }

        this.profile = await this.getProfile(user.uid);
        console.log('Perfil actualizado en Firestore');
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
      }
    } else {
      console.error('No hay usuario logueado para actualizar el perfil');
    }
  }

  // Enviar correo de recuperación de contraseña
  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de recuperación enviado');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw error;
    }
  }
}
