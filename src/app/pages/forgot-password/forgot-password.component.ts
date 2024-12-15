import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule
import { Auth } from '@angular/fire/auth';
import { sendPasswordResetEmail } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  selector: 'app-forgot-password',
  standalone: true, // Indicar que es un componente independiente
  imports: [CommonModule, ReactiveFormsModule], // Añadir ReactiveFormsModule a los imports
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) { // Inyecta el Router
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    const email = this.forgotPasswordForm.value.email;
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        alert('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
        this.router.navigateByUrl('/login'); // Redirigir al login
      })
      .catch((error) => {
        console.error('Error al enviar el correo de recuperación:', error);
        alert('Hubo un error. Por favor, inténtalo de nuevo.');
      });
  }
}
