// ai-chat.js - WhatsApp-styled AI Chat Controller
const aiChat = {
    isOpen: false,
    
    init() {
        this.setupListeners();
    },

    setupListeners() {
        const floatBtn = document.getElementById('whatsapp-float-btn');
        const closeBtn = document.getElementById('ai-chat-close');
        const sendBtn = document.getElementById('ai-chat-send');
        const inputField = document.getElementById('ai-chat-input');

        if (floatBtn) {
            floatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleChat();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleChat(false));
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSend());
        }

        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSend();
                }
            });
        }
    },

    toggleChat(forceState = null) {
        const widget = document.getElementById('ai-chat-widget');
        if (!widget) return;

        this.isOpen = forceState !== null ? forceState : !this.isOpen;
        if (this.isOpen) {
            widget.classList.add('open');
            document.getElementById('ai-chat-input').focus();
        } else {
            widget.classList.remove('open');
        }
    },

    async handleSend() {
        const inputField = document.getElementById('ai-chat-input');
        const message = inputField.value.trim();
        if (!message) return;

        // Clear input
        inputField.value = '';
        
        // Render user message
        this.appendMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await api.chatMessage(message);
            this.hideTypingIndicator();
            this.appendMessage(response.reply, 'bot');
        } catch (err) {
            this.hideTypingIndicator();
            this.appendMessage("Sorry, I am having trouble connecting to the store right now.", 'bot');
        }
    },

    appendMessage(text, sender) {
        const body = document.getElementById('ai-chat-body');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}-msg`;
        
        // Format text with basic markdown for bold (using asterisks)
        const formattedText = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        
        msgDiv.innerHTML = `
            <div class="msg-content">
                ${formattedText}
                <span class="msg-time">${time} ${sender === 'user' ? '<i class="fa-solid fa-check-double read-ticks"></i>' : ''}</span>
            </div>
        `;
        
        body.appendChild(msgDiv);
        body.scrollTop = body.scrollHeight;
    },

    showTypingIndicator() {
        const body = document.getElementById('ai-chat-body');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg bot-msg typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="msg-content">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
        `;
        body.appendChild(typingDiv);
        body.scrollTop = body.scrollHeight;
    },

    hideTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    aiChat.init();
});
