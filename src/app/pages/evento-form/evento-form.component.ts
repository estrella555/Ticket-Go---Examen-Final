import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.scss']
})
export class EventoFormComponent implements OnInit {
  action: string = 'create';
  id: any;
  data: any;
  form: FormGroup;
  eventos: any[] = []; // Lista de eventos para el Dashboard
  showForm: boolean = false; // Inicializa showForm como false para ocultar el formulario

  

  constructor(
    public activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public db: DatabaseService
  ) {
    // Configurar formulario reactivo
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      photoURL: ['', []],
      description: ['', []],
      country: ['', []],
      city: ['', []],
      location: ['', []],
      date: ['', []],
      price: ['', []],
      discount: ['', []],
      cantidadEntradas: ['',[]],
      category: ['', []],
    });

    // Detectar si hay una acción (create, update, delete)
    const routeAction = this.activatedRoute.snapshot.paramMap.get('action');
    this.action = routeAction ? routeAction : 'create';

    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    // Cargar eventos existentes para la tabla
    this.loadEvents();

    // Si es una acción diferente a "create", cargar los datos del evento seleccionado
    if (this.action !== 'create') {
      this.db.getDocumentById('events', this.id).subscribe((res: any) => {
        console.log('Evento seleccionado', res);
        this.data = res;

        if (res) {
          const { name, photoURL, description, country, city, location, date, price, discount, cantidadEntradas, category } = this.data;
          this.form.setValue({
            name: name || '',
            photoURL: photoURL || '',
            description: description || '',
            country: country || '',
            city: city || '',
            location: location || '',
            date: date || '',
            price: price || '',
            discount: discount || '',
            category: category || '',
            cantidadEntradas: cantidadEntradas || '',
          });
        }
      });
    }
  }



  // Método para alternar la visibilidad del formulario
  toggleForm() {
    this.showForm = !this.showForm;

    // Limpia el formulario y establece la acción como 'create' si se abre el formulario
    if (this.showForm) {
      this.action = 'create';
      this.form.reset();
    }
  }

  // Transacción CRUD
  transaction() {
    if (this.form.valid) {
      console.log('Formulario válido', this.form.value);

      if (this.action === 'create') {
        this.db.addFirestoreDocument('events', this.form.value).then(() => {
          alert('Evento creado');
          this.form.reset();
          this.loadEvents(); // Actualizar la tabla
        });
      }

      if (this.action === 'update') {
        this.db.updateFirestoreDocument('events', this.id, this.form.value).then(() => {
          alert('Evento actualizado');
          this.loadEvents(); // Actualizar la tabla
        });
      }

      if (this.action === 'delete') {
        this.db.deleteFirestoreDocument('events', this.id).then(() => {
          alert('Evento eliminado');
          this.loadEvents(); // Actualizar la tabla
        });
      }
    } else {
      alert('Formulario inválido');
    }
  }

  // Cargar eventos desde la base de datos
  loadEvents() {
    this.db.fetchFirestoreCollection('events').subscribe((res: any[]) => {
      this.eventos = res;
      console.log('Lista de eventos cargados:', this.eventos);
    });
  }

  // Método para crear un nuevo evento
  createEvent() {
    this.action = 'create';
    this.id = null;
    this.form.reset(); // Limpia el formulario para un nuevo evento
    alert('Evento creado')
  }

  // Editar evento
  editEvent(evento: any) {
    this.action = 'update';
    this.id = evento.id;
    this.form.patchValue(evento); // Cargar datos al formulario
    alert('Haga click en editar evento')
  }

  // Eliminar evento
  deleteEvent(eventoId: string) {
    if (confirm('¿Está seguro de eliminar este evento?')) {
      this.db.deleteFirestoreDocument('events', eventoId).then(() => {
        alert('Evento eliminado');
        this.loadEvents(); // Actualizar la tabla
      });
    }
  }
}
