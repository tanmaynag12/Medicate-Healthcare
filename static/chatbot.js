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
    // Load chat history first
    const history = window.chatHistory || []; 
    
    if (history.length > 0) {
        history.forEach(entry => {
            const role = entry.role;
            const text = entry.parts && entry.parts[0] && entry.parts[0].text ? entry.parts[0].text : '...'; 
            
            if (role === 'user') {
                addUserMessage(text);
            } else if (role === 'model') {
                addBotMessage(text);
            }
        });
    } else {
        addBotMessage(`Welcome ${username}! How can I help you today?`);
        addQuickReplies([
            "Book an appointment",
            "Get medicine info",
            "Talk to a doctor",
            "Help with symptoms",
        ]);
    }

    // Initialize widget ONLY if elements exist (for homepage)
    const chatbotWidget = document.getElementById("chatbot-widget");
    const chatbotBox = document.getElementById("chatbot-box");
    
    if (chatbotWidget && chatbotBox) {
        chatbotWidget.addEventListener("click", () => {
            chatbotBox.classList.toggle("open");
        });
    }
};
const historyButton = document.querySelector(".history-btn");

historyButton.addEventListener("click", async () => {
    try {
        const response = await fetch('/get_history'); // Flask route to fetch history
        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }

        const history = await response.json();

        // Clear current chat before showing history
        chatBox.innerHTML = '';

        if (history.length > 0) {
            history.forEach(entry => {
                const role = entry.role;
                const text = entry.parts && entry.parts[0] && entry.parts[0].text ? entry.parts[0].text : "...";
                if (role === 'user') {
                    addUserMessage(text);
                } else if (role === 'model') {
                    addBotMessage(text);
                }
            });
        } else {
            addBotMessage("No previous history found.");
        }
    } catch (error) {
        console.error("Error loading history:", error);
        addBotMessage("Sorry, I couldn't load chat history.");
    }
});

