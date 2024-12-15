import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DatabaseService } from '../../../services/database.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  profileForm!: FormGroup;

  constructor(
    public auth: AuthService,
    public db: DatabaseService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLogued) {
      // Redirigir a la página de inicio de sesión si no está autenticado
      this.router.navigateByUrl('/login');
    } else {
      this.initializeForm();
    }
  }

  initializeForm() {
    if (this.auth.profile) {
      this.profileForm = this.fb.group({
        email: [this.auth.profile?.email, [Validators.required, Validators.email]],
        name: [this.auth.profile?.name, Validators.minLength(4)],
        nickname: [this.auth.profile?.nickname, Validators.minLength(4)],
        photoURL: [''],
        phone: [this.auth.profile?.phone],
        password: ['', Validators.required], // Campo para la contraseña actual
        newPassword: ['', Validators.minLength(6)] // Campo para la nueva contraseña
      });
    } else {
      this.profileForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.minLength(4)],
        nickname: ['', Validators.minLength(4)],
        photoURL: [''],
        phone: [''],
        password: ['', Validators.required], // Campo para la contraseña actual
        newPassword: ['', Validators.minLength(6)] // Campo para la nueva contraseña
      });
    }
  }

  async onEdit() {
    if (this.profileForm.valid) {
      const formValues = this.profileForm.value;
      const isVerified = await this.auth.verifyPassword(formValues.password);
      if (isVerified) {
        const updateData: { [key: string]: any } = {
          email: formValues.email,
          name: formValues.name,
          photoURL: formValues.photoURL,
          nickname: formValues.nickname,
          phone: formValues.phone
        };

        if (formValues.newPassword) {
          updateData['password'] = formValues.newPassword;
        }

        try {
          await this.auth.updateUserProfile(updateData);
          console.log('Datos actualizados', updateData);
          alert('Perfil actualizado con éxito');
        } catch (error) {
          console.error('Error al actualizar los datos', error);
          alert('Error al actualizar el perfil');
        }
      } else {
        alert('Contraseña actual incorrecta');
      }
    } else {
      console.log(this.profileForm);
      alert('Datos incorrectos');
    }
  }
}
