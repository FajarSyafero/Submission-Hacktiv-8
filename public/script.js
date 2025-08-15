document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  const chatHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    addMessage(userMessage, 'user');
    chatHistory.push({ role: 'user', content: userMessage });

    userInput.value = '';
    userInput.focus();

    const typingIndicator = showTypingIndicator();

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
        }),
      });

      typingIndicator.remove();

      if (!response.ok) {
        addMessage('Failed to get response from server.', 'model');
        chatHistory.pop();
        return;
      }

      const data = await response.json();

      if (data && data.response) {
        addMessage(data.response, 'model');
        chatHistory.push({ role: 'model', content: data.response });
      } else {
        addMessage('Sorry, no response received.', 'model');
        chatHistory.pop();
      }
    } catch (error) {
      console.error('Error:', error);
      typingIndicator.remove();
      addMessage('Failed to get response from server.', 'model');
      chatHistory.pop();
    }
  });

  function addMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(className);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }

  function showTypingIndicator() {
    const indicatorElement = document.createElement('div');
    indicatorElement.classList.add('model', 'typing-indicator');
    indicatorElement.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(indicatorElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return indicatorElement;
  }
});