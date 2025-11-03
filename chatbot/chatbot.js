const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotOptions = document.getElementById("chatbot-options");
const chatbotBadge = document.getElementById("chatbot-badge");

// Tracks if chat was opened before
let chatbotOpened = false;

// Show badge on page load
window.addEventListener("load", () => {
  chatbotBadge.style.display = "flex";
});

chatbotToggle.addEventListener("click", () => {
  const isHidden =
    chatbotContainer.style.display === "none" ||
    chatbotContainer.style.display === "";

  if (isHidden) {
    chatbotContainer.style.display = "flex";
    chatbotBadge.style.display = "none";

    // Only show welcome message once per session
    if (!chatbotOpened) {
      chatbotMessages.innerHTML = "";
      displayMessage("bot", conversation.start.text);
      displayOptions(conversation.start.options);
      chatbotOpened = true;
    }
  } else {
    chatbotContainer.style.display = "none";
  }
});

// Conversation flow
const conversation = {
  start: {
    text: "Hello! Welcome to Cinemax website! How may I help you?",
    options: ["About us", "Services"]
  },
  "About us": {
    text: "Cinemax is a movie platform that offers a wide selection of film trailers to help you choose what to watch from various genres. It also provides suggestions based on your current weather and even random movie quotes or facts!",
    options: ["How to use weather movie suggestion?", "Back to main menu"]
  },
  "How to use weather movie suggestion?": {
    text: "Please open your location to use the feature.",
    options: ["Thank you!"]
  },
  "Thank you!": {
    text: "You're welcome! 😊",
    options: ["Back to main menu"]
  },
  Services: {
    text: "We provide movie recommendations based on the current weather in your area. We also show film trailers and share fun movie quotes and facts!",
    options: ["Back to main menu"]
  },
  backToMenu: {
    text: "Thank you for using Cinemax. Enjoy finding great movies! 🍿",
    options: ["About us", "Services"]
  }
};

let currentNode = "start";

function displayMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function displayOptions(options) {
  chatbotOptions.innerHTML = "";
  options.forEach(option => {
    const button = document.createElement("button");
    button.classList.add("option");
    button.textContent = option;
    button.addEventListener("click", () => handleOption(option));
    chatbotOptions.appendChild(button);
  });
}

function handleOption(option) {
  displayMessage("user", option);

  if (option === "Back to main menu" || option === "Thank you!") {
    currentNode = "backToMenu";
  } else if (conversation[option]) {
    currentNode = option;
  }

  setTimeout(() => {
    displayMessage("bot", conversation[currentNode].text);
    displayOptions(conversation[currentNode].options);
  }, 600);
}

// Initial display (only badge)
chatbotContainer.style.display = "none";
