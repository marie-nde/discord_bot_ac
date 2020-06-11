const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { prefix, token } = require('./config.js');
const Data = require('./models/id');
const Dodo = require ('./models/dodo');
const Wlist = require ('./models/wlist');

const client = new Discord.Client();
client.commands = new Discord.Collection();

mongoose.connect('mongodb://database', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex:true,
    useUnifiedTopology: true }, (err) => {
        if (err) return console.error(err);
        console.log('Mongoose est prêt');
    });
mongoose.Promise = global.Promise;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

client.login(token);
client.on("ready", () => {
    console.log("Le bot est connecté");
    answered = true;
    userAnswer = "";
    userCard = "";
    answer = "";
});
client.on('message', async message => {

    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    var color = '#ecd89a';
    if (message.member.roles.cache.has("710067193282297858")) { var color = '#f19d5a'; } // orange
    else if (message.member.roles.cache.has("710067087183183913")) { var color = '#c289e7'; } // violet
    else if (message.member.roles.cache.has("710067008011632641")) { var color = '#f894d0'; } // rose
    else if (message.member.roles.cache.has("710067235250634873")) { var color = '#78b1e4'; } // bleu
    else if (message.member.roles.cache.has("710067124886044735")) { var color = '#4db886'; } // vert

    function getUserFromMention(mention) {
        if (!mention) return;
    
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
    
            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }
            return (mention);
        }
    }

    if (message.content.startsWith(prefix) && commandName === 'create') {
        const object = args[0];

        if (object === 'passeport' || object === 'id') {
            if (args.length == 5) {
                var doc = Data.bio;
                const del = await Data.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                if (del) var doc = del.bio;
                const newData = new Data({
                    _id: mongoose.Types.ObjectId(),
					userID: message.author.id,
					serverID: message.guild.id,
					pseudo: args[1],
					ile: args[2],
					fruit: args[3],
                    code: args[4],
                    bio: doc
                });
                await newData.save().catch(err => {
                    console.log(err);
                    return message.reply('les données n\'ont pas pu être mises à jour.');
                }),
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}passeport\` pour voir ton passeport.`);
            }
            else if (args.length != 5) {
                message.reply(`la commande \`${prefix}create ${object}\` doit être utilisée ainsi :\n\`${prefix}create ${object} <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``);
            }
        }

        else if (object === 'dodocode' || object === 'dcode') {
            const why = message.content.slice(prefix.length).split('\"', 2);

            if (!why[1]) return message.reply(`la commande \`${prefix}create ${object}\` doit être utilisée ainsi :\n\`${prefix}create ${object} <DodoCode> <\"Raison\">\``);
            if (args.length > 2) {
                const del = await Dodo.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                const newDodo = new Dodo({
                    _id: mongoose.Types.ObjectId(),
					userID: message.author.id,
                    serverID: message.guild.id,
                    dodocode: args[1],
                    raison: why[1]
                });
                await newDodo.save().catch(err => {
                    console.log(err);
                    return message.reply('les données n\'ont pas pu être mises à jour.');
                }),
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}dodocode\` pour voir ton dodocode.\n\`${prefix}reset dodocode\` pour supprimer ton dodocode.`);
                
                const taggedUser = message.author;

                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Dodocode de ${taggedUser.username}`)
                    .setDescription(`${newDodo.dodocode}`)
                    .setThumbnail("https://image.noelshack.com/fichiers/2020/23/7/1591545252-dodoairlineslogo.png")
                    .addField('Raison', `${newDodo.raison}`)
                    .setFooter('Bot par Marie#1702');
    
                return message.channel.send(newEmbed);
            }
            else if (args.length < 3) {
                return message.reply(`la commande \`${prefix}create ${object}\` doit être utilisée ainsi :\n\`${prefix}create ${object} <DodoCode> <\"Raison\">\``); 
            }
        }

        else if (object === 'waitinglist' || object === 'wlist') {
            if (args.length === 1 || args.length > 11) return message.reply(`la commande \`${prefix}create ${object}\` prend un à dix arguments.\nExemple : \`${prefix}create ${object} <@Membre> <@Membre> <@Membre>\``)
            if (args.length > 1) {
                for (i = 1; i < args.length; i++) {
                    if (!getUserFromMention(args[i])) break;
                    var number = i;
                }
                const del = await Wlist.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                const newWlist = new Wlist({
                    _id: mongoose.Types.ObjectId(),
					userID: message.author.id,
                    serverID: message.guild.id,
                    user1: getUserFromMention(args[1]),
                    user2: getUserFromMention(args[2]),
                    user3: getUserFromMention(args[3]),
                    user4: getUserFromMention(args[4]),
                    user5: getUserFromMention(args[5]),
                    user6: getUserFromMention(args[6]),
                    user7: getUserFromMention(args[7]),
                    user8: getUserFromMention(args[8]),
                    user9: getUserFromMention(args[9]),
                    user10: getUserFromMention(args[10]),
                    num: number
                });
                if (!newWlist.user1) return message.reply(`un ou plusieurs arguments sont erronés.\n\`${prefix}create ${object} <@Membre> <@Membre> <@Membre>\` pour créer une liste d'attente.`);
                await newWlist.save().catch(err => {
                    console.log(err);
                    return message.reply('les données n\'ont pas pu être mises à jour.');
                }),
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}${object}\` pour voir ta liste d'attente.\n\`${prefix}reset ${object}\` pour supprimer ta liste d'attente.\n\`${prefix}next\` pour passer à la personne suivante.`);
        
                const newDodo = await Dodo.findOne({
                    userID: message.author.id,
                    serverID: message.guild.id
                });

                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Liste d'attente de ${message.author.username}`)
                // if (newDodo.dodocode) newEmbed.setDescription(`${newDodo.dodocode}`) (A remettre qd y aura le reset de dodocode)
                for (i = 1; i < args.length; i++) {
                    const user = client.users.cache.get(getUserFromMention(args[i]));
                    if (!user) break;
                    newEmbed.addField(`ac!next`, `**${i}.** ${user.username}`)
                }
                newEmbed.setFooter('Bot par Marie#1702');
    
                message.channel.send(newEmbed);
                return message.channel.send(`${args[1]}, à ton tour !`);
            }
    }
        else {
            message.reply(`la commande \`${prefix}create\` sert à créer un passeport, un dodocode ou une liste d'attente.\n\`${prefix}help create\` pour plus d'infos.`);
        }
    }

    else if (message.content.startsWith(prefix) && commandName === 'bio') {
        const list = message.content.slice(prefix.length).split('\"', 2);
        const bio = list[1];

        if (!bio) return message.reply(`la commande \`${prefix}bio\` prend un argument entre guillemets.\nExemple : \`${prefix}bio \"Ceci est ma biographie\"\``);
        const doc = await Data.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        if (!doc) return message.reply(`pour enregistrer une bio, il faut d\'abord créer son passeport :\n\`${prefix}create passeport <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``)

        const update = await Data.findOneAndUpdate({
            userID: message.author.id,
            serverID: message.guild.id
        }, {
            $set: { bio: `${bio}`}
        });
        return message.reply(`ta bio a bien été mise à jour.\n\`${prefix}passeport\` pour voir ton passeport.`);
    }

    else if (message.content.startsWith(prefix) && commandName === 'reset') {
        const object = args[0];

        if (object === 'passeport' || object === 'id') {
            const del = await Data.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            return message.reply('ton passeport a bien été effacé.');
        }
        else if (object === 'bio') {
            const update = await Data.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: { bio: 'Pas de bio, pour la modifier : \`ac!bio \"Exemple\"\`'}
            });
            return message.reply('ta bio a bien été effacée.');
        }
        else if (object === 'dodocode' || object === 'dcode') {
            const del = await Dodo.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucun dodocode n\'a été trouvé.');
            return message.reply('ton dodocode a bien été effacé.');
        }
        else if (object === 'waitinglist' || object === 'wlist') {
            const del = await Wlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucune liste d\'attente n\'a été trouvée.');
            return message.reply('ta liste d\'attente a bien été effacée.');
        }
    }

    else if (message.content.startsWith(prefix) && (commandName === 'passeport' || commandName === 'id')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher son propre passeport : \`${prefix}${commandName}\`\nPour afficher le passeport de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher le passeport d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
        const newData = await Data.findOne({
            userID: taggedUser.id,
			serverID: message.guild.id
        });
        if (!newData) return message.reply(`aucune donnée n\'a été trouvée. Pour créer un passeport :\n\`${prefix}create ${commandName} <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``);
        let newEmbed = new Discord.MessageEmbed()
			.setColor(`${color}`)
			.setTitle(`Passeport de ${taggedUser.username}`)
			.setThumbnail(taggedUser.displayAvatarURL({ format: "png", dynamic: true }))
			.addFields(
				{ name: 'Pseudo', value: `${newData.pseudo}`, inline: true },
				{ name: 'Nom de l\'île', value: `${newData.ile}`, inline: true },
				{ name: 'Fruit de base', value: `${newData.fruit}` },
				{ name: 'Code ami', value: `${newData.code}`, inline: true },
            )
            .addField('Petite bio', `${newData.bio}`, false)
			.setFooter('Bot par Marie#1702');
		return message.channel.send(newEmbed);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'dodocode' || commandName === 'dcode')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher son propre dodocode : \`${prefix}${commandName}\`\nPour afficher le dodocode de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\`\nPour afficher tous les dodocodes actifs : \`${prefix}${commandName} all\``);
        if (args[0] != 'all') {
            const taggedUser = message.mentions.users.first() || message.author;

            if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher le dodocode d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
			    serverID: message.guild.id
            });
            if (!newDodo && taggedUser === message.author) return message.reply(`aucun dodocode actif n\'a été trouvé. Pour créer un dodocode :\n\`${prefix}create ${commandName} <DodoCode> <\"Raison\">\``);
            if (!newDodo && taggedUser != message.author) return message.reply(`aucun dodocode actif n\'a été trouvé pour cette personne.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Dodocode de ${taggedUser.username}`)
                .setThumbnail("https://image.noelshack.com/fichiers/2020/23/7/1591545252-dodoairlineslogo.png")
                .setDescription(`${newDodo.dodocode}`)
                .addField('Raison', `${newDodo.raison}`)
                .setFooter('Bot par Marie#1702');

            return message.channel.send(newEmbed);
        }
        else if (args[0] === 'all') {
            const res = await Dodo.find({
                serverID: message.guild.id
            }).sort();

            if (!res[0] || res.length === 0) return message.channel.send('Aucun dodocode n\'est actif en ce moment !');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle('Dodocodes actifs')
            for (i = 0; i < res.length; i++) {
                let user = client.users.cache.get(res[i].userID);

                newEmbed.addField(`${i + 1}. Chez ${user.username}`, `**Dodocode** : ${res[i].dodocode}\n**Raison** : ${res[i].raison}`)
            }
            newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
        }
    }

    else if (message.content.startsWith(prefix) && (commandName === 'codeami' || commandName === 'code')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher son propre code ami : \`${prefix}${commandName}\`\nPour afficher le code ami de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\` ou \`${prefix}${commandName} <Page>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args[0] != 'all' && isNaN(parseInt(args[0]))) {
            if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher le code ami d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
            const newData = await Data.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newData) return message.reply(`l'utilisateur mentionné n'a pas encore ajouté son code ami.`);

            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Code ami de ${taggedUser.username}`)
                .setDescription(`${newData.code}`)
                .setThumbnail(taggedUser.displayAvatarURL({ format: "png", dynamic: true }))
                .setFooter(`Bot par Marie#1702`);

            return message.channel.send(newEmbed);
        }
        else {
            const res = await Data.find({
                serverID: message.guild.id
            }).sort();

            if (!res[0] || res.length === 0) return message.channel.send('Aucun code ami n\'a été ajouté.');
            var page = parseInt(args[0], 10);
            if (isNaN(page)) var page = 1;
            var totalPages = Math.trunc(res.length / 10) + 1;
            if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
            if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
            var index = (page * 10) - 10;

            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle('Codes ami')
            for (i = 0; i < 10; i++) {
                if (index < res.length) {
                    let user = client.users.cache.get(res[index].userID);
                    newEmbed.addField(`${index + 1}. ${user.username}`, `${res[index].code}`)
                    index++;
                }
            }
            newEmbed.setFooter(`Page ${page}/${totalPages}`);
            return message.channel.send(newEmbed);
        }
    }

    else if (message.content.startsWith(prefix) && (commandName === 'waitinglist' || commandName === 'wlist')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher sa propre liste d'attente : \`${prefix}${commandName}\`\nPour afficher la liste d'attente de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher la liste d'attente d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
        const newWlist = await Wlist.findOne({
            userID: taggedUser.id,
			serverID: message.guild.id
        });
        if (!newWlist) return message.reply(`aucune donnée n\'a été trouvée. Pour créer une liste d'attente :\n\`${prefix}create ${commandName} <@Membre> <@Membre> <@Membre>\``);
        
        let newEmbed = new Discord.MessageEmbed()
        .setColor(`${color}`)
        .setTitle(`Liste d'attente de ${taggedUser.username}`)
    // if (newDodo.dodocode) newEmbed.setDescription(`${newDodo.dodocode}`) (A remettre qd y aura le reset de dodocode)
    if (num != 0) {
        var user = client.users.cache.get(newWlist.user1);
        if (newWlist.user1 && newWlist.user1 != 'undefined') newEmbed.addField(`ac!next`, `**1.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user2);
        if (newWlist.user2 && newWlist.user2 != 'undefined') newEmbed.addField(`ac!next`, `**2.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user3);
        if (newWlist.user3 && newWlist.user3 != 'undefined') newEmbed.addField(`ac!next`, `**3.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user4);
        if (newWlist.user4 && newWlist.user4 != 'undefined') newEmbed.addField(`ac!next`, `**4.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user5);
        if (newWlist.user5 && newWlist.user5 != 'undefined') newEmbed.addField(`ac!next`, `**5.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user6);
        if (newWlist.user6 && newWlist.user6 != 'undefined') newEmbed.addField(`ac!next`, `**6.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user7);
        if (newWlist.user7 && newWlist.user7 != 'undefined') newEmbed.addField(`ac!next`, `**7.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user8);
        if (newWlist.user8 && newWlist.user8 != 'undefined') newEmbed.addField(`ac!next`, `**8.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user9);
        if (newWlist.user9 && newWlist.user9 != 'undefined') newEmbed.addField(`ac!next`, `**9.** ${user.username}`)
        var user = client.users.cache.get(newWlist.user10);
        if (newWlist.user10 && newWlist.user10 != 'undefined') newEmbed.addField(`ac!next`, `**10.** ${user.username}`)
    }
    newEmbed.setFooter('Bot par Marie#1702');

    return message.channel.send(newEmbed);
}

    else if (message.content.startsWith(prefix) && (commandName === 'next')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour passer à la personne suivente dans sa propre liste d'attente : \`${prefix}${commandName}\`\nPour passer à la personne suivante dans la liste d'attente de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Vérifiez que vous avez bien mentionné la personne.`);
        const check = await Wlist.findOne({
            userID: taggedUser.id,
			serverID: message.guild.id
        });
        if (!check) return message.reply(`aucune donnée n\'a été trouvée. Pour créer une liste d'attente :\n\`${prefix}create ${commandName} <@Membre> <@Membre> <@Membre>\``);

        const del = await Wlist.findOneAndDelete({
            userID: taggedUser.id,
            serverID: message.guild.id
        });
        const newWlist = new Wlist({
            _id: mongoose.Types.ObjectId(),
            userID: taggedUser.id,
            serverID: message.guild.id,
            user1: del.user2,
            user2: del.user3,
            user3: del.user4,
            user4: del.user5,
            user5: del.user6,
            user6: del.user7,
            user7: del.user8,
            user8: del.user9,
            user9: del.user10,
            num: del.num - 1
        });
        await newWlist.save().catch(err => {
            console.log(err);
            return message.reply('les données n\'ont pas pu être mises à jour.');
        }),
        message.channel.send ('La liste d\'attente a bien été mise à jour.')

        if (newWlist.num === 1) {
            const del = await Wlist.findOneAndDelete({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            const user = client.users.cache.get(del.user1);
            return message.channel.send (`${user} est la dernière à venir ! La liste d'attente a été effacée.`);
        }

        let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Liste d'attente de ${taggedUser.username}`)
        // if (newDodo.dodocode) newEmbed.setDescription(`${newDodo.dodocode}`) (A remettre qd y aura le reset de dodocode)
        if (num != 0) {
            var user = client.users.cache.get(newWlist.user1);
            if (newWlist.user1 && newWlist.user1 != 'undefined') newEmbed.addField(`ac!next`, `**1.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user2);
            if (newWlist.user2 && newWlist.user2 != 'undefined') newEmbed.addField(`ac!next`, `**2.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user3);
            if (newWlist.user3 && newWlist.user3 != 'undefined') newEmbed.addField(`ac!next`, `**3.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user4);
            if (newWlist.user4 && newWlist.user4 != 'undefined') newEmbed.addField(`ac!next`, `**4.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user5);
            if (newWlist.user5 && newWlist.user5 != 'undefined') newEmbed.addField(`ac!next`, `**5.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user6);
            if (newWlist.user6 && newWlist.user6 != 'undefined') newEmbed.addField(`ac!next`, `**6.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user7);
            if (newWlist.user7 && newWlist.user7 != 'undefined') newEmbed.addField(`ac!next`, `**7.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user8);
            if (newWlist.user8 && newWlist.user8 != 'undefined') newEmbed.addField(`ac!next`, `**8.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user9);
            if (newWlist.user9 && newWlist.user9 != 'undefined') newEmbed.addField(`ac!next`, `**9.** ${user.username}`)
            var user = client.users.cache.get(newWlist.user10);
            if (newWlist.user10 && newWlist.user10 != 'undefined') newEmbed.addField(`ac!next`, `**10.** ${user.username}`)
        }
        newEmbed.setFooter('Bot par Marie#1702');

        message.channel.send(newEmbed);

        var user = client.users.cache.get(newWlist.user1);
        return message.channel.send(`${user}, à ton tour !`);
    }

    if (answered === false && message.author.id === userCard) {
        number = 4;
        var random = Math.floor(Math.random() * (number - 1 + 1)) + 1;
        switch (random) {
            case 1: answer = "coeur"; break;
            case 2: answer = "trèfle"; break;
            case 3: answer = "pique"; break;
            case 4: answer = "carreau"; break;
        }
        if (message.content.startsWith("coeur")) var num = 1;
        else if (message.content.startsWith("trèfle")) var num = 2;
        else if (message.content.startsWith("pique")) var num = 3;
        else if (message.content.startsWith("carreau")) var num = 4;

        if (num === random) {
            message.reply('bonne réponse ! On dirait bien que je vais emménager bientôt !');
        }
        else {
            message.reply(`et non, pas cette fois ! J\'ai tiré la carte ${answer} !`);
        }
        answered = true; userCard = ""; answer = "";
        return;
    }

    if (message.content.startsWith(prefix) && commandName === 'card') {
        message.reply('devine quelle carte je tiens dans ma main !\nRéponses possibles : \`carreau\`, \`coeur\`, \`pique\` ou \`trèfle\` !');
        answered = false;
        userCard = message.author.id;
        return;
    }

    if (message.content.startsWith(prefix) && commandName === 'tg') {
        if (message.author.id === "240924015336751104") {
            message.channel.bulkDelete(1, true)
            return message.channel.send(`tg nn ?`);
        }
        else {
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === 'angry_poticha');
            return message.react(emoji);

        }
    }

    if (!message.content.startsWith(prefix)) return;
    if (!commandName) return;
});