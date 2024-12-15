import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
///////// importar firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

///////// importar httopclient module de forma global
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

///// para login y registro ////
import { Auth } from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [

    importProvidersFrom(HttpClientModule, FormsModule, ReactiveFormsModule, AngularFireAuthModule,
      CommonModule),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyB_zdV6Vf5-MBO13YdMMTgkZI9xe3Omqys",
      authDomain: "proyecto3-b0910.firebaseapp.com",
      projectId: "proyecto3-b0910",
      storageBucket: "proyecto3-b0910.firebasestorage.app",
      messagingSenderId: "49006438504",
      appId: "1:49006438504:web:955909744bfaadc6edb3dd",
      measurementId: "G-6G6NYP1NVK"
    })),

    ////// para login y registro
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)]
};