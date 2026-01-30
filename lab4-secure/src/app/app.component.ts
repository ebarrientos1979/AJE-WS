import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  sourcesCount?: number;
}

interface ApiResponse {
  query: string;
  response: string;
  sources_count: number;
  sources: any[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container">
      <div class="header">
        <h1><i class="fas fa-shopping-cart"></i> AJE Delivery</h1>
        <p>Asistente Virtual - Pregúntame sobre productos, precios y delivery</p>
      </div>

      <div class="chat-container">
        <div class="chat-messages" #messagesContainer>
          <div *ngIf="messages.length === 0" class="suggestions">
            <div class="suggestion-chip" *ngFor="let suggestion of suggestions" 
                 (click)="sendMessage(suggestion)">
              {{ suggestion }}
            </div>
          </div>

          <div *ngFor="let message of messages" class="message" [class]="message.role">
            <div class="message-avatar">
              <i [class]="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div class="message-content">
              {{ message.content }}
              
              <div *ngIf="message.sources && message.sourcesCount > 0" class="sources">
                <div class="sources-header">
                  <i class="fas fa-book"></i> Fuentes ({{ message.sourcesCount }} documentos)
                </div>
                <div *ngFor="let source of message.sources.slice(0, 2)">
                  {{ source.content.substring(0, 100) }}...
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="message assistant">
            <div class="message-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-content loading">
              <div class="loading-spinner"></div>
              Consultando información...
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
          </div>
        </div>

        <div class="chat-input">
          <div class="input-container">
            <input 
              type="text" 
              class="input-field"
              [(ngModel)]="currentMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Escribe tu pregunta sobre AJE Delivery..."
              [disabled]="isLoading">
            
            <button 
              class="send-button" 
              (click)="sendMessage()"
              [disabled]="isLoading || !currentMessage.trim()">
              <i class="fas fa-paper-plane"></i>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  apiUrl: string = '';

  suggestions: string[] = [
    '¿Qué productos de abarrotes tienen disponibles?',
    '¿Cuáles son los precios de los productos?',
    '¿Cómo funciona el servicio de delivery?',
    '¿Cómo puedo hacer un pedido?'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadConfig();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async loadConfig() {
    try {
      const config = await this.http.get<any>('/config.json').toPromise();
      this.apiUrl = config.apiGatewayUrl;
    } catch (error) {
      console.error('Error loading config:', error);
      this.errorMessage = 'Error cargando configuración';
    }
  }

  async sendMessage(message?: string) {
    const messageToSend = message || this.currentMessage.trim();
    
    if (!messageToSend || this.isLoading) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content: messageToSend
    });

    this.currentMessage = '';
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.http.post<ApiResponse>(this.apiUrl, {
        query: messageToSend
      }).toPromise();

      if (response) {
        this.messages.push({
          role: 'assistant',
          content: response.response,
          sources: response.sources,
          sourcesCount: response.sources_count
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      let errorMsg = 'Error de conexión con el servidor';
      
      if (error.status === 0) {
        errorMsg = 'No se pudo conectar al servidor. Verifica tu conexión.';
      } else if (error.status >= 500) {
        errorMsg = 'Error interno del servidor. Intenta nuevamente.';
      } else if (error.error?.error) {
        errorMsg = error.error.error;
      }

      this.messages.push({
        role: 'assistant',
        content: `❌ ${errorMsg}`
      });
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}
