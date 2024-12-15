import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-compras.component.html',
  styleUrls: ['./historial-compras.component.scss']
})
export class HistorialComprasComponent implements OnInit {
  compras: any[] = [];

  constructor(
    private db: DatabaseService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.loadComprasFromLocalStorage();

      this.db.getCompras(user.uid).subscribe(compras => {
        this.compras = compras;
        this.saveComprasToLocalStorage(compras);
        console.log('Historial de compras cargado desde Firestore:', this.compras);
      });
    }
  }

  saveComprasToLocalStorage(compras: any[]) {
    console.log('Guardando compras en localStorage:', compras);
    localStorage.setItem('compras', JSON.stringify(compras));
  }

  loadComprasFromLocalStorage() {
    const storedCompras = localStorage.getItem('compras');
    if (storedCompras) {
      this.compras = JSON.parse(storedCompras);
      console.log('Compras cargadas desde localStorage:', this.compras);
    } else {
      console.log('No se encontraron compras en localStorage');
    }
  }
}
