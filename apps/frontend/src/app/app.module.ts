import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { HowToDialogComponent } from './components/dialogs/how-to/how-to.dialog.component';

const DIALOG_DECLARATIONS = [HowToDialogComponent];
const MATERIAL_IMPORTS = [
  MatButtonModule,
  MatDialogModule,
  MatMenuModule,
  MatIconModule,
  MatToolbarModule,
];

@NgModule({
  declarations: [AppComponent, ToolbarComponent, ...DIALOG_DECLARATIONS],
  imports: [BrowserAnimationsModule, BrowserModule, ...MATERIAL_IMPORTS],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
