const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;

function createBot() {
  const bot = mineflayer.createBot({
    host: 'Schoolserver-L06O.aternos.me',
    port: 35975,
    username: `randombot_007` // Random username to avoid conflicts
  });

  bot.loadPlugin(pathfinder);

  let mining = false;

  bot.once('spawn', () => {
    console.log('Bot spawned');
    bot.chat('Hello! I am new!');
    stayActive();
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!faraan') {
      mining = true;
      bot.chat('Starting to mine!');
      mineResources();
    }

    if (message === '!stop') {
      mining = false;
      bot.chat('Stopping mining!');
    }

    if (message.includes('hello')) bot.chat(`Hello ${username}! How can I help you today?`);
    if (message.includes('how are you')) bot.chat(`I'm just a bot, but I'm always ready to mine and fight!`);
  });

  async function mineResources() {
    while (mining && bot.entity) {
      const log = bot.findBlock({
        matching: block => block.name.includes('log'),
        maxDistance: 32
      });
      if (log) {
        bot.chat('Found some wood! Chopping it down.');
        await bot.collectBlock.collect(log).catch(console.error);
      }

      const craftingTable = bot.findBlock({
        matching: block => block.name === 'crafting_table',
        maxDistance: 32
      });
      if (craftingTable) {
        bot.chat('Found a crafting table! Let’s make some tools.');
        await bot.pathfinder.goto(new goals.GoalBlock(craftingTable.position.x, craftingTable.position.y, craftingTable.position.z));
        const woodenPickaxeRecipe = bot.recipesAll('wooden_pickaxe')[0];
        if (woodenPickaxeRecipe) await bot.craft(woodenPickaxeRecipe, 1, craftingTable).catch(console.error);
      }

      const stone = bot.findBlock({
        matching: block => block.name === 'stone',
        maxDistance: 32
      });
      if (stone) {
        bot.chat('Found some stone! Time to mine.');
        await bot.dig(stone).catch(console.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  function stayActive() {
    setInterval(() => {
      if (!mining && bot.entity) {
        bot.chat('Still here! Just moving a bit.');
        bot.setControlState('forward', true);
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.setControlState('jump', false);
        }, 5000);
      }
    }, 60000);
  }

  bot.on('end', (reason) => {
    console.log(`Bot disconnected: ${reason}. Reconnecting in 1 minute...`);
    setTimeout(createBot, 60000);
  });

  bot.on('kicked', (reason) => {
    console.log(`Bot was kicked: ${reason}`);
  });

  bot.on('error', (err) => {
    if (err.message.includes('passengers')) return; // Ignore passenger-related errors
    console.error('Bot error:', err);
  });

  bot.on('resourcePack', async () => {
    try {
      console.log('Server requested a resource pack. Accepting...');
      await bot.acceptResourcePack();
      console.log('Resource pack accepted successfully.');
    } catch (err) {
      console.error('Failed to accept resource pack:', err);
    }
  });

  // Extra safe fix for vehicle/passenger-related crashes
  bot._client.on('set_passengers', (packet) => {
    if (!packet || typeof packet.vehicleId === 'undefined' || !Array.isArray(packet.passengerIds)) return;

    const vehicle = bot.entities[packet.vehicleId];
    if (!vehicle) return;

    vehicle.passengers = packet.passengerIds
      .map(id => bot.entities[id])
      .filter(entity => entity); // Filter out null/undefined passengers
  });
}

createBot();
