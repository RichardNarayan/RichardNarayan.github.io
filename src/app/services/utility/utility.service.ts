import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private _snackBar: MatSnackBar) {}

  showSuccessMessageOpenSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 15000,
    });
  }
}
