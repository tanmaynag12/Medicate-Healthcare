const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.querySelector(".send-btn");
const clearChatButton = document.querySelector(".clear-chat-btn");
const username = window.username || 'there';

function appendMessage(sender, text, icon) {
    const div = document.createElement("div");
    div.className = `${sender} message`;
    div.innerHTML = `
 <div class="icon ${sender}-icon">${icon}</div>
<div class="text">${text}</div>
 `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(text) {
    appendMessage("bot", text, '🔮');
}

function addUserMessage(text) {
    appendMessage("user", text, '💬');
}

function addQuickReplies(options) {
    const container = document.createElement("div");
    container.className = "quick-replies";

    options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "quick-reply-btn";
        btn.textContent = option;
        btn.onclick = () => {
            addUserMessage(option);
            sendMessage(option);
        };
        container.appendChild(btn);
    });

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage(msg) {
    const message = msg || userInput.value.trim();
    if (!message) return;

    if (!msg) addUserMessage(message);
    userInput.value = "";

    try {

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'bot message typing-indicator';
        typingIndicator.innerHTML = '<div class="icon bot-icon">🔮</div><div class="text">Thinking...</div>';
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });


        typingIndicator.remove();

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        addBotMessage(data.reply);
    } catch (error) {

        const existingTypingIndicator = document.querySelector('.typing-indicator');
        if (existingTypingIndicator) {
            existingTypingIndicator.remove();
        }
        addBotMessage("Sorry, something went wrong. Please try again later.");
        console.error("Error sending message:", error);
    }
}


// Send button click
sendButton.addEventListener("click", () => {
    sendMessage();
});

// Enter key
userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // stops page reload
        sendMessage();
    }
});



clearChatButton.addEventListener("click", async () => {
    try {
        const response = await fetch('/clear_history', {
            method: 'POST'
        });

        if (response.ok) {

            chatBox.innerHTML = '';
            addBotMessage(`Welcome ${username}! How can I help you today?`);
            addQuickReplies([
                "Book an appointment",
                "Get medicine info",
                "Talk to a doctor",
                "Help with symptoms",
            ]);
        } else {
            console.error('Failed to clear history on the server.');
            addBotMessage("Failed to clear chat history. Please try refreshing the page.");
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        addBotMessage("Failed to clear chat history. Please check your network connection.");
    }
});

window.onload = () => {
    // Get history passed from Flask (assuming you updated HTML to include window.chatHistory)
    const history = window.chatHistory || []; 
    
    if (history.length > 0) {
        // If history exists, render it
        history.forEach(entry => {
            // Note: We only need to check the role and parts for rendering the message text
            const role = entry.role;
            // The text is stored in entry.parts[0].text in Gemini history format
            const text = entry.parts && entry.parts[0] && entry.parts[0].text ? entry.parts[0].text : '...'; 
            
            if (role === 'user') {
                addUserMessage(text);
            } else if (role === 'model') {
                addBotMessage(text);
            }
        });
    } else {
        // If no history, show the initial welcome message and quick replies
        addBotMessage(`Welcome ${username}! How can I help you today?`);
        addQuickReplies([
            "Book an appointment",
            "Get medicine info",
            "Talk to a doctor",
            "Help with symptoms",
        ]);
    }
};

const chatbotWidget = document.getElementById("chatbot-widget");
const chatbotBox = document.getElementById("chatbot-box");

chatbotWidget.addEventListener("click", () => {
    chatbotBox.classList.toggle("open");
});
