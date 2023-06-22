import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableHttpExample } from './table/table.component';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
    declarations: [
        AppComponent,

    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        TableHttpExample,
        HttpClientModule
    ]
})
export class AppModule { }
