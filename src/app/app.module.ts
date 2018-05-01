import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module

import { AppComponent }        from './app.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
// add JavaScript imports
import { HeroListComponent }   from './hero-list/hero-list.component';
import { HeroService }         from './hero.service';

@NgModule({
  declarations: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent // <--declare HeroListComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule // <-- #2 add to @NgModule imports
  ],
  // export for the DemoModule
  // ...
  exports: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent // <-- export HeroListComponent
  ],
  providers: [ HeroService ], // <-- provide HeroService
  bootstrap: [ AppComponent ]
})
export class AppModule { }
