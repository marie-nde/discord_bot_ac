const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { prefix, token } = require('./config.js');
const Data = require('./models/id');
const Dodo = require ('./models/dodo');
const Wlist = require ('./models/wlist');
const Wishlist = require('./models/wishlist');
const Craft = require('./models/craft');
const Users = require ('./models/usersList');

const client = new Discord.Client();
client.commands = new Discord.Collection();

mongoose.connect('mongodb://localhost:27017/data', {
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
    var obj = null;
    if (args.length > 0) var obj = args.shift().toLowerCase();

    var color = '#ecd89a';
    if (message.member.roles.cache.has("710067193282297858")) { var color = '#f19d5a'; } // orange
    else if (message.member.roles.cache.has("710067087183183913")) { var color = '#c289e7'; } // violet
    else if (message.member.roles.cache.has("710067008011632641")) { var color = '#f894d0'; } // rose
    else if (message.member.roles.cache.has("710067235250634873")) { var color = '#78b1e4'; } // bleu
    else if (message.member.roles.cache.has("710067124886044735")) { var color = '#4db886'; } // vert

    var checkUser = await Users.findOne({
        userID: message.author.id,
        serverID: message.guild.id,
        username: message.member.displayName.toLowerCase()
    });
    if (!checkUser) {
        const del = await Users.findOneAndDelete({
            userID: message.author.id,
            serverID: message.guild.id
        });
        var checkUser = new Users({
            _id: mongoose.Types.ObjectId(),
            userID: message.author.id,
            serverID: message.guild.id,
            username: message.member.displayName.toLowerCase(),
        })
        await checkUser.save();
    }

    const usersList = await Users.find({
        serverID: message.guild.id
    });

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
        if (answer === "pique") var emoji = '♠️';
        else if (answer === "trèfle") var emoji = '♣️';
        else if (answer === "coeur") var emoji = '❤️';
        else if (answer === "carreau") var emoji = '♦️';
        if (num === random) {
            message.react(emoji);
            message.reply('bonne réponse ! On dirait bien que je vais emménager bientôt !');
        }
        else {
            message.reply(`et non, pas cette fois ! J\'ai tiré la carte ${answer} ${emoji} !`);
        }
        answered = true; userCard = ""; answer = "";
        return;
    }
    
    if (!message.content.startsWith(prefix)) return;
    if (!commandName) return;
    
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

    if (commandName === 'card') {
        message.reply('devine quelle carte je tiens dans ma main !\nRéponses possibles : \`carreau\`, \`coeur\`, \`pique\` ou \`trèfle\` !');
        answered = false;
        userCard = message.author.id;
        return;
    }

    else if (commandName === 'tg') {
        if (message.author.id === "240924015336751104") {
            message.channel.bulkDelete(1, true)
            return message.channel.send(`tg nn ?`);
        }
        else {
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === 'angry_poticha');
            return message.react(emoji);

        }
    }

    else if (commandName === 'passeport' || commandName === 'id' || commandName === 'passport') {
        if (obj === 'create') {
            if (args.length === 4) {
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
					pseudo: args[0],
					ile: args[1],
					fruit: args[2],
                    code: args[3],
                    bio: doc
                });
                await newData.save().catch(err => {
                    console.log(err);
                    return message.reply('les données n\'ont pas pu être mises à jour.');
                }),
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ton passeport.\n\`${prefix}bio "Texte"\` pour ajouter une biographie à ton passeport.`);
            }

            else if (args.length != 4) {
                message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend quatre arguments :\n\`${prefix}${commandName} ${obj} <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``);
            }
        }

        else if (obj === 'reset') {
            const del = await Data.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucun passeport n\'a été trouvé.');
            return message.reply('ton passeport a bien été effacé.');
        }
        
        else {
            if (args.length > 0) return message.reply(`la commande ${prefix}${commandName} prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher son propre passeport.\n\`${prefix}${commandName} <@Membre>\` pour afficher le passeport d'un.e autre membre.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                for (i = 0; i < usersList.length; i++) {
                    var taggedUser = 'undefined';
                    if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                }
            }
            if (obj && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher le passeport d'un.e autre membre.`);
            const newData = await Data.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newData && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            if (!newData) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\` pour créer un passeport.`);
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
    }

    else if (commandName === 'bio') {
        if (obj === 'create') {
            const list = message.content.slice(prefix.length).split('\"', 2);
            const bio = list[1];
            if (!bio) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend un argument entre guillemets :\n\`${prefix}${commandName} ${obj} \"Ceci est ma biographie\"\``);
            const doc = await Data.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (!doc) return message.reply(`pour ajouter une bio, il faut d\'abord créer un passeport :\n\`${prefix}passeport create <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``)
            const update = await Data.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: { bio: `${bio}`}
            });
            return message.reply(`les données ont bien été mises à jour.\n\`${prefix}passeport\` pour voir ton passeport.`);
        }

        else if (obj === 'reset') {
            const update = await Data.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: { bio: 'Pas de bio, pour la modifier : \`ac!bio create \"Exemple\"\`'}
            });
            return message.reply('ta bio a bien été effacée.');
        }

        else if (!obj) {
            return message.reply(`la commande ${prefix}${commandName} prend au moins un argument.\n\`${prefix}${commandName} create "Ceci est une biographie"\` pour ajouter une biographie au passeport.\n\`${prefix}${commandName} reset\` pour supprimer sa biographie du passeport.`);
        }

        else {
            return message.reply(`la commande ${prefix}${commandName} sert à créer ou supprimer une biographie.\n\`${prefix}${commandName} create "Ceci est une biographie"\` pour ajouter une biographie au passeport.\n\`${prefix}${commandName} reset\` pour supprimer sa biographie du passeport.`);
        }
    }

    else if (commandName === 'codeami' || commandName === 'code') {
        if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher son propre code ami.\n\`${prefix}${commandName} <@Membre>\` ou \`${prefix}${commandName} <Page>\` pour afficher le code ami d'un.e autre membre.`);
        if (!obj || isNaN(parseInt(obj))) {
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                for (i = 0; i < usersList.length; i++) {
                    var taggedUser = 'undefined';
                    if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                }
            }
        if (obj && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher le code ami d'un.e autre membre.\n\`${prefix}${commandName} <Page>\` pour afficher une page des codes ami.`);
            if (obj && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher le code ami d'un.e autre membre.\n\`${prefix}${commandName} <Page>\` pour afficher une page des codes ami.`);
            const newData = await Data.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newData) return message.channel.send(`Aucun code ami n'a été trouvé pour ${taggedUser.username}.`);
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
            if (res.length === 0) return message.channel.send('Aucun code ami n\'a été ajouté.');
            var page = parseInt(obj, 10);
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

    else if (commandName === 'dodocode' || commandName === 'dcode') {
        if (obj === 'create') {
            if (args.length < 2) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend deux arguments :\n\`${prefix}${commandName} ${obj} <DodoCode> "Raison"\``); 
            const why = message.content.slice(prefix.length).split('\"', 2);
            if (why[1] === " ") return message.reply(`le second argument doit contenir au moins un caractère visible.`);
            if (!why[1]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend deux arguments :\n\`${prefix}${commandName} ${obj} <DodoCode> "Raison"\``);
            const del = await Dodo.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
            const newDodo = new Dodo({
                _id: mongoose.Types.ObjectId(),
				userID: message.author.id,
                serverID: message.guild.id,
                dodocode: args[0],
                raison: why[1],
            });
            await newDodo.save().catch(err => {
                console.log(err);
                return message.reply('les données n\'ont pas pu être mises à jour.');
            }),
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ton dodocode.\n\`${prefix}${commandName} reset\` pour supprimer ton dodocode.`);
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

        else if (obj === 'reset') {
            const del = await Dodo.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucun dodocode n\'a été trouvé.');
            return message.reply('ton dodocode a bien été effacé.');
        }

        else if (obj === 'all') {
            const res = await Dodo.find({
                serverID: message.guild.id
            }).sort();
            if (res.length === 0) return message.channel.send('Aucun dodocode n\'est actif en ce moment !');
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

        else {
            if (args.length > 0) return message.reply(`la commande ${prefix}${commandName} prend entre zéro et un argument.\n\`${prefix}${commandName}\` pour afficher son propre dodocode.\n\`${prefix}${commandName} <@Membre>\` pour afficher le dodocode d'un autre membre.\n\`${prefix}${commandName} all\` pour afficher tous les dodocodes actifs.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                for (i = 0; i < usersList.length; i++) {
                    var taggedUser = 'undefined';
                    if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                }
            }
            if (obj && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher le dodocode d'un.e autre membre.`);
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
			    serverID: message.guild.id
            });
            if (!newDodo && taggedUser === message.author) return message.reply(`aucun dodocode actif n\'a été trouvé.\n\`${prefix}${commandName} create <DodoCode> <"Raison">\` pour créer un dodocode.`);
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
    }

    else if (commandName === 'waitinglist' || commandName === 'wlist') {
        if (obj === 'create') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument :\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\``)
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                    if (!getUserFromMention(args[i])) break;
                    number++;
                }
            if (number === 0) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\` pour créer une liste d'attente.`);
            const del = await Wlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
            const newWlist = new Wlist({
                _id: mongoose.Types.ObjectId(),
				userID: message.author.id,
                serverID: message.guild.id,
                number: number
            });
            await newWlist.save().catch(err => {
                console.log(err);
                return message.reply('les données n\'ont pas pu être mises à jour.');
            }),
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta liste d'attente.\n\`${prefix}${commandName} reset\` pour supprimer ta liste d'attente.\n\`${prefix}${commandName} next\` pour passer à la personne suivante.\n\`${prefix}${commandName} add <@Membre> <@Membre>\` pour ajouter des membres à ta liste d'attente.\n\`${prefix}${commandName} delete <@Membre> <@Membre>\` pour supprimer des membres de ta liste d'attente.`);
            for (i = 0; i < number; i++) {
                const user = client.users.cache.get(getUserFromMention(args[i]));
                if (!user) break;
                const update = await Wlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                }, {
                    $push: { users: getUserFromMention(args[i]) }
                });
            }
            const newDodo = await Dodo.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`)
            for (i = 0; i < args.length; i++) {
                const user = client.users.cache.get(getUserFromMention(args[i]));
                if (!user) break;
                newEmbed.addField(`ac!${commandName} next`, `**${i + 1}.** ${user.username}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            return message.channel.send(`${args[0]}, à ton tour !`);
        }

        else if (obj === 'reset') {
            const del = await Wlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucune liste d\'attente n\'a été trouvée.');
            return message.reply('ta liste d\'attente a bien été effacée.');
        }

        else if (obj === 'next') {
            if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend 0 ou 1 argument.\n\`${prefix}${commandName} ${obj}\` pour passer à la personne suivante dans sa propre liste d'attente.\n\`${prefix}${commandName} ${obj} <@Membre>\` pour passer à la personne suivante dans la liste d'attente d'un.e autre membre.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (args[0] && taggedUser === message.author) {
                for (i = 0; i < usersList.length; i++) {
                    var taggedUser = 'undefined';
                    if (usersList[i].username.includes(`${args[0].toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                }
            }
            if (args[0] && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher la liste d'attente d'un.e autre membre.`);
            const newWlist = await Wlist.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newWlist && taggedUser === message.author) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <@Membre> <@Membre>\` pour créer une liste d'attente.`);
            if (!newWlist && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const modif = await Wlist.findOneAndUpdate({
                userID: taggedUser.id,
                serverID: message.guild.id
            }, {
                $pop: { users: -1 },
                $set: { number: newWlist.number - 1 }
            });
            message.channel.send('Les données ont bien été mises à jour.')
            const newOne = await Wlist.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (newOne.number === 1) {
                const del = await Wlist.findOneAndDelete({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                });
                const user = client.users.cache.get(del.users[0]);
                return message.channel.send (`${user} est la dernière à venir chez ${taggedUser.username} ! La liste d'attente a été effacée.`);
            }
            if (newOne.number < 1) {
                const del = await Wlist.findOneAndDelete({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                });
                return message.channel.send('Il n\'y a plus personne sur la liste d\'attente. La liste a été effacée.')
            }
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            const list = newOne.users;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${taggedUser.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            for (i = 0; i < newOne.number; i++) {
                var user = client.users.cache.get(list[i]);
                if (!user) break;
                newEmbed.addField(`ac!${commandName} next`, `**${i + 1}.** ${user.username}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var user = client.users.cache.get(newOne.users[0]);
            return message.channel.send(`${user}, à ton tour !`);
        }

        else if (obj === 'add') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\` pour ajouter des membres à sa liste d'attente.`);
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                if (!getUserFromMention(args[i])) break;
                number++;
            }
            if (number === 0) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\` pour ajouter des membres à sa liste d'attente.`);
            const newWlist = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <@Membre> <@Membre>\` pour créer une liste d'attente.`);
            const check = newWlist.users;
            var i = 0;
            var j = 0;
            while (i < args.length) {
                j = 0;
                while (j < check.length) {
                    if (getUserFromMention(args[i]) === check[j]) return message.reply(`impossible d'ajouter des membres qui sont déjà dans la liste d'attente.`);
                    else j++;
                }
                i++;
            }
            for (i = 0; i < number; i++) {
                const update = await Wlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { users: getUserFromMention(args[i]) },
                        $set: { number: newWlist.number + number }
                    })
            }
            message.channel.send(`Les données ont bien été mises à jour.`);
            const newOne = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const newDodo = await Dodo.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const list = newOne.users;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            for (i = 0; i < newOne.number; i++) {
                var user = client.users.cache.get(list[i]);
                if (!user) break;
                newEmbed.addField(`ac!${commandName} next`, `**${i + 1}.** ${user.username}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\` pour supprimer des membres de sa liste d'attente.`);
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                if (!getUserFromMention(args[i])) break;
                number++;
            }
            if (number === 0) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <@Membre> <@Membre>\` pour supprimer des membres de sa liste d'attente.`);
            const newWlist = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <@Membre> <@Membre>\` pour créer une liste d'attente.`);
            var i = 0;
            var j = 0;
            var temp = 0;
            while (i < args.length) {
                j = 0;
                temp = 0;
                while (j < newWlist.users.length) {
                    if (getUserFromMention(args[i]) === newWlist.users[j]) temp++;
                    j++;
                }
                if (temp === 0) return message.reply(`impossible de retirer des membres qui ne sont pas dans la liste d'attente.`);
                i++;
            }
            for (i = 0; i < number; i++) {
                const update = await Wlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $pull: { users: getUserFromMention(args[i]) },
                        $set: { number: newWlist.number - number }
                    })
            }
            message.channel.send(`Les données ont bien été mises à jour.`);
            const newOne = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const newDodo = await Dodo.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (newOne.number === 1) {
                const del = await Wlist.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                var user = client.users.cache.get(newOne.users[0]);
                return message.channel.send(`${user} est la dernière à venir chez ${message.author.username} ! La liste d'attente a été effacée.`);
            }
            if (newOne.number < 1) {
                const del = await Wlist.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                return message.channel.send(`La dernière personne a été retirée de la liste. La liste d'attente a été effacée.`);
            }
            const list = newOne.users;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            for (i = 0; i < newOne.number; i++) {
                var user = client.users.cache.get(list[i]);
                if (!user) break;
                newEmbed.addField(`ac!${commandName} next`, `**${i + 1}.** ${user.username}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var user = client.users.cache.get(list[0]);
            return message.channel.send(`${user}, à ton tour !`);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher sa propre liste d'attente.\n\`${prefix}${commandName} <@Membre>\` pour afficher la liste d'attente d'un.e autre membre.`);
            const taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher la liste d'attente d'un.e autre membre.`);
            const newWlist = await Wlist.findOne({
                userID: taggedUser.id,
			    serverID: message.guild.id
            });
            if (!newWlist && taggedUser === message.author) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <@Membre> <@Membre> <@Membre>\` pour créer une liste d'attente.`);
            if (!newWlist && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            const list = newWlist.users;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${taggedUser.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            for (i = 0; i < newWlist.number; i++) {
                var user = client.users.cache.get(list[i]);
                if (!user) break;
                newEmbed.addField(`ac!${commandName} next`, `**${i + 1}.** ${user.username}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'wishlist') {
        if (obj === 'create') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument. S'il y en a plusieurs, ils doivent être séparés par une virgule :\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\``)
            const check = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (check) return message.reply(`une wishlist existe déjà.\n\`${prefix}${commandName} reset\` pour effacer ta wishlist.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des objets.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des objets.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            var j = 0;
            var i = 1;
            while (j < wish.length - 1) {
                i = j + 1;
                while (i < wish.length) {
                    if (wish[j] === wish[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            const newWishlist = new Wishlist({
                _id: mongoose.Types.ObjectId(),
                userID: message.author.id,
                serverID: message.guild.id,
                number: wish.length
            });
            await newWishlist.save().catch(err => {
                console.log(err);
                return message.reply('les données n\'ont pas pu être mises à jour.');
            }),
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta wishlist.\n\`${prefix}${commandName} reset\` pour supprimer ta wishlist.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des objets.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des objets.`)
            for (i = 0; i < wish.length; i++) {
                const update = await Wishlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                }, {
                    $push: { list: wish[i] },
                    $set: { number: wish.length }
                });
            }
            const Wish = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const list = Wish.list;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Wishlist de ${message.author.username}`)
            for (i = 0; i < Wish.number; i++) {
                newEmbed.addField(`\u200b`, `**${i + 1}.** ${list[i]}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'reset') {
            const del = await Wishlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply(`aucune wishlist n\'a été trouvée.`);
            return message.reply(`ta wishlist a bien été effacée.`);
        }

        else if (obj === 'add') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\` pour ajouter des objets à sa wishlist.`);
            const newWishlist = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (!newWishlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une wishlist.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            var j = 0;
            var i = 1;
            while (j < wish.length - 1) {
                i = j + 1;
                while (i < wish.length) {
                    if (wish[j] === wish[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            const check = newWishlist.list;
            var i = 0;
            var j = 0;
            while (i < wish.length) {
                j = 0;
                while (j < check.length) {
                    if (wish[i] === check[j]) return message.reply(`impossible d'ajouter des objets qui sont déjà dans la wishlist.`);
                    else j++;
                }
                i++;
            }
            for (i = 0; i < wish.length; i++) {
                const update = await Wishlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { list: wish[i] },
                        $set: { number: newWishlist.number + wish.length }
                    })
            }
            const newOne = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            var i = 0;
            var res = new Array();
            while (i < wish.length) {
                res[i] = wish[i];
                i++;
            }
            res = res.join(", ");
            var object = 'objets';
            if (newOne.number === 1) var object = 'objet';
            return message.channel.send(`Les données ont bien été mises à jour.\nCes objets ont été ajoutés à la wishlist : \`${res}\`\nTa wishlist contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour voir ta wishlist.`);
        }

        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Numéro> <Numéro>\` pour supprimer des objets de sa wishlist.`);
            const newWishlist = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWishlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une wishlist.`);
            var j = 0;
            var i = 1;
            while (j < args.length) {
                i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            for (i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i], 10))) return message.reply(`tous les arguments doivent être des numéros correspondant à la place de l'objet dans la wishlist.`);
                if (parseInt(args[i], 10) > newWishlist.number) return message.reply(`impossible de supprimer des objets qui n'existent pas dans la wishlist.`);
            }
            if (args.length > newWishlist.number) return message.reply(`il y a plus d'arguments que d'objets dans la wishlist.`);
            var res = new Array();
            var i = 0;
            while (i < args.length) {
                res[i] = newWishlist.list[parseInt(args[i], 10) - 1];
                i++;
            }
            res = res.join(", ");
            for (i = 0; i < args.length; i++) {
                var num = parseInt(args[i], 10) - 1;
                var str = newWishlist.list[num];
                const update = await Wishlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $pull: { list: str },
                        $set: { number: newWishlist.number - args.length }
                    })
            }
            const newOne = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (newOne.number < 1) {
                const del = await Wishlist.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                message.channel.send(`Les données ont bien été mises à jour.`);
                return message.reply(`la wishlist est vide. Elle a donc été effacée.`);
            }
            var object = 'objets';
            if (newOne.number === 1) var object = 'objet';
            return message.channel.send(`Les données ont bien été mises à jour.\nCes objets ont été supprimés de la wishlist : \`${res}\`\nTa wishlist contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour voir ta wishlist.`);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher sa propre wishlist.\n\`${prefix}${commandName} <@Membre>\` pour afficher la wishlist d'un.e autre membre.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                for (i = 0; i < usersList.length; i++) {
                    var taggedUser = 'undefined';
                    if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                }
            }
            if (obj && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher la wishlist d'un.e autre membre.`);
            const newWishlist = await Wishlist.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newWishlist && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une wishlist.`);
            if (!newWishlist && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const items = newWishlist.list;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Wishlist de ${taggedUser.username}`)
            for (i = 0; i < newWishlist.number; i++) {
                newEmbed.addField(`\u200b`, `**${i + 1}.** ${items[i]}`);
            }
                newEmbed.setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'craft') {
        if (obj === 'create') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument. S'il y en a plusieurs, ils doivent être séparés par une virgule :\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\``);
            const check = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (check) return message.reply(`une liste de crafts existe déjà.\n\`${prefix}${commandName} reset\` pour effacer ta liste de crafts.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des crafts.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des crafts.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            while (j < wish.length - 1) {
                i = j + 1;
                while (i < wish.length) {
                    if (wish[j] === wish[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            const newCraft = new Craft({
                _id: mongoose.Types.ObjectId(),
                userID: message.author.id,
                serverID: message.guild.id,
                number: wish.length
            });
            await newCraft.save().catch(err => {
                console.log(err);
                return message.reply('les données n\'ont pas pu être mises à jour.');
            }),
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta liste de crafts.\n\`${prefix}${commandName} reset\` pour supprimer ta liste.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des crafts.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des crafts.`)
            for (i = 0; i < wish.length; i++) {
                const update = await Craft.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                }, {
                    $push: { list: wish[i] }
                });
            }
            const Craftlist = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const newData = await Data.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            const list = Craftlist.list;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste de crafts de ${message.author.username}`)
            if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
            for (i = 0; i < Craftlist.number; i++) {
                newEmbed.addField(`\u200b`, `**${i + 1}.** ${list[i]}`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }
        
        else if (obj === 'reset') {
            const del = await Craft.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply(`aucune liste de crafts n\'a été trouvée.`);
            return message.reply(`ta liste de crafts a bien été effacée.`);
        }

        else if (obj === 'add') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\` pour ajouter des objets à sa liste de crafts.`);
            const newCraft = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (!newCraft) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            var j = 0;
            var i = 1;
            while (j < wish.length - 1) {
                i = j + 1;
                while (i < wish.length) {
                    if (wish[j] === wish[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            const check = newCraft.list;
            var i = 0;
            var j = 0;
            while (i < wish.length) {
                j = 0;
                while (j < check.length) {
                    if (wish[i] === check[j]) return message.reply(`impossible d'ajouter des crafts qui sont déjà dans la liste.`);
                    else j++;
                }
                i++;
            }
            for (i = 0; i < wish.length; i++) {
                const update = await Craft.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { list: wish[i] },
                        $set: { number: newCraft.number + wish.length }
                    })
            }
            const newOne = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            var i = 0;
            var res = new Array();
            while (i < wish.length) {
                res[i] = wish[i];
                i++;
            }
            res = res.join(", ");
            var object = 'crafts';
            if (newOne.number === 1) var object = 'craft';
            return message.channel.send(`Les données ont bien été mises à jour.\nCes crafts ont été ajoutés à la liste : \`${res}\`\nTa liste de crafts contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour voir ta liste de crafts.`)
        }
        
        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Numéro> <Numéro>\` pour supprimer des objets de sa liste de crafts.`);
            const newCraft = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newCraft) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
            var j = 0;
            var i = 1;
            while (j < args.length) {
                i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            for (i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i], 10))) return message.reply(`tous les arguments doivent être des numéros correspondant à la place du craft dans la liste.`);
                if (parseInt(args[i], 10) > newCraft.number) return message.reply(`impossible de supprimer des objets qui n'existent pas dans la liste de crafts.`);
            }
            if (args.length > newCraft.number) return message.reply(`il y a plus d'arguments que de crafts dans la liste.`);
            var res = new Array();
            var i = 0;
            while (i < args.length) {
                res[i] = newCraft.list[parseInt(args[i], 10) - 1];
                i++;
            }
            res = res.join(", ");
            for (i = 0; i < args.length; i++) {
                var num = parseInt(args[i] - 1, 10);
                var str = newCraft.list[num];
                const update = await Craft.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $pull: { list: str },
                        $set: { number: newCraft.number - args.length }
                    })
            }
            const newOne = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (newOne.number < 1) {
                const del = await Craft.findOneAndDelete({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                message.channel.send(`Les données ont bien été mises à jour.`);
                return message.reply(`la wishlist est vide. Elle a donc été effacée.`);
            }
            var object = 'crafts';
            if (newOne.number === 1) var object = 'craft';
            return message.channel.send(`Les données ont bien été mises à jour.\nCes crafts ont été supprimés de la liste : \`${res}\`\nTa liste contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour voir ta liste de crafts.`);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher sa propre liste de crafts.\n\`${prefix}${commandName} <@Membre>\` pour afficher la liste de crafts d'un.e autre membre.`);
            if (!obj || isNaN(parseInt(obj))) {
                var taggedUser = message.mentions.users.first() || message.author;
                if (obj && taggedUser === message.author) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj && taggedUser === 'undefined') return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <@Membre>\` pour afficher la liste de crafts d'un.e autre membre.`);
                const newCraft = await Craft.findOne({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                });
                if (!newCraft && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
                if (!newCraft && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
                const newData = await Data.findOne({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                })
                const items = newCraft.list;
                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Liste de crafts de ${taggedUser.username}`)
                if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
                for (i = 0; i < newCraft.number; i++) {
                    newEmbed.addField(`\u200b`, `**${i + 1}.** ${items[i]}`);
                }
                newEmbed.setFooter(`Bot par Marie#1702`);
                return message.channel.send(newEmbed);
            }
            else {
                const res = await Craft.find({
                    serverID: message.guild.id
                }).sort();
                if (res.length === 0) return message.channel.send('Aucune liste de crafts n\'a été ajoutée.');
                var page = parseInt(obj, 10);
                if (isNaN(page)) var page = 1;
                var totalPages = Math.trunc(res.length / 10) + 1;
                if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
                if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
                var index = (page * 10) - 10;
                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle('Qui a des crafts en double ?')
                for (i = 0; i < 10; i++) {
                    if (index < res.length) {
                        let user = client.users.cache.get(res[index].userID);
                        newEmbed.addField(`ac!craft ${user.username}`, `**${index + 1}.** ${user.username}`)
                        index++;
                    }
                }
                newEmbed.setFooter(`Page ${page}/${totalPages}`);
                return message.channel.send(newEmbed);
            }
        }
    }
});