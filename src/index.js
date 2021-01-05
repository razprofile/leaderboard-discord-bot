import Discord, { Message, MessageEmbed } from 'discord.js';
import { getUser, getUsers } from './database_handler.js';
const client = new Discord.Client();
const prefix = '!';
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(' ');
  let user = await getUser(msg.author.id);
  switch (args[0]) {
    case prefix + 'leaderboard':
      const maxUsers = 10;
      const users = await getUsers()
        .find()
        .sort({ score: -1 })
        .limit(maxUsers)
        .toArray();
      const embed = new MessageEmbed()
        .setTitle('🎯Discipline Challenge Leaderboard🎯')
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
        '!leaderboard': 'Display the discipline challenge leaderboard',
        '!success': 'Successful day',
        '!help': 'Display this commands meanu',
        '!successw':
          'Add 7 successful days (not recommended to use for 95% of people)',
        '!remove': 'Remove yourself from the discipline challenge',
        '!decrease': 'decrease your days count by 1',
        '!reset': 'reset your days count to 0',
      };
      const helpEmbed = new MessageEmbed()
        .setTitle('Leaderboard Commands')
        .setColor('RANDOM')
        .setDescription(Object.entries(commands).map((x) => x));
      console.log(Object.entries(commands).map((x) => x)); //Got stuck
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
    case prefix + 'successw':
      if (!user) {
        await getUsers().insertOne({ id: msg.author.id, score: 1 });
        user = { id: msg.author.id, score: 7 };
      } else {
        await getUsers().updateOne(
          { id: user.id },
          { $set: { score: user.score + 7 } }
        );
      }
      msg.author.send(
        'Wow! GOOD FUCKING JOB!, Your score is now ' + (user.score + 7)
      );
      return;
  }
});

// client.login('Nzk1MDA0MTMwNTI2NjI1ODEz.X_DDSw.9mKdasmIZr_6KnU_19PngAm5bWU');
client.login(process.env.token);
