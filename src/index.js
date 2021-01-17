import Discord, { Message, MessageEmbed } from 'discord.js';
import { getUser, getUsers } from './database_handler.js';
const client = new Discord.Client();
const prefix = '!';
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const channel = client.channels.cache.find(
    (channel) => channel.id === '795004891851653154'
  );
  let newUserChannel = newState.channelID;
  let oldUserChannel = oldState.channelID;
  let channelName = newState.channel.name;
  channel.send(
    'oldUserChannel is ' +
      oldUserChannel +
      ' and newUserChannel is ' +
      newUserChannel
  );
  if (
    (oldUserChannel === null && newUserChannel !== null) ||
    (oldUserChannel !== null && newUserChannel !== null)
  ) {
    channel.send(
      'Come join to the ' + channelName + ' voice channel. Lets do it!'
    );
  }
});

client.on('message', async (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(' ');
  let leaderboardTitle = '🎯Discipline Challenge Leaderboard🎯';
  let user = await getUser(msg.author.id);
  if (msg.channel.id === '795023589992693770') {
    leaderboardTitle = 'NoFap Challenge Leaderboard🎯';
  }

  switch (args[0]) {
    case prefix + 'lb':
    case prefix + 'leaderboard':
      const maxUsers = 10;
      const users = await getUsers()
        .find()
        .sort({ score: -1 })
        .limit(maxUsers)
        .toArray();
      const embed = new MessageEmbed()
        .setTitle(leaderboardTitle)
        .setColor('RANDOM')
        .setDescription(users.map((x) => `<@${x.id}>: ${x.score}`).join('\n'))
        .setFooter(
          'Note: The rank is based on the total number of days completed successfully'
        )
        .setThumbnail(
          'https://media.npr.org/assets/img/2010/08/22/strength_wide-f82ab7c6cf40ee7df563c3a7a05f2709a38aac88-s800-c85.jpg'
        );
      msg.channel.send(embed);
      return;
    case prefix + 's':
    case prefix + 'success':
      if (!user) {
        await getUsers().insertOne({ id: msg.author.id, score: 1 });
        user = { id: msg.author.id, score: 1 };
      } else {
        await getUsers().updateOne(
          { id: user.id },
          { $set: { score: ++user.score } }
        );
      }
      msg.author.send('Wow! GOOD JOB!, Your total score is now ' + user.score);
      return;
    case prefix + 'eval':
      if (msg.author.id !== '400420516214865920') return;
      try {
        const string = await eval(args.slice(1).join(' '));
        console.log(string);
        if (string.length > 2000)
          return msg.channel.send('Output too big, please see console.');
        msg.channel.send(JSON.stringify(string));
      } catch (e) {
        console.error(e);
        msg.channel.send(e.message);
      }
      return;
    case prefix + 'help':
      const commands = {
        '!leaderboard (or !lb)': 'Display the discipline challenge leaderboard',
        '!success (or !s)': 'Add a successful day to your score',
        '!help': 'Display this commands meanu',
        '!remove': 'Remove yourself from the discipline challenge',
        '!decrease': 'Decrease your days count by 1',
        '!reset': 'Reset your days count back to 0',
        '!info': 'Display all the info about the discipline challenge',
        '!add n':
          'Add n days to your total score (example: use !add 7 to add 7 days)',
      };
      const helpEmbed = new MessageEmbed()
        .setTitle('Leaderboard Commands')
        .setColor('RANDOM')
        .setDescription(
          Object.keys(commands).map((x) => x + ': ' + commands[x])
        );
      msg.channel.send(helpEmbed);
      return;
    case prefix + 'reset':
      if (!user) {
        await getUsers().insertOne({ id: msg.author.id, score: 0 });
        user = { id: msg.author.id, score: 0 };
      } else {
        await getUsers().updateOne({ id: user.id }, { $set: { score: 0 } });
      }
      msg.author.send('Your score has been reset to 0.');
      return;
    case prefix + 'remove':
      if (user) {
        await getUsers().findOneAndDelete({ id: msg.author.id });
        msg.author.send(
          'Your have been successfully removed from the discpline challenge leaderboard. Feel free to join back any time!'
        );
      }
      return;
    case prefix + 'removeall':
      await getUsers().remove();
      msg.author.send(
        'Your have been successfully removed all participants from the discpline challenge leaderboard. Feel free to join back any time!'
      );
      return;
    case prefix + 'decrease':
      if (user && user.score > 0) {
        await getUsers().updateOne(
          { id: user.id },
          { $set: { score: --user.score } }
        );
        msg.author.send(
          'Your score has been decrased by 1. Your new score is now ' +
            user.score
        );
      }

      return;
    case prefix + 'info':
      const welcomeInfo = {
        '**When  does it start?**': 'Jan 1st (or any time you choose to join)',
        '**When does it end?**': 'After you complete 90 successful days',
        '**Why should I join**':
          'Develop the winner mentality and become a finisher',
        '**Where will it be?**': 'In this text channel (#discipline-challenge)',
      };
      const settingGoalsInfo = {
        1: 'Come up with a 5 year vision of where you want to be.',
        2: 'Come up with 3 - 5 goals for 2021. ',
        3: 'Ask yourself why do you want to accomplish each of the goals for each one of them ',
        4: 'Come up with the process for each goal.',
        5: 'Come up with 3 or 4 months goals (the duration of a semester)',
        6: 'Come up with monthly goals for January ',
        7: 'Come up with weekly goals for the first week of January',
      };
      const executingInfo = [
        'Right now I have the loser mentality when it comes to goals (I set up goals and never achieve them).',
        "The goal of the challenge is to develop the winner's mentality.",
        'For the next 90 days, we will write 10 very small daily goals in a journal (even as small as writing 3 lines of code or walking 100m lol) every single day.',
        'We have to achieve every single one of them by the end of the day. Every single one!',
      ];
      const accountabilityInfo = [
        '- Keep a progress journal and write down:',
        '\t - "What went well today?"',
        '\t - "What can I do better tomorrow?" ',
        '- Update in this chat minimum 2 times per week how the challenge goes. This chat will be fairly active so it will be easy to remember lol.',
        '**Additional notes:**',
        "What happens if you don't achieve the 10 daily goals? Don't restart, just keep moving forward and learn from the mistakes (by using accountability)!",
        "And that's it. Let's get started! Feel free to ask any questions you might have.",
      ];
      const welcomeEmbed = new MessageEmbed()
        .setTitle('Welcome to the 90 days discipline challenge:muscle::dart: ')
        .setColor('RANDOM')
        .setDescription(
          Object.keys(welcomeInfo).map((x) => x + ': ' + welcomeInfo[x])
        );
      const goalsEmbed = new MessageEmbed()
        .setTitle('1) Settings goals:calendar:')
        .setColor('RANDOM')
        .setDescription(
          Object.keys(settingGoalsInfo).map(
            (x) => x + '. ' + settingGoalsInfo[x]
          )
        )
        .setFooter(
          'I know it seems tedious, but it is worth it! We have to be very clear about which direction we are heading in.'
        );
      const executingEmbed = new MessageEmbed()
        .setTitle('2) Executing the plan:goal:  ')
        .setColor('RANDOM')
        .setDescription(executingInfo);
      const accountabilityEmbed = new MessageEmbed()
        .setTitle('3) Accountability:busts_in_silhouette:   ')
        .setColor('RANDOM')
        .setDescription(accountabilityInfo);
      msg.channel.send(welcomeEmbed);
      msg.channel.send(goalsEmbed);
      msg.channel.send(executingEmbed);
      msg.channel.send(accountabilityEmbed);
      return;
    case prefix + 'add':
      let n = parseInt(args[1]);
      if (Number.isNaN(n)) return;
      if (!user) {
        await getUsers().insertOne({ id: msg.author.id, score: n });
        user = { id: msg.author.id, score: n };
      } else {
        user.score += n;
        await getUsers().updateOne(
          { id: user.id },
          { $set: { score: user.score } }
        );
      }
      msg.author.send(
        'Wow! GOOD FUCKING JOB!, Your score is now ' + user.score
      );
      return;
  }
});

// client.login('Nzk1MDA0MTMwNTI2NjI1ODEz.X_DDSw.9mKdasmIZr_6KnU_19PngAm5bWU');
client.login(process.env.token);
