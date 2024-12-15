import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recomendaciones',
  standalone: true, // Indicar que es un componente independiente
  imports: [CommonModule, RouterModule], // Añadir CommonModule y RouterModule a los imports
  templateUrl: './recomendaciones.component.html',
  styleUrls: ['./recomendaciones.component.scss']
})
export class RecomendacionesComponent implements OnInit {
  @Input() category: string = '';
  recommendedEvents: any[] = [];

  constructor(private db: DatabaseService, private router: Router) { }

  ngOnInit(): void {
    if (this.category) {
      this.db.fetchFirestoreCollection('events').subscribe(
        (events: any[]) => {
          this.recommendedEvents = events.filter(event => event.category === this.category);
        },
        (error) => {
          console.error('Error al obtener eventos recomendados:', error);
        }
      );
    }
  }

  goToEvent(eventId: string) {
    this.router.navigate(['/evento', eventId]);
  }
}
