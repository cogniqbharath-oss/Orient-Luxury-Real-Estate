document.addEventListener('DOMContentLoaded', () => {
    // Chatbot Toggle
    const chatToggle = document.getElementById('chat-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChat = document.getElementById('close-chat');

    chatToggle.addEventListener('click', () => {
        chatbotContainer.style.display = chatbotContainer.style.display === 'flex' ? 'none' : 'flex';
    });

    closeChat.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });

    // Chat Logic
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', `${sender}-message`);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleChat = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        // Add loading indicator from bot
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message');
        loadingDiv.textContent = '...';
        chatMessages.appendChild(loadingDiv);

        try {
            const response = await fetch('https://round-rice-813b.cogniq-bharath.workers.dev/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            chatMessages.removeChild(loadingDiv);
            addMessage(data.response || "I'm here to help you with Dubai real estate investments. Please contact sales@orientgroup.online for more details.", 'bot');
        } catch (error) {
            chatMessages.removeChild(loadingDiv);
            addMessage("I'm having a bit of trouble connecting. Please try again or reach out directly via WhatsApp.", 'bot');
        }
    };

    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // Lead Form Handling
    const leadForm = document.getElementById('lead-form');
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(leadForm);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const intent = formData.get('intent');

        const waMessage = `Hi Orient Luxury, I'm ${name}. I'm interested in ${intent}. My phone is ${phone}. Please send me the ROI details.`;
        const waUrl = `https://wa.me/971586622184?text=${encodeURIComponent(waMessage)}`;

        window.open(waUrl, '_blank');
    });

    // Suggestion Chips
    window.handleChipClick = (text) => {
        userInput.value = text;
        handleChat();
    };

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
