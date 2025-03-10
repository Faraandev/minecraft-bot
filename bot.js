const mineflayer = require('mineflayer');
const config = require('./config');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalFollow } = goals;

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username
});

bot.loadPlugin(pathfinder);

let mining = false;

bot.once('spawn', () => {
  console.log('Bot spawned');
  bot.chat('Hello! Type !mine to start mining or !stop to stop.');
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  if (message === '!mine') {
    mining = true;
    bot.chat('Starting to mine!');
    mineResources();
  }

  if (message === '!stop') {
    mining = false;
    bot.chat('Stopping mining!');
  }
});

async function mineResources() {
    while (mining) {
      try {
        // Find and collect wood
        const log = bot.findBlock({
          matching: block => block.name.includes('log'),
          maxDistance: 32
        });
        if (log) {
          bot.chat('Found some wood! Chopping it down.');
          await bot.collectBlock.collect(log);
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
            bot.attack(mob);
          }
        }
  
        // Random movement to prevent disconnect
        bot.setControlState('forward', true);
        bot.setControlState('jump', Math.random() < 0.5);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.setControlState('jump', false);
        }, 3000);
  
        // Delay to avoid freezing
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        bot.chat('Error while mining: ' + err.message);
      }
    }
  }
  

setInterval(() => {
  if (!mining) {
    bot.chat('Still here! Running and jumping.');
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('forward', false);
      bot.setControlState('jump', false);
    }, 5000);
  }
}, 60000);

bot.on('end', () => {
    console.log('Bot disconnected, attempting to reconnect...');
    setTimeout(() => {
      process.exit(1); // Let Render restart the bot
    }, 5000); // 5 seconds delay before reconnecting
  });
  
  bot.on('error', err => {
    console.log('Error:', err);
  });
  
