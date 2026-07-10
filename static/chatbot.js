const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.querySelector(".send-btn");
const clearChatButton = document.querySelector(".clear-chat-btn");
const username = window.username || "there";

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
  appendMessage("bot", text, "🔮");
}

function addUserMessage(text) {
  appendMessage("user", text, "💬");
}

function addQuickReplies(options) {
  const container = document.createElement("div");
  container.className = "quick-replies";

  options.forEach((option) => {
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
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "bot message typing-indicator";
    typingIndicator.innerHTML =
      '<div class="icon bot-icon">🔮</div><div class="text">Thinking...</div>';
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
    const existingTypingIndicator = document.querySelector(".typing-indicator");
    if (existingTypingIndicator) {
      existingTypingIndicator.remove();
    }
    addBotMessage("Sorry, something went wrong. Please try again later.");
    console.error("Error sending message:", error);
  }
}

sendButton.addEventListener("click", () => {
  sendMessage();
});

userInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

clearChatButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/clear_history", {
      method: "POST",
    });

    if (response.ok) {
      chatBox.innerHTML = "";
      addBotMessage(`Welcome ${username}! How can I help you today?`);
      addQuickReplies([
        "Book an appointment",
        "Get medicine info",
        "Talk to a doctor",
        "Help with symptoms",
      ]);
    } else {
      console.error("Failed to clear history on the server.");
      addBotMessage(
        "Failed to clear chat history. Please try refreshing the page.",
      );
    }
  } catch (error) {
    console.error("Error clearing history:", error);
    addBotMessage(
      "Failed to clear chat history. Please check your network connection.",
    );
  }
});

window.onload = () => {
  addBotMessage(`Welcome ${username}! How can I help you today?`);
  addQuickReplies([
    "Book an appointment",
    "Get medicine info",
    "Talk to a doctor",
    "Help with symptoms",
  ]);

  const chatbotWidget = document.getElementById("chatbot-widget");
  const chatbotBox = document.getElementById("chatbot-box");

  if (chatbotWidget && chatbotBox) {
    chatbotWidget.addEventListener("click", () => {
      chatbotBox.classList.toggle("open");
    });
  }
};

const historyButton = document.querySelector(".history-btn");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const closeHistoryBtn = document.getElementById("close-history-btn");

function formatDateLabel(dateStr) {
  if (dateStr === "Unknown date") return dateStr;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

historyButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/get_history");
    if (!response.ok) throw new Error("Failed to fetch history");

    const groups = await response.json();
    historyList.innerHTML = "";

    if (groups.length === 0) {
      historyList.innerHTML =
        '<div class="history-empty">No previous history found.</div>';
      historyPanel.classList.add("open");
      return;
    }

    groups.forEach((group) => {
      const dateGroup = document.createElement("div");
      dateGroup.className = "history-date-group";

      const dateHeader = document.createElement("button");
      dateHeader.className = "history-date-header";
      dateHeader.innerHTML = `
        <span>${formatDateLabel(group.date)}</span>
        <span class="history-date-count">${group.messages.length} msgs</span>
      `;

      const messagesContainer = document.createElement("div");
      messagesContainer.className = "history-date-messages";
      messagesContainer.style.display = "none";

      let rendered = false;
      dateHeader.addEventListener("click", () => {
        const isOpen = messagesContainer.style.display === "block";

        if (!rendered) {
          group.messages.forEach((entry) => {
            const text =
              entry.parts && entry.parts[0] && entry.parts[0].text
                ? entry.parts[0].text
                : "...";
            const item = document.createElement("div");
            item.className = `history-item ${entry.role}`;
            item.textContent = text;
            item.onclick = () => {
              userInput.value = text;
              userInput.focus();
              historyPanel.classList.remove("open");
            };
            messagesContainer.appendChild(item);
          });
          rendered = true;
        }

        messagesContainer.style.display = isOpen ? "none" : "block";
        dateGroup.classList.toggle("expanded", !isOpen);
      });

      dateGroup.appendChild(dateHeader);
      dateGroup.appendChild(messagesContainer);
      historyList.appendChild(dateGroup);
    });

    historyPanel.classList.add("open");
  } catch (error) {
    console.error("Error loading history:", error);
  }
});

closeHistoryBtn.addEventListener("click", () => {
  historyPanel.classList.remove("open");
});
