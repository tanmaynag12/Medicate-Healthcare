document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('chatbot-close');
    const chatbox = document.getElementById('chatbot-box');
    const chatInput = document.getElementById('chatbot-text');
    const chatSendButton = document.getElementById('chatbot-send');
    const chatMessages = document.getElementById('chatbot-messages');

    // Function to toggle the chatbox visibility
    const toggleChatbot = () => {
        chatbox.classList.toggle('open');
    };

    // Event listeners for the buttons
    toggleButton.addEventListener('click', toggleChatbot);
    closeButton.addEventListener('click', toggleChatbot);

    // Function to send a message
    const sendMessage = () => {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return; // Do not send empty messages

        // Create and append the user's message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user-message';
        userMessageDiv.textContent = userMessage;
        chatMessages.appendChild(userMessageDiv);

        // Clear the input field
        chatInput.value = '';

        // Scroll to the bottom of the chat messages
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate a bot response after a short delay
        setTimeout(() => {
            const botResponse = document.createElement('div');
            botResponse.className = 'chat-message bot-message';
            botResponse.textContent = `I received your message: "${userMessage}". How else can I assist you?`;
            chatMessages.appendChild(botResponse);
            
            // Scroll to the bottom again
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    };

    // Event listener for the send button
    chatSendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key in the input field
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});