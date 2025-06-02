document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotHeader = document.querySelector('.chatbot-header');
    const chatbotBody = document.querySelector('.chatbot-body');
    const chatbotInput = document.querySelector('.chatbot-input');
    const chatbotSend = document.querySelector('.chatbot-send');

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.toggle('hidden');
        chatbotToggle.classList.toggle('hidden');
    });

    // Collapse/expand chatbot
    chatbotHeader.addEventListener('click', function() {
        chatbotContainer.classList.toggle('collapsed');
    });

    // Send message when clicking send button
    chatbotSend.addEventListener('click', sendMessage);

    // Send message when pressing Enter
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatbotBody.appendChild(typingIndicator);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Send message to server
        fetch('/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            chatbotBody.removeChild(typingIndicator);
            
            // Add bot response to chat
            addMessage(data.response, 'bot');
        })
        .catch(error => {
            console.error('Error:', error);
            chatbotBody.removeChild(typingIndicator);
            addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        });
    }

    // Function to add message to chat
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message`;
        messageElement.textContent = message;
        chatbotBody.appendChild(messageElement);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    // Add initial bot message
    setTimeout(() => {
        addMessage('Hello! How can I help you today?', 'bot');
    }, 500);
});