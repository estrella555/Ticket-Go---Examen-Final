import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './pages/footer/footer.component'; // Importar FooterComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent], // Añadir FooterComponent a los imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Ticket-Go';
}
