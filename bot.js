const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;

function createBot() {
  const bot = mineflayer.createBot({
    host: 'Schoolserver-L06O.aternos.me',
    port: 35975,
    username: 'azlaandagoat'
  });

  bot.loadPlugin(pathfinder);

  let mining = false;

  bot.once('spawn', () => {
    console.log('Bot spawned');
    bot.chat('Hello! I am new!');
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (message === '!faraan') {
      mining = true;
      bot.chat('Starting to mine!');
      mineResources(bot);
    }

    if (message === '!stop') {
      mining = false;
      bot.chat('Stopping mining!');
    }

    // Simple chat interaction
    if (message.includes('hello')) bot.chat(`Hello ${username}! How can I help you today?`);
    if (message.includes('how are you')) bot.chat(`I'm just a bot, but I'm always ready to mine and fight!`);
  });

  async function mineResources(bot) {
    while (mining) {
      // Find and collect wood
      const log = bot.findBlock({
        matching: block => block.name.includes('log'),
        maxDistance: 32
      });
      if (log) {
        bot.chat('Found some wood! Chopping it down.');
        await bot.collectBlock.collect(log);
      }

      // Craft wooden pickaxe
      const craftingTable = bot.findBlock({
        matching: block => block.name === 'crafting_table',
        maxDistance: 32
      });
      if (craftingTable) {
        bot.chat('Found a crafting table! Let’s make some tools.');
        await bot.pathfinder.goto(new goals.GoalBlock(craftingTable.position.x, craftingTable.position.y, craftingTable.position.z));
        const woodenPickaxeRecipe = bot.recipesAll('wooden_pickaxe')[0];
        if (woodenPickaxeRecipe) await bot.craft(woodenPickaxeRecipe, 1, craftingTable);
      }

      // Find and mine stone
      const stone = bot.findBlock({
        matching: block => block.name === 'stone',
        maxDistance: 32
      });
      if (stone) {
        bot.chat('Found some stone! Time to mine.');
        await bot.dig(stone);
      }

      // Night actions: fight mobs
      if (bot.time.timeOfDay >= 13000 && bot.time.timeOfDay <= 23000) {
        const mob = bot.nearestEntity(entity => entity.type === 'hostile');
        if (mob) {
          bot.chat('A mob! Time to fight!');
          await bot.attack(mob);
        }
      }

      // Day actions: continue mining
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    }
  }

  // Prevent disconnection when alone - running, jumping, and chatting to self
  setInterval(() => {
    if (!mining) {
      bot.chat('Still here! Just running around.');
      bot.setControlState('forward', true);
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('forward', false);
        bot.setControlState('jump', false);
      }, 50000); // Run and jump for 5 seconds
    }
  }, 60000); // Every minute

  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting...');
    setTimeout(createBot, 60000); // Reconnect after 5 seconds
  });

  bot.on('error', err => console.log('Error:', err));
}

createBot();