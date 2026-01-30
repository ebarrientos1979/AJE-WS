// Configuration
let config = {
    apiGatewayUrl: 'https://re0wamange.execute-api.us-east-1.amazonaws.com/prod/query'
};

// Load configuration from config.json
async function loadConfig() {
    try {
        const response = await fetch('./config.json');
        const configData = await response.json();
        config = { ...config, ...configData };
        console.log('Configuration loaded:', config);
    } catch (error) {
        console.warn('Could not load config.json, using default configuration');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
});

// Global variables
let isLoading = false;

// Send message function
async function sendMessage(message = null) {
    const messageInput = document.getElementById('messageInput');
    const messageText = message || messageInput.value.trim();
    
    if (!messageText || isLoading) return;
    
    // Clear input and hide suggestions
    messageInput.value = '';
    hideSuggestions();
    
    // Add user message
    addMessage('user', messageText);
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch(config.apiGatewayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: messageText
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Hide loading
        hideLoading();
        
        // Add assistant response
        addMessage('assistant', data.response, data.sources, data.sources_count);
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        
        let errorMessage = 'Lo siento, hubo un error al procesar tu consulta.';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Error interno del servidor. Por favor, intenta nuevamente.';
        }
        
        addMessage('assistant', `❌ ${errorMessage}`);
    }
}

// Send suggestion
function sendSuggestion(suggestion) {
    sendMessage(suggestion);
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add message to chat
function addMessage(role, content, sources = null, sourcesCount = 0) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarIcon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    let sourcesHtml = '';
    if (sources && sourcesCount > 0) {
        sourcesHtml = `
            <div class="sources">
                <strong><i class="fas fa-book me-1"></i>Fuentes (${sourcesCount} documentos):</strong><br>
                ${sources.slice(0, 2).map(source => 
                    `• ${source.content.substring(0, 100)}...`
                ).join('<br>')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            ${content}
            ${sourcesHtml}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Show loading indicator
function showLoading() {
    isLoading = true;
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    
    sendButton.disabled = true;
    messageInput.disabled = true;
    
    const chatMessages = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingMessage';
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content loading-message">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            Consultando información...
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
}

// Hide loading indicator
function hideLoading() {
    isLoading = false;
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const loadingMessage = document.getElementById('loadingMessage');
    
    sendButton.disabled = false;
    messageInput.disabled = false;
    
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Hide suggestion chips
function hideSuggestions() {
    const suggestionChips = document.getElementById('suggestionChips');
    if (suggestionChips) {
        suggestionChips.style.display = 'none';
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
