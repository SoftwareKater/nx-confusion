import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

const MATERIAL_IMPORTS = [MatMenuModule, MatIconModule, MatToolbarModule];

@NgModule({
  declarations: [AppComponent, ToolbarComponent],
  imports: [BrowserAnimationsModule, BrowserModule, ...MATERIAL_IMPORTS],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
