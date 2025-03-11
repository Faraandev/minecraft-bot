const mineflayer = require('mineflayer');



// Function to generate a random bot name
function getRandomName() {
  const names = ['BotMiner', 'AutoCrafter', 'StoneSlayer', 'NightRunner', 'BlockBreaker'];
  const randomSuffix = Math.floor(Math.random() * 1000);
  const randomName = names[Math.floor(Math.random() * names.length)] + randomSuffix;
  return randomName;
}

// Basic AI response function
function generateResponse(message) {
  message = message.toLowerCase();

  if (message.includes('hello') || message.includes('hi')) {
    return 'Hello! How can I assist you today?';
  } else if (message.includes('how are you')) {
    return 'Im just a bot, but Im running smoothly! Thanks for asking.';
  } else if (message.includes('what can you do')) {
    return 'I can chat, reconnect if I get disconnected, and maybe more as I learn!';
  } else if (message.includes('bye')) {
    return 'Goodbye! Hope to see you again soon.';
  } else {
    const genericResponses = [
      'Interesting... tell me more.',
      'Im thinking... but Im just a bot, after all.',
      'Hmmm, thats something to consider.',
      'Sounds fun! What else?',
      'I may not understand everything, but Im here to chat!'
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
}

// Bot creation and reconnect logic
function createBot() {
  const bot = mineflayer.createBot({
    host: 'Schoolserver-L06O.aternos.me', // Change to your server IP or hostname
    port: 35975, // Default Minecraft server port
    username: getRandomName(),
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return; // Ignore its own messages
    const response = generateResponse(message);
    bot.chat(response);
  });

  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting with a new name...');
    setTimeout(createBot, 60000); // Wait 1 minute before reconnecting
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err);
  });
}

createBot();
