const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { prefix, token, prefix2 } = require('./config.js');
const Data = require('./models/id');
const Dodo = require ('./models/dodo');
const Wlist = require ('./models/wlist');
const Wishlist = require('./models/wishlist');
const Craft = require('./models/craft');
const Users = require ('./models/usersList');
const Card = require ('./models/card');
const Pnj = require('./models/pnj');
const Badge = require ('./models/badge');
let cooldown = new Set();
let cdseconds = 180;
let cdphotos = 0;

const client = new Discord.Client();
client.commands = new Discord.Collection();

mongoose.connect('mongodb://localhost:27017/data', {
    useNewUrlParser: true,
    useUnifiedTopology: true }, (err) => {
        if (err) return console.error(err);
        console.log('Mongoose est prêt');
    });
mongoose.Promise = global.Promise;

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

    if (message.channel.id) {
        const channel = channels.cache.get(message.channel.id);
    }
    else if (message.thread.id) {
        const channel = channels.cache.get(message.thread.id);
    }

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
            username: message.member.displayName.toLowerCase()
        })
        await checkUser.save();
    }

    const usersList = await Users.find({
        serverID: message.guild.id
    }).sort();

    const start = new Date();
    const hour = start.getHours();
    if (hour >= 0 && hour < 6) {
        const delAll = await Pnj.find({
            serverID: message.guild.id
        });
        for (i = 0; i < delAll.length; i++) {
            const dele = await Pnj.findOneAndDelete({
                userID: delAll[i].userID
            })
        }
    }

    if (answered === false && message.author.id === userCard) {
        const checkCard = await Card.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        var toAdd = checkCard.points;
        number = 2;
        var random = Math.floor(Math.random() * (number - 1 + 1)) + 1;
        switch (random) {
            case 1: answer = "rouge"; break;
            case 2: answer = "noire"; break;
        }
        if (message.content.toLowerCase().startsWith("rouge")) var num = 1;
        else if (message.content.toLowerCase().startsWith("noir")) var num = 2;
        if (answer === "rouge") var emoji = '🟥';
        else if (answer === "noire") var emoji = '⬛';
        if (num === random) {
            const update = await Card.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { points: toAdd + 5 }
                });
            message.react(emoji);
            message.reply('bonne réponse ! On dirait bien que je vais emménager bientôt !');
        }
        else {
            var lose = 1;
            if (toAdd === 0) var lose = 0;
            const update = await Card.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { points: toAdd - lose }
                });
            message.reply(`et non, pas cette fois ! J\'ai tiré une carte ${answer} ${emoji} !`);
        }
        answered = true; userCard = ""; answer = "";
        var newBadge = await Badge.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        var update = await Badge.findOneAndUpdate({
            userID: message.author.id,
            serverID: message.guild.id
            }, {
                $set: { badgeCard: newBadge.badgeCard + 1 }
            });
        var update = await Badge.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        if (update.badgeCard === 1) var title = `Petite nature`;
        else if (update.badgeCard === 10) var title = `Enthousiaste`;
        else if (update.badgeCard === 25) var title = `Joueuse hors pair`;
        else if (update.badgeCard === 50) var title = `Gameuse`;
        else if (update.badgeCard === 100) var title = `Addict aux jeux vidéo`;
        else if (update.badgeCard === 200) var title = `Challenger`;
        if (title) {
            var update = await Badge.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $push: { allTitles: `${title}` }
                });
                message.channel.send(`Félicitations ${message.author} ! Tu as gagné assez de Miles Nook pour débloquer un nouveau badge.\nNouveau titre : **${title}**.`);
        }
    }

    if (!message.content.startsWith(prefix)) {
        if (message.content.toLowerCase().includes('zerator')) {
            const messages = ["C'est qui Zerator ?", "Zera-quoi ?", "J'y connais rien à Twitch..."]
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            message.channel.send(randomMessage);
        }
        if (message.content.toLocaleLowerCase().includes('ponce')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("Vous parlez de ce beau gosse ?", {files: ["photos/ponce.jpg"] });
            }
        }
        if (message.content.toLocaleLowerCase().includes('antoine daniel')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("(:", {files: ["photos/antoine.jpg"] });
            }
        }
        if (message.content.toLocaleLowerCase().includes('kronomuzik')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("Il regarde pas l'objectif...", {files: ["photos/kronomuzik.jpg"] });
            }
        }
        if (message.content.toLocaleLowerCase().includes('mister mv')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("👉", {files: ["photos/mv.jpg"] });
            }
        }
        if (message.content.toLocaleLowerCase().includes('mynthos')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("TW gameur juteux", {files: ["photos/mynthos.jpg"] });
            }
        }
        if (message.content.toLocaleLowerCase().includes('rivenzi')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send({files: ["photos/rivenzi.jpg"]});
            }
        }
        if (message.content.toLocaleLowerCase().includes('ultia')) {
            cdphotos = cdphotos + 1;
            if (cdphotos % 20 == 0) {
                message.channel.send("Ça, c'est pas très ratus", {files: ["photos/ultia.jpg"] });
            }
        }
    }

    if (message.channel.id === '709401660832743435' || message.thread.id === '978765502677659669' || message.thread.id === '978762778179436546' || message.channel.id === '728214468785471558') {
        var checkBadge = await Badge.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        if (!checkBadge) {
            var checkBadge = new Badge({
                _id: mongoose.Types.ObjectId(),
                userID: message.author.id,
                serverID: message.guild.id,
            })
            await checkBadge.save();
        }
        if (!message.content.startsWith(prefix) && !message.content.startsWith(prefix2)) {
            var update = await Badge.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { badgeMsg: checkBadge.badgeMsg + 1 }
                });
            var update = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (update.badgeMsg === 1) var titre = `Marin d'eau douce`;
            else if (update.badgeMsg === 10) var titre = `Grande timide`;
            else if (update.badgeMsg === 50) var titre = `Aventurière`;
            else if (update.badgeMsg === 100) var titre = `Habituée`;
            else if (update.badgeMsg === 200) var titre = `Miracle de la nature`;
            else if (update.badgeMsg === 500) var titre = `Impératrice`;
            else if (update.badgeMsg === 1000) var titre = `Déesse`;
            if (titre) {
                var update = await Badge.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { allTitles: `${titre}` }
                    });
                    message.channel.send(`Félicitations ${message.author} ! Tu as gagné assez de Miles Nook pour débloquer un nouveau badge.\nNouveau titre : **${titre}**.`);
            }
        }
    }
    
    if (!message.content.startsWith(prefix) && !message.content.startsWith(prefix2)) return;
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
        return;
    }

    if (commandName === 'card') {
        if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🎲 ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Lancer un mini jeu :**`, value: `\`${prefix}${commandName}\` et suivre les instructions.`},
                    { name: `**Afficher le leaderboard :**`, value: `\`${prefix}${commandName} leaderboard\``},
                    { name: `**Afficher ses propres points :**`, value: `\`${prefix}${commandName} point\``},
                    { name: `**Afficher les points d'un autre membre :**`, value: `\`${prefix}${commandName} point <Membre>\``}
                    )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'leaderboard') {
            const checkCard = await Card.find({
                serverID: message.guild.id
            });
            if (checkCard.length === 0) return message.channel.send(`Aucune donnée n'a été trouvée.`);
            const newCard = await Card.find({
                serverID: message.guild.id
            }).sort({ points: -1 });
            if (newCard.length === 0) return message.channel.send(`Aucune donnée n'a été trouvée.`);
            var total = 0;
            for (i = 0; i < newCard.length; i++) {
                if (newCard[i].points === 0) break;
                if (total > 9) break;
                total++;
            }
            if (total === 0) return message.channel.send(`Aucune donnée n'a été trouvée.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🎲 Leaderboard`)
            for (i = 0; i < total; i++) {
                var user = client.users.cache.get(newCard[i].userID);
                if (!user) var name = 'Utilisateur inconnu';
                else var name = user.username;
                if (newCard[i].points > 0) newEmbed.addField(`${i + 1}. ${name}`, `${newCard[i].points} points`);
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'point' || obj === 'points') {
            var taggedUser = message.mentions.users.first() || message.author;
            if (args[0]) var who = args[0].toLowerCase();
            if (args[0] && taggedUser === message.author) {
                if (who.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${who}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (who.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${who}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (args[0] && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (args[0] && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} ${obj} <Membre>\` pour afficher les points d'un.e autre membre.`);
            const newCard = await Card.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newCard && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            if (!newCard) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName}\` pour lancer le mini jeu.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🎲 ${taggedUser.username}`)
                .setDescription(`${newCard.points} points`)
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'reset') {
            if (message.author.id === "240924015336751104") {
                const checkCard = await Card.find({
                    serverID: message.guild.id
                });
                if (checkCard.length === 0) return message.channel.send(`Aucune donnée n'a été trouvée.`);
                for (i = 0; i < checkCard.length; i++) {
                    var update = await Card.findOneAndUpdate({
                        userID: checkCard[i].userID,
                        serverID: message.guild.id
                    }, {
                        $set: { points: 0 }
                    });
                }
                return message.channel.send(`Tous les points ont été réinitialisés avec succès.`);
            }
            else {
                return message.reply(`permission refusée.`);
            }
        }

        else {
            const checkCard = await Card.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!checkCard) {
                const newCard = new Card({
                    _id: mongoose.Types.ObjectId(),
                    userID: message.author.id,
                    serverID: message.guild.id,
                    points: 0
                });
                await newCard.save();
            }
            if (cooldown.has(message.author.id)) {
                return message.reply(`tu dois attendre 3 min avant de pouvoir réutiliser la commande \`${prefix}${commandName}\`.`);
            }
            cooldown.add(message.author.id);
            message.reply('devine la couleur de la carte que je tiens dans ma main !\nRéponses possibles : \`rouge\` et \`noir\` !');
            answered = false;
            userCard = message.author.id;
            setTimeout(() => {
                cooldown.delete(message.author.id);
            }, cdseconds * 1000);
            return;
        }
    }

    else if (commandName === 'tg') {
        if (message.author.id === "240924015336751104") {
            message.channel.bulkDelete(1, true);
            return message.channel.send(`tg nn ?`);
        }
        else {
            const emoji = message.guild.emojis.cache.find(emoji => emoji.name === 'uncomfy');
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
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ton passeport.\n\`${prefix}bio create "Texte"\` pour y ajouter une biographie.`);
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

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`📇 ${prefix}${commandName}`)
                .setDescription(`*Alias : passeport, passport, id*`);
                newEmbed.addFields(
                    { name: `**Créer un passeport :**`, value: `\`${prefix}${commandName} create <Pseudo> <Île> <Fruit> <CodeAmi>\``},
                    { name: `**Supprimer son passeport :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Afficher son passeport :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher le passeport d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }
        
        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le passeport d'un.e autre membre.`);
            const newData = await Data.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newData && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            if (!newData) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\` pour créer un passeport.`);
            var newBadges = await Badge.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Passeport de ${taggedUser.username}`)
                .setThumbnail(taggedUser.displayAvatarURL({ format: "png", dynamic: true }))
            if (newBadges.title) newEmbed.setDescription(`\`${newBadges.title}\``);
            newEmbed.addFields(
                { name: 'Pseudo', value: `${newData.pseudo}`, inline: true },
                { name: 'Nom de l\'île', value: `${newData.ile}`, inline: true },
                { name: 'Fruit de base', value: `${newData.fruit}` },
                { name: 'Code ami', value: `${newData.code}`, inline: true },
            )
            if (newData.onirique) newEmbed.addField(`Code onirique`, `${newData.onirique}`, false);
            newEmbed.addField('Petite bio', `${newData.bio}`, false)
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'bio') {
        if (obj === 'create') {
            const list = message.content.slice(prefix.length).split('\"', 2);
            const bio = list[1];
            if (bio === ' ') return message.reply(`la bio doit contenir au moins un caractère affichable.`);
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
                $set: { bio: `Pas de bio, pour la modifier : \`${prefix}bio create \"Exemple\"\``}
            });
            return message.reply('ta bio a bien été effacée.');
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`📝 ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Créer une bio sur le passeport :**`, value: `\`${prefix}${commandName} create "Texte"\``},
                    { name: `**Supprimer sa bio :**`, value: `\`${prefix}${commandName} reset\``}
                )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            return message.reply(`la commande ${prefix}${commandName} sert à créer ou supprimer une biographie.\n\`${prefix}${commandName} create "Ceci est une biographie"\` pour ajouter une biographie au passeport.\n\`${prefix}${commandName} reset\` pour l'effacer.`);
        }
    }

    else if (commandName === 'codeami' || commandName === 'code') {
        if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`👭 ${prefix}${commandName}`)
                .setDescription(`*Alias : codeami, code*`);
                newEmbed.addFields(
                    { name: `**Afficher son code ami :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher le code ami d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                    { name: `**Afficher une page de tous les codes ami :**`, value: `\`${prefix}${commandName} <N° de page>\``}
                )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher son propre code ami.\n\`${prefix}${commandName} <Membre>\` ou \`${prefix}${commandName} <Page>\` pour afficher le code ami d'un.e autre membre.`);
        if (!obj || isNaN(parseInt(obj))) {
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le code ami d'un.e autre membre.\n\`${prefix}${commandName} <Page>\` pour afficher une page des codes ami.`);
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
            var totalPages = Math.trunc(res.length / 11) + 1;
            if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
            if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
            var index = (page * 10) - 10;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle('Codes ami')
            for (i = 0; i < 10; i++) {
                if (index < res.length) {
                    let user = client.users.cache.get(res[index].userID);
                    if (!user) var name = 'Utilisateur inconnu';
                    else var name = user.username;
                    newEmbed.addField(`${index + 1}. ${name}`, `${res[index].code}`)
                    index++;
                }
            }
            newEmbed.setFooter(`Page ${page}/${totalPages}`);
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'onirique') {
        if (obj === 'create') {
            const oni = args[0];
            if (!oni || args.length > 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend un argument :\n\`${prefix}${commandName} ${obj} <Code-onirique>\``);
            const doc = await Data.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (!doc) return message.reply(`pour ajouter un code onirique, il faut d\'abord créer un passeport :\n\`${prefix}passeport create <Pseudo> <Ile> <FruitDeBase> <CodeAmi>\``)
            const update = await Data.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: { onirique: `${oni}`}
            });
            return message.reply(`les données ont bien été mises à jour.\n\`${prefix}passeport\` pour voir ton passeport.`);
        }

        else if (obj === 'reset') {
            const update = await Data.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
            }, {
                $set: { onirique: null }
            });
            return message.reply('ton code onirique a bien été effacée.');
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`☁️ ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Ajouter un code onirique au passeport :**`, value: `\`${prefix}${commandName} create <Code-onirique>\``},
                    { name: `**Supprimer son code onirique :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Afficher son code onirique :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher le code onirique d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                    { name: `**Afficher une page de tous les codes oniriques :**`, value: `\`${prefix}${commandName} <N° de page>\``}
                )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` prend zéro ou un argument.\n\`${prefix}${commandName}\` pour afficher son propre code onirique.\n\`${prefix}${commandName} <Membre>\` ou \`${prefix}${commandName} <Page>\` pour afficher le code onirique d'un.e autre membre.`);
        if (!obj || isNaN(parseInt(obj))) {
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le code onirique d'un.e autre membre.\n\`${prefix}${commandName} <Page>\` pour afficher une page des codes oniriques.`);
            const newData = await Data.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newData || !newData.onirique) return message.channel.send(`Aucun code onirique n'a été trouvé pour ${taggedUser.username}.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Code onirique de ${taggedUser.username}`)
                .setDescription(`${newData.onirique}`)
                .setThumbnail(taggedUser.displayAvatarURL({ format: "png", dynamic: true }))
                .setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }

        else {
            const res = await Data.find({
                serverID: message.guild.id
            }).sort();
            if (res.length === 0) return message.channel.send('Aucun code onirique n\'a été ajouté.');
            var page = parseInt(obj, 10);
            if (isNaN(page)) var page = 1;
            var totalPages = Math.trunc(res.length / 11) + 1;
            if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
            if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
            var index = (page * 10) - 10;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle('Codes oniriques')
            for (i = 0; i < 10; i++) {
                if (index < res.length) {
                    let user = client.users.cache.get(res[index].userID);
                    if (!user) var name = 'Utilisateur inconnu';
                    else var name = user.username;
                    if (!res[index].onirique) var texte = 'Pas de code onirique';
                    else var texte = res[index].onirique;
                    newEmbed.addField(`${index + 1}. ${name}`, `${texte}`)
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ton dodocode.\n\`${prefix}${commandName} reset\` pour l'effacer.`);
            const taggedUser = message.author;
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Dodocode de ${taggedUser.username}`)
                .setDescription(`${newDodo.dodocode}`)
                .setThumbnail("https://image.noelshack.com/fichiers/2020/23/7/1591545252-dodoairlineslogo.png")
                .addField('Raison', `${newDodo.raison}`)
                .setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var newBadge = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            var update = await Badge.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { badgeDodo: newBadge.badgeDodo + 1 }
                });
            var update = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (update.badgeDodo === 1) var titre = `Touriste`;
            else if (update.badgeDodo === 5) var titre = `Multijoueuse`;
            else if (update.badgeDodo === 10) var titre = `Maîtresse de maison`;
            else if (update.badgeDodo === 20) var titre = `Amie conviviale`;
            else if (update.badgeDodo === 50) var titre = `Fêtarde`;
            if (titre) {
                var update = await Badge.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { allTitles: `${titre}` }
                    });
                    message.channel.send(`Félicitations ${message.author} ! Tu as gagné assez de Miles Nook pour débloquer un nouveau badge.\nNouveau titre : **${titre}**.`);
            }
            return;
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
                if (!user) var name = 'Utilisateur inconnu';
                else var name = user.username;
                newEmbed.addField(`${i + 1}. Chez ${name}`, `**Dodocode** : ${res[i].dodocode}\n**Raison** : ${res[i].raison}`)
            }
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }
        
        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`✈️ ${prefix}${commandName}`)
                .setDescription(`*Alias : dodocode, dcode*`);
                newEmbed.addFields(
                    { name: `**Créer un dodocode temporaire :**`, value: `\`${prefix}${commandName} create <Dodocode> "Raison"\``},
                    { name: `**Supprimer son dodocode :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Afficher son dodocode :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher le dodocode d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                    { name: `**Afficher tous les dodocodes actifs :**`, value: `\`${prefix}${commandName} all\``}

                )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le dodocode d'un.e autre membre.`);
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
			    serverID: message.guild.id
            });
            if (!newDodo && taggedUser === message.author) return message.reply(`aucun dodocode actif n\'a été trouvé.\n\`${prefix}${commandName} create <DodoCode> <"Raison">\` pour créer un dodocode.`);
            if (!newDodo && taggedUser != message.author) return message.reply(`aucun dodocode actif n\'a été trouvé pour cet utilisateur.`);
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

    else if (commandName === 'waitinglist' || commandName === 'waitlist') {
        if (obj === 'create') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument :\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\``)
            for (i = 0; i < args.length; i++) {
                if (getUserFromMention(args[i])) args[i] = getUserFromMention(args[i]);
                else {
                    for (j = 0; j < usersList.length; j++) {
                        if (usersList[j].username.includes(`${args[i].toLowerCase()}`)) { args[i] = (usersList[j].userID); break; }
                    }
                }
            }
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                var i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                if (!client.users.cache.get(args[i])) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\` pour créer une liste d'attente.`);
                number++;
            }
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta liste d'attente.\n\`${prefix}${commandName} reset\` pour l'effacer.\n\`${prefix}${commandName} next\` pour passer à la personne suivante.\n\`${prefix}${commandName} add <Membre> <Membre>\` pour y ajouter des membres.\n\`${prefix}${commandName} delete <Membre> <Membre>\` pour supprimer des membres.`);
            for (i = 0; i < number; i++) {
                const user = client.users.cache.get(args[i]);
                if (!user) break;
                const update = await Wlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                }, {
                    $push: { users: args[i] }
                });
            }
            const newDodo = await Dodo.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            const newTitre = new Array();
            for (i = 0; i < args.length; i++) {
                let user = client.users.cache.get(args[i]);
                if (!user) break;
                newTitre[i] = `**${i + 1}.** ${user.username}`;
            }
            const newTitles = newTitre.join('\n\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            newEmbed.addField(`*${prefix}${commandName} next*`, `${newTitles}`)
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            const ret = client.users.cache.get(args[0]);
            return message.channel.send(`${ret}, à ton tour !`);
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
            if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend zéro ou un argument.\n\`${prefix}${commandName} ${obj}\` pour passer à la personne suivante dans ta liste d'attente.\n\`${prefix}${commandName} ${obj} <Membre>\` pour passer à la personne suivante dans la liste d'attente d'un.e autre membre.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (args[0] && taggedUser === message.author) {
                if (args[0].length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${args[0].toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (args[0].length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${args[0].toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (args[0] && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher la liste d'attente d'un.e autre membre.`);
            const newWlist = await Wlist.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newWlist && taggedUser === message.author) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <Membre> <Membre>\` pour créer une liste d'attente.`);
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
            const newTitre = new Array();
                for (i = 0; i < list.length; i++) {
                    let user = client.users.cache.get(list[i]);
                    if (!user) break;
                    newTitre[i] = `**${i + 1}.** ${user.username}`;
                }
            const newTitles = newTitre.join('\n\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${taggedUser.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            newEmbed.addField(`*${prefix}${commandName} next*`, `${newTitles}`)
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var user = client.users.cache.get(newOne.users[0]);
            return message.channel.send(`${user}, à ton tour !`);
        }

        else if (obj === 'add') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\` pour ajouter des membres à ta liste d'attente.`);
            const newWlist = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Membre> <Membre>\` pour créer une liste d'attente.`);
            for (i = 0; i < args.length; i++) {
                if (getUserFromMention(args[i])) args[i] = getUserFromMention(args[i]);
                else {
                    for (j = 0; j < usersList.length; j++) {
                        if (usersList[j].username.includes(`${args[i].toLowerCase()}`)) { args[i] = (usersList[j].userID); break; }
                    }
                }
            }
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                var i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                if (!client.users.cache.get(args[i])) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\` pour ajouter des membres à ta liste d'attente.`);
                number++;
            }
            const check = newWlist.users;
            var i = 0;
            var j = 0;
            while (i < args.length) {
                j = 0;
                while (j < check.length) {
                    if (args[i] === check[j]) return message.reply(`impossible d'ajouter des membres qui sont déjà dans la liste d'attente.`);
                    else j++;
                }
                i++;
            }
            for (i = 0; i < number; i++) {
                const update = await Wlist.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { users: args[i] },
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
            const newTitre = new Array();
                for (i = 0; i < list.length; i++) {
                    let user = client.users.cache.get(list[i]);
                    if (!user) break;
                    newTitre[i] = `**${i + 1}.** ${user.username}`;
                }
            const newTitles = newTitre.join('\n\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            newEmbed.addField(`*${prefix}${commandName} next*`, `${newTitles}`)
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\` pour supprimer des membres de ta liste d'attente.`);
            const newWlist = await Wlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Membre> <Membre>\` pour créer une liste d'attente.`);
            for (i = 0; i < args.length; i++) {
                if (getUserFromMention(args[i])) args[i] = getUserFromMention(args[i]);
                else {
                    for (j = 0; j < usersList.length; j++) {
                        if (usersList[j].username.includes(`${args[i].toLowerCase()}`)) { args[i] = (usersList[j].userID); break; }
                    }
                }
            }
            var j = 0;
            var i = 1;
            while (j < args.length - 1) {
                var i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            var number = 0;
            for (i = 0; i < args.length; i++) {
                if (!client.users.cache.get(args[i])) return message.reply(`utilisateur introuvable.\n\`${prefix}${commandName} ${obj} <Membre> <Membre>\` pour supprimer des membres de ta liste d'attente.`);
                number++;
            }
            var i = 0;
            var j = 0;
            var temp = 0;
            while (i < args.length) {
                j = 0;
                temp = 0;
                while (j < newWlist.users.length) {
                    if (args[i] === newWlist.users[j]) temp++;
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
                        $pull: { users: args[i] },
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
            const newTitre = new Array();
                for (i = 0; i < list.length; i++) {
                    let user = client.users.cache.get(list[i]);
                    if (!user) break;
                    newTitre[i] = `**${i + 1}.** ${user.username}`;
                }
            const newTitles = newTitre.join('\n\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${message.author.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`)
            newEmbed.addField(`*${prefix}${commandName} next*`, `${newTitles}`)
            newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var user = client.users.cache.get(list[0]);
            return message.channel.send(`${user}, à ton tour !`);
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🎟️ ${prefix}${commandName}`)
                .setDescription(`*Alias : waitinglist, waitlist*`);
                newEmbed.addFields(
                    { name: `**Créer une liste d'attente :**`, value: `\`${prefix}${commandName} create <Membre> <Membre>\``},
                    { name: `**Supprimer sa liste d'attente :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Passer à la personne suivante :**`, value: `\`${prefix}${commandName} next\``},
                    { name: `**Passer à la personne suivante sur la liste d'un autre membre :**`, value: `\`${prefix}${commandName} next <Membre>\``},
                    { name: `**Ajouter des gens à sa liste :**`, value: `\`${prefix}${commandName} add <Membre> <Membre>\``},
                    { name: `**Supprimer des gens de sa liste :**`, value: `\`${prefix}${commandName} delete <Membre> <Membre>\``},
                    { name: `**Afficher sa liste d'attente :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher la liste d'attente d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``}
                    )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj.toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj.toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher la liste d'attente d'un.e autre membre.`);
            const newWlist = await Wlist.findOne({
                userID: taggedUser.id,
			    serverID: message.guild.id
            });
            if (!newWlist && taggedUser === message.author) return message.reply(`aucune donnée n\'a été trouvée.\n\`${prefix}${commandName} create <Membre> <Membre> <Membre>\` pour créer une liste d'attente.`);
            if (!newWlist && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const newDodo = await Dodo.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            const list = newWlist.users;
            const newTitre = new Array();
                for (i = 0; i < list.length; i++) {
                    let user = client.users.cache.get(list[i]);
                    if (!user) break;
                    newTitre[i] = `**${i + 1}.** ${user.username}`;
                }
            const newTitles = newTitre.join('\n\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste d'attente de ${taggedUser.username}`)
            if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`);
            newEmbed.addField(`*${prefix}${commandName} next*`, `${newTitles}`)
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
            if (check) return message.reply(`une wishlist existe déjà.\n\`${prefix}${commandName} reset\` pour l'effacer.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des objets.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des objets.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            var j = 0;
            var i = 1;
            while (j < wish.length - 1) {
                var i = j + 1;
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta wishlist.\n\`${prefix}${commandName} reset\` pour la supprimer.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des objets.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des objets.`)
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
            const newTitre = new Array();
            for (i = 0; i < list.length; i++) {
                newTitre[i] = `**${i + 1}.** ${list[i]}`;
            }
            if (newTitre.length > 19) {
                var bonus = new Array();
                var j = 0;
                if (newTitre.length < 40) var len = newTitre.length;
                else var len = 40;
                for (i = 20; i < len; i++) {
                    bonus[j] = `${newTitre[i]}`;
                    j++;
                }
                if (newTitre.length > 39) {
                    var bonus2 = new Array();
                    var j = 0;
                    if (newTitre.length < 60) var len = newTitre.length;
                    else var len = 60;
                    for (i = 40; i < len; i++) {
                        bonus2[j] = `${newTitre[i]}`;
                        j++;
                    }
                }
                var newTitles = newTitre.splice(0, 20).join(`\n`);
                if (bonus) var newBonus = bonus.join(`\n`);
                if (bonus2) var newBonus2 = bonus2.join(`\n`);
            }
            else var newTitles = newTitre.join('\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Wishlist de ${message.author.username}`)
                .addField(`*Give her what she wants*`, `${newTitles}`)
            if (newBonus) newEmbed.addField(`*Page 2*`, `${newBonus}`);
            if (newBonus2) newEmbed.addField(`*Page 3*`, `${newBonus2}`);
                newEmbed.setFooter('Bot par Marie#1702');
            message.channel.send(newEmbed);
            var newBadge = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            var update = await Badge.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { badgeWish: newBadge.badgeWish + 1 }
                });
            var update = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (update.badgeWish === 1) var titre = `Sugar Mommy`;
            else if (update.badgeWish === 5) var titre = `Enfant capricieuse`;
            if (titre) {
                var update = await Badge.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { allTitles: `${titre}` }
                    });
                    message.channel.send(`Félicitations ${message.author} ! Tu as gagné assez de Miles Nook pour débloquer un nouveau badge.\nNouveau titre : **${titre}**.`);
            }
            return;
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
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\` pour ajouter des objets à ta wishlist.`);
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
                var i = j + 1;
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
            return message.channel.send(`Les données ont bien été mises à jour.\nCes objets ont été ajoutés à ta wishlist : \`${res}\`\nCelle-ci contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour l'afficher.`);
        }

        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Numéro> <Numéro>\` pour supprimer des objets de ta wishlist.`);
            const newWishlist = await Wishlist.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newWishlist) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une wishlist.`);
            var j = 0;
            var i = 1;
            while (j < args.length) {
                var i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            for (i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i], 10))) return message.reply(`tous les arguments doivent être des numéros correspondant à la place de l'objet dans la wishlist.`);
                if (parseInt(args[i], 10) > newWishlist.number) return message.reply(`impossible de supprimer des objets qui n'existent pas.`);
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
                return message.reply(`ta wishlist est vide. Elle a donc été effacée.`);
            }
            var object = 'objets';
            if (newOne.number === 1) var object = 'objet';
            return message.channel.send(`Les données ont bien été mises à jour.\nCes objets ont été supprimés de la wishlist : \`${res}\`\nCelle-ci contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour l'afficher.`);
        }

        else if (obj === 'search') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument :\n\`${prefix}${commandName} ${obj} <Objet>\``);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ').toLowerCase();
            const toParse = await Wishlist.find({
                serverID: message.guild.id
            }).sort();
            if (!toParse || toParse.length === 0) return message.channel.send(`Aucune wishlist n'a été trouvée.`);
            const res = new Array();
            var k = 0;
            for (i = 0; i < toParse.length; i++) {
                var list = toParse[i].list;
                for (j = 0; j < list.length; j++) {
                    if (list[j].toLowerCase().includes(`${str}`)) {
                        res[k] = `${toParse[i].userID}:${list[j]}`;
                        k++;
                    }
                }
            }
            if (res.length === 0) return message.reply(`aucun utilisateur ne désire cet objet.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Qui désire cet objet ?`)
            for (i = 0; i < res.length; i++) {
                var divide = res[i].split(':');
                let user = client.users.cache.get(divide[0]);
                if (!user) var name = 'Utilisateur inconnu';
                else var name = user.username;
                newEmbed.addField(`**${i + 1}.** ${name}`, `${divide[1]}`);
            }
            newEmbed.setFooter(`Bot par Marie#1702`);
            message.channel.send(newEmbed);
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`💸 ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Créer une wishlist :**`, value: `\`${prefix}${commandName} create <Objet>,<Objet>\``},
                    { name: `**Supprimer sa wishlist :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Ajouter des objets à sa wishlist :**`, value: `\`${prefix}${commandName} add <Objet>,<Objet>\``},
                    { name: `**Supprimer des objets de sa wishlist :**`, value: `\`${prefix}${commandName} delete <Numéro de l'objet> <Numéro de l'objet>\``},
                    { name: `**Afficher sa wishlist :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher la wishlist d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                    { name: `**Afficher toutes les personnes ayant une wishlist :**`, value: `\`${prefix}${commandName} <Page>\``},
                    { name: `**Chercher un objet dans toutes les wishlists :**`, value: `\`${prefix}${commandName} search <Objet>\``}
                    )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            if (!obj || isNaN(parseInt(obj))) {
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj.toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj.toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher la wishlist d'un.e autre membre.`);
            const newWishlist = await Wishlist.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newWishlist && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une wishlist.`);
            if (!newWishlist && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const items = newWishlist.list;
            const newTitre = new Array();
            for (i = 0; i < items.length; i++) {
                newTitre[i] = `**${i + 1}.** ${items[i]}`;
            }
            if (newTitre.length > 19) {
                var bonus = new Array();
                var j = 0;
                if (newTitre.length < 40) var len = newTitre.length;
                else var len = 40;
                for (i = 20; i < len; i++) {
                    bonus[j] = `${newTitre[i]}`;
                    j++;
                }
                if (newTitre.length > 39) {
                    var bonus2 = new Array();
                    var j = 0;
                    if (newTitre.length < 60) var len = newTitre.length;
                    else var len = 60;
                    for (i = 40; i < len; i++) {
                        bonus2[j] = `${newTitre[i]}`;
                        j++;
                    }
                }
                var newTitles = newTitre.splice(0, 20).join(`\n`);
                if (bonus) var newBonus = bonus.join(`\n`);
                if (bonus2) var newBonus2 = bonus2.join(`\n`);
            }
            else var newTitles = newTitre.join('\n');
            let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Wishlist de ${taggedUser.username}`)
            .addField(`*Give her what she wants*`, `${newTitles}`)
            if (newBonus) newEmbed.addField(`*Page 2*`, `${newBonus}`);
            if (newBonus2) newEmbed.addField(`*Page 3*`, `${newBonus2}`);
            newEmbed.setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
            }
            
            else {
                const res = await Wishlist.find({
                    serverID: message.guild.id
                }).sort();
                if (res.length === 0) return message.channel.send('Aucune wishlist n\'a été ajoutée.');
                var page = parseInt(obj, 10);
                if (isNaN(page)) var page = 1;
                var totalPages = Math.trunc(res.length / 11) + 1;
                if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
                if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
                var index = (page * 10) - 10;
                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle('Qui a une wishlist ?')
                for (i = 0; i < 10; i++) {
                    if (index < res.length) {
                        let user = client.users.cache.get(res[index].userID);
                        if (!user) var name = 'Utilisateur inconnu';
                        else var name = user.username;
                        newEmbed.addField(`${prefix}${commandName} ${name}`, `**${index + 1}.** ${name}`)
                        index++;
                    }
                }
                newEmbed.setFooter(`Page ${page}/${totalPages}`);
                return message.channel.send(newEmbed);
            }
        }
    }

    else if (commandName === 'craft') {
        if (obj === 'create') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument. S'il y en a plusieurs, ils doivent être séparés par une virgule :\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\``);
            const check = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (check) return message.reply(`une liste de crafts existe déjà.\n\`${prefix}${commandName} reset\` pour l'effacer.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des crafts.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des crafts.`);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');
            var j = 0;
            var i = 1;
            while (j < wish.length - 1) {
                var i = j + 1;
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${commandName}\` pour voir ta liste de crafts.\n\`${prefix}${commandName} reset\` la supprimer.\n\`${prefix}${commandName} add <Objet>,<Objet>\` pour ajouter des crafts.\n\`${prefix}${commandName} delete <Numéro> <Numéro>\` pour supprimer des crafts.`)
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
            const newTitre = new Array();
            for (i = 0; i < list.length; i++) {
                newTitre[i] = `**${i + 1}.** ${list[i]}`;
            }
            if (newTitre.length > 19) {
                var bonus = new Array();
                var j = 0;
                if (newTitre.length < 40) var len = newTitre.length;
                else var len = 40;
                for (i = 20; i < len; i++) {
                    bonus[j] = `${newTitre[i]}`;
                    j++;
                }
                if (newTitre.length > 39) {
                    var bonus2 = new Array();
                    var j = 0;
                    if (newTitre.length < 60) var len = newTitre.length;
                    else var len = 60;
                    for (i = 40; i < len; i++) {
                        bonus2[j] = `${newTitre[i]}`;
                        j++;
                    }
                }
                var newTitles = newTitre.splice(0, 20).join(`\n`);
                if (bonus) var newBonus = bonus.join(`\n`);
                if (bonus2) var newBonus2 = bonus2.join(`\n`);
            }
            else var newTitles = newTitre.join('\n');
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Liste de crafts de ${message.author.username}`)
            if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
                newEmbed.addField(`*Take it or leave it*`, `${newTitles}`)
            if (newBonus) newEmbed.addField(`*Page 2*`, `${newBonus}`);
            if (newBonus2) newEmbed.addField(`*Page 3*`, `${newBonus2}`);
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
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend entre un et 24 arguments.\n\`${prefix}${commandName} ${obj} <Objet>,<Objet>\` pour ajouter des objets à ta liste de crafts.`);
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
                var i = j + 1;
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
            return message.channel.send(`Les données ont bien été mises à jour.\nCes crafts ont été ajoutés à la liste : \`${res}\`\nCelle-ci contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour l'afficher.`)
        }
        
        else if (obj === 'delete' || obj === 'del') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument.\n\`${prefix}${commandName} ${obj} <Numéro> <Numéro>\` pour supprimer des objets de ta liste de crafts.`);
            const newCraft = await Craft.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!newCraft) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
            var j = 0;
            var i = 1;
            while (j < args.length) {
                var i = j + 1;
                while (i < args.length) {
                    if (args[j] === args[i]) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` ne peut pas contenir deux fois le même argument.`);
                    else i++;
                }
                j++;
            }
            for (i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i], 10))) return message.reply(`tous les arguments doivent être des numéros correspondant à la place de l'objet dans la liste.`);
                if (parseInt(args[i], 10) > newCraft.number || parseInt(args[i], 10) < 1) return message.reply(`impossible de supprimer des objets qui n'existent pas.`);
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
            return message.channel.send(`Les données ont bien été mises à jour.\nCes crafts ont été supprimés de la liste : \`${res}\`\nCelle-ci contient ${newOne.number} ${object}.\n\`${prefix}${commandName}\` pour l'afficher.`);
        }

        else if (obj === 'search') {
            if (args.length === 0) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend au moins un argument :\n\`${prefix}${commandName} ${obj} <Objet>\``);
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ').toLowerCase();
            const toParse = await Craft.find({
                serverID: message.guild.id
            }).sort();
            if (!toParse || toParse.length === 0) return message.channel.send(`Aucune liste de craft n'a été trouvée.`);
            const res = new Array();
            var k = 0;
            for (i = 0; i < toParse.length; i++) {
                var list = toParse[i].list;
                for (j = 0; j < list.length; j++) {
                    if (list[j].toLowerCase().includes(`${str}`)) {
                        res[k] = `${toParse[i].userID}:${list[j]}`;
                        k++;
                    }
                }
            }
            if (res.length === 0) return message.reply(`aucun utilisateur ne possède cet objet.`);
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Qui possède ce craft ?`)
            for (i = 0; i < res.length; i++) {
                var divide = res[i].split(':');
                let user = client.users.cache.get(divide[0]);
                if (!user) var name = 'Utilisateur inconnu';
                else var name = user.username;
                newEmbed.addField(`**${i + 1}.** ${name}`, `${divide[1]}`);
            }
            newEmbed.setFooter(`Bot par Marie#1702`);
            message.channel.send(newEmbed);
            var newBadge = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            })
            var update = await Badge.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $set: { badgeSearch: newBadge.badgeSearch + 1 }
                });
            var update = await Badge.findOne({
                userID: message.author.id,
                serverID: message.guild.id
            });
            if (update.badgeSearch === 1) var titre = `Artiste née`;
            else if (update.badgeSearch === 5) var titre = `Bâtisseuse`;
            else if (update.badgeSearch === 10) var titre = `Styliste`;
            else if (update.badgeSearch === 15) var titre = `Architecte d'intérieur`;
            if (titre) {
                var update = await Badge.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $push: { allTitles: `${titre}` }
                    });
                    message.channel.send(`Félicitations ${message.author} ! Tu as gagné assez de Miles Nook pour débloquer un nouveau badge.\nNouveau titre : **${titre}**.`);
            }
            return;
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🔨 ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Créer une liste de crafts :**`, value: `\`${prefix}${commandName} create <Objet>,<Objet>\``},
                    { name: `**Supprimer sa liste de crafts :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Ajouter des objets à sa liste de crafts :**`, value: `\`${prefix}${commandName} add <Objet>,<Objet>\``},
                    { name: `**Supprimer des objets de sa liste de crafts :**`, value: `\`${prefix}${commandName} delete <Numéro de l'objet> <Numéro de l'objet>\``},
                    { name: `**Afficher sa liste de crafts :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher la liste de crafts d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                    { name: `**Afficher toutes les personnes ayant une liste de crafts :**`, value: `\`${prefix}${commandName} <Page>\``},
                    { name: `**Chercher un objet dans toutes les listes de crafts :**`, value: `\`${prefix}${commandName} search <Objet>\``}
                    )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            if (!obj || isNaN(parseInt(obj))) {
                var taggedUser = message.mentions.users.first() || message.author;
                if (obj && taggedUser === message.author) {
                    if (obj.length < 4) {
                        for (i = 0; i < usersList.length; i++) {
                            var taggedUser = 'undefined';
                            if (usersList[i].username === `${obj.toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                        }
                    }
                    if (obj.length > 3 || taggedUser === 'undefined') {
                        for (i = 0; i < usersList.length; i++) {
                            var taggedUser = 'undefined';
                            if (usersList[i].username.includes(`${obj.toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                        }
                    }
                }
                if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
                if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher la liste de crafts d'un.e autre membre.\n\`${prefix}${commandName} <Page>\` pour afficher la liste de tous les gens ayant une liste de crafts.`);
                const newCraft = await Craft.findOne({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                });
                if (!newCraft && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
                if (!newCraft && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
                const newData = await Data.findOne({
                    userID: taggedUser.id,
                    serverID: message.guild.id
                });
                const items = newCraft.list;
                const newTitre = new Array();
                for (i = 0; i < items.length; i++) {
                    newTitre[i] = `**${i + 1}.** ${items[i]}`;
                };
                if (newTitre.length > 19) {
                    var bonus = new Array();
                    var j = 0;
                    if (newTitre.length < 40) var len = newTitre.length;
                    else var len = 40;
                    for (i = 20; i < len; i++) {
                        bonus[j] = `${newTitre[i]}`;
                        j++;
                    }
                    if (newTitre.length > 39) {
                        var bonus2 = new Array();
                        var j = 0;
                        if (newTitre.length < 60) var len = newTitre.length;
                        else var len = 60;
                        for (i = 40; i < len; i++) {
                            bonus2[j] = `${newTitre[i]}`;
                            j++;
                        }
                    }
                    var newTitles = newTitre.splice(0, 20).join(`\n`);
                    if (bonus) var newBonus = bonus.join(`\n`);
                    if (bonus2) var newBonus2 = bonus2.join(`\n`);
                }
                else var newTitles = newTitre.join('\n');
                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Liste de crafts de ${taggedUser.username}`)
                if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
                    newEmbed.addField(`*Take it or leave it*`, `${newTitles}`)
                if (newBonus) newEmbed.addField(`*Page 2*`, `${newBonus}`);
                if (newBonus2) newEmbed.addField(`*Page 3*`, `${newBonus2}`);
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
                var totalPages = Math.trunc(res.length / 11) + 1;
                if ((page > totalPages || page < 1) && totalPages === 1) return message.reply(`la page demandée n'existe pas. Essayez \`${prefix}${commandName} 1\``);
                if (page > totalPages || page < 1) return message.reply(`la page demandée n'existe pas. Cherchez une page entre 1 et ${totalPages}.`);
                var index = (page * 10) - 10;
                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle('Qui a des crafts en double ?')
                for (i = 0; i < 10; i++) {
                    if (index < res.length) {
                        let user = client.users.cache.get(res[index].userID);
                        if (!user) var name = 'Utilisateur inconnu';
                        else var name = user.username;
                        newEmbed.addField(`${prefix}${commandName} ${name}`, `**${index + 1}.** ${name}`)
                        index++;
                    }
                }
                newEmbed.setFooter(`Page ${page}/${totalPages}`);
                return message.channel.send(newEmbed);
            }
        }
    }

    else if (commandName === 'pnj') {
        if (obj === 'create') {
            if (args.length != 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend un seul argument.\n\`${prefix}${commandName} ${obj} <Nom du pnj>\``);
            const perso = args[0].charAt(0).toUpperCase() + args[0].substring(1).toLowerCase();
            if (perso != 'Sarah' && perso != 'Blaise' && perso != 'Racine' && perso != 'Rounard' && perso != 'Céleste') return message.reply(`le personnage spécifié est invalide. Les pnj acceptés sont : \`Sarah\`, \`Blaise\`, \`Racine\`, \`Rounard\` et \`Céleste\`.`);
            const del = await Pnj.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
            const newPnj = new Pnj({
                _id: mongoose.Types.ObjectId(),
                userID: message.author.id,
                serverID: message.guild.id,
                pnj: perso
            });
            await newPnj.save();
            message.channel.send(`Les données ont bien été mises à jour et seront supprimées avant demain à 5h du matin.\n\`${prefix}${commandName}\` pour voir ton pnj.`);
            if (perso === 'Sarah') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593787155-sarahlogo.png";
            else if (perso === 'Rounard') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788312-rounardlogo.png";
            else if (perso === 'Céleste') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995774-celestelogo.png";
            else if (perso === 'Blaise') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995865-blaiselogo.png";
            else if (perso === 'Racine') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788881-racinelogo.png";
            let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Chez ${message.author.username}`)
            .setThumbnail(`${img}`)
            .setDescription(`${newPnj.pnj}`)
            .setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }

        else if (obj === 'reset') {
            const del = await Pnj.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply('aucun pnj n\'a été trouvé.');
            return message.reply('ton pnj a bien été effacé.');
        }

        else if (obj === 'search') {
            if (args.length != 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend un seul argument.\n\`${prefix}${commandName} ${obj} <Nom du pnj>\` ou \`${prefix}${commandName} ${obj} all\``);
            const perso = args[0].charAt(0).toUpperCase() + args[0].substring(1).toLowerCase();
            if (perso != 'Sarah' && perso != 'Céleste' && perso != 'Blaise' && perso != 'Racine' && perso != 'Rounard') return message.reply(`le personnage spécifié est invalide. Les pnj acceptés sont : \`Sarah\`, \`Blaise\`, \`Racine\`, \`Rounard\` et \`Céleste\`.`);
            const allPnj = await Pnj.find({
                serverID: message.guild.id,
                pnj: perso
            }).sort();
            if (allPnj.length === 0) return message.reply(`aucun utilisateur n'a actuellement ce pnj sur son île.`);
            if (perso === 'Sarah') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593787155-sarahlogo.png";
            else if (perso === 'Rounard') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788312-rounardlogo.png";
            else if (perso === 'Céleste') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995774-celestelogo.png";
            else if (perso === 'Blaise') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995865-blaiselogo.png";
            else if (perso === 'Racine') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788881-racinelogo.png";
            let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`🔍 ${perso}`)
            .setThumbnail(`${img}`)
            for (i = 0; i < allPnj.length; i++) {
                let user = client.users.cache.get(allPnj[i].userID);
                if (!user) var name = 'Utilisateur inconnu';
                else var name = user.username;
                newEmbed.addField(`------`, `**${i + 1}.** Chez ${name}`);
            }
            newEmbed.setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }

        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`🕴️ ${prefix}${commandName}`)
                newEmbed.addFields(
                    { name: `**Créer son PNJ du jour :**`, value: `\`${prefix}${commandName} create <Nom du PNJ>\``},
                    { name: `**Supprimer son PNJ :**`, value: `\`${prefix}${commandName} reset\``},
                    { name: `**Chercher un PNJ chez quelqu'un :**`, value: `\`${prefix}${commandName} search <Nom du PNJ>\``},
                    { name: `**Afficher son PNJ du jour :**`, value: `\`${prefix}${commandName}\``},
                    { name: `**Afficher le PNJ d'un membre :**`, value: `\`${prefix}${commandName} <Membre>\``}
                    )
                .setFooter('Bot par Marie#1702');
            return message.channel.send(newEmbed);
        }

        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj.toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj.toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le PNJ d'un.e autre membre.`);
            const newPnj = await Pnj.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newPnj && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Nom du pnj>\` pour créer un PNJ.`);
            if (!newPnj && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            const perso = newPnj.pnj;
            if (perso === 'Sarah') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593787155-sarahlogo.png";
            else if (perso === 'Rounard') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788312-rounardlogo.png";
            else if (perso === 'Céleste') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995774-celestelogo.png";
            else if (perso === 'Blaise') var img = "http://image.noelshack.com/fichiers/2020/29/5/1594995865-blaiselogo.png";
            else if (perso === 'Racine') var img = "http://image.noelshack.com/fichiers/2020/27/5/1593788881-racinelogo.png";
            let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`PNJ de ${taggedUser.username}`)
                .setThumbnail(`${img}`)
                .setDescription(`${perso}`)
                .setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'badge') {
        if (obj === 'titre') {
            if (args[0]) {
                var index = parseInt(args[0]);
                if (isNaN(index) || args.length > 1) return message.reply(`la commande \`${prefix}${commandName} ${obj}\` prend un argument qui correspond au numéro du titre choisi dans la liste.\n\`${prefix}${commandName} ${obj}\` pour voir tous les titres débloqués.`);
                var newBadges = await Badge.findOne({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                if (!newBadges) return message.reply(`aucune donnée n'a été trouvée.`);     
                for (i = 0; i < newBadges.allTitles.length; i++) {
                    if (index === i + 1) var newTitle = newBadges.allTitles[i];
                }
                if (!newTitle) return message.reply(`titre introuvable.`);
                var update = await Badge.findOneAndUpdate({
                    userID: message.author.id,
                    serverID: message.guild.id
                    }, {
                        $set: { title: newTitle }
                    });
                return message.reply(`le titre **${newTitle}** a bien été sélectionné sur le passeport.`);
            }
            else {
                var newBadges = await Badge.findOne({
                    userID: message.author.id,
                    serverID: message.guild.id
                });
                if (!newBadges) return message.reply(`aucune donnée n'a été trouvée.`);
                if (newBadges.allTitles.length === 0) return message.reply(`aucun titre n'a été débloqué.`);
                const newTitre = new Array();
                for (i = 0; i < newBadges.allTitles.length; i++) {
                    newTitre[i] = `**${i + 1}.** ${newBadges.allTitles[i]}`;
                }
                const newTitles = newTitre.join('\n');
                let newEmbed = new Discord.MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`Titres débloqués de ${message.author.username}`)
                .setDescription(`\`${prefix}${commandName} ${obj} <N° du titre>\` pour l'ajouter au passeport.`)
                .addField(`\u200b`, `${newTitles}`)
                .setFooter(`Bot par Marie#1702`)
                return message.channel.send(newEmbed);
            }
        }
        else if (obj === 'help') {
            let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`🏆 ${prefix}${commandName}`)
            newEmbed.addFields(
                { name: `**Afficher ses propres badges :**`, value: `\`${prefix}${commandName}\``},
                { name: `**Afficher les badges d'un autre membre :**`, value: `\`${prefix}${commandName} <Membre>\``},
                { name: `**Afficher tous ses titres débloqués :**`, value: `\`${prefix}${commandName} titre\``},
                { name: `**Choisir un titre à afficher dans le passeport :**`, value: `\`${prefix}${commandName} titre <N° du titre>\``}
                )
            .setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
        }
        else {
            if (args.length > 0) return message.reply(`la commande \`${prefix}${commandName}\` n'est pas correctement utilisée.\n\`${prefix}${commandName} help\` pour plus d'informations sur la commande.`);
            var taggedUser = message.mentions.users.first() || message.author;
            if (obj && taggedUser === message.author) {
                if (obj.length < 4) {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username === `${obj.toLowerCase()}`) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
                if (obj.length > 3 || taggedUser === 'undefined') {
                    for (i = 0; i < usersList.length; i++) {
                        var taggedUser = 'undefined';
                        if (usersList[i].username.includes(`${obj.toLowerCase()}`)) { var taggedUser = client.users.cache.get(usersList[i].userID); break; }
                    }
                }
            }
            if (obj && message.mentions.users.first() === message.author) var taggedUser = message.author;
            if (obj && (taggedUser === 'undefined' || !taggedUser)) return message.reply(`utilisateur inconnu.\n\`${prefix}${commandName} <Membre>\` pour afficher le PNJ d'un.e autre membre.`);
            var newBadges = await Badge.findOne({
                userID: taggedUser.id,
                serverID: message.guild.id
            });
            if (!newBadges && taggedUser === message.author) return message.reply(`aucune donnée n'a été trouvée.\n\`${prefix}${commandName} create <Objet>,<Objet>\` pour créer une liste de crafts.`);
            if (!newBadges && taggedUser != message.author) return message.reply(`aucune donnée n'a été trouvée pour cet utilisateur.`);
            var activity = `🔴🔴🔴🔴🔴🔴🔴`;
            var hotel = `🔴🔴🔴🔴🔴`;
            var divert = `🔴🔴🔴🔴🔴🔴`;
            var damidot = `🔴🔴`;
            var second = `🔴🔴🔴🔴`;
            if (newBadges.badgeMsg > 0 && newBadges.badgeMsg < 10) var activity = `🟢🔴🔴🔴🔴🔴🔴`;
            else if (newBadges.badgeMsg > 9 && newBadges.badgeMsg < 50) var activity = `🟢🟢🔴🔴🔴🔴🔴`;
            else if (newBadges.badgeMsg > 49 && newBadges.badgeMsg < 100) var activity = `🟢🟢🟢🔴🔴🔴🔴`;
            else if (newBadges.badgeMsg > 99 && newBadges.badgeMsg < 200) var activity = `🟢🟢🟢🟢🔴🔴🔴`;
            else if (newBadges.badgeMsg > 199 && newBadges.badgeMsg < 500) var activity = `🟢🟢🟢🟢🟢🔴🔴`;
            else if (newBadges.badgeMsg > 499 && newBadges.badgeMsg < 1000) var activity = `🟢🟢🟢🟢🟢🟢🔴`;
            else if (newBadges.badgeMsg > 999) var activity = `🟢🟢🟢🟢🟢🟢🟢`;
            if (newBadges.badgeDodo > 0 && newBadges.badgeDodo < 5) var hotel = `🟢🔴🔴🔴🔴`;
            else if (newBadges.badgeDodo > 4 && newBadges.badgeDodo < 10) var hotel = `🟢🟢🔴🔴🔴`;
            else if (newBadges.badgeDodo > 9 && newBadges.badgeDodo < 20) var hotel = `🟢🟢🟢🔴🔴`;
            else if (newBadges.badgeDodo > 19 && newBadges.badgeDodo < 50) var hotel = `🟢🟢🟢🟢🔴`;
            else if (newBadges.badgeDodo > 49) var hotel = `🟢🟢🟢🟢🟢`;
            if (newBadges.badgeCard > 0 && newBadges.badgeCard < 10) var divert = `🟢🔴🔴🔴🔴🔴`;
            else if (newBadges.badgeCard > 9 && newBadges.badgeCard < 25) var divert = `🟢🟢🔴🔴🔴🔴`;
            else if (newBadges.badgeCard > 24 && newBadges.badgeCard < 50) var divert = `🟢🟢🟢🔴🔴🔴`;
            else if (newBadges.badgeCard > 49 && newBadges.badgeCard < 100) var divert = `🟢🟢🟢🟢🔴🔴`;
            else if (newBadges.badgeCard > 99 && newBadges.badgeCard < 200) var divert = `🟢🟢🟢🟢🟢🔴`;
            else if (newBadges.badgeCard > 199) var divert = `🟢🟢🟢🟢🟢🟢`;
            if (newBadges.badgeWish > 0 && newBadges.badgeWish < 5) var damidot = `🟢🔴`;
            else if (newBadges.badgeWish > 4) var damidot = `🟢🟢`;
            if (newBadges.badgeSearch > 0 && newBadges.badgeSearch < 5) var second = `🟢🔴🔴🔴`;
            else if (newBadges.badgeSearch > 4 && newBadges.badgeSearch < 10) var second = `🟢🟢🔴🔴`;
            else if (newBadges.badgeSearch > 9 && newBadges.badgeSearch < 15) var second = `🟢🟢🟢🔴`;
            else if (newBadges.badgeSearch > 14) var second = `🟢🟢🟢🟢`;
            let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`🏆 Badges de ${taggedUser.username}`)
            newEmbed.addFields(
                { name: `🗣️ Badge Activité`, value: `${activity}`, inline: true },
                { name: '🛍️ Badge Seconde main', value: `${second}`, inline: true },
                { name: '🎨 Badge Damidot', value: `${damidot}`, inline: true },
                { name: `\u200b`, value: `\u200b`, },
                { name: '🎮 Badge Divertissement', value: `${divert}`, inline: true },
                { name: '🏡 Badge Hôtellerie', value: `${hotel}`, inline: true },
                { name: `\u200b`, value: `\u200b`, inline: true }
                )
            newEmbed.setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }
    }

    else if (commandName === 'help') {
        let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Liste des commandes`)
            .setDescription(`\`${prefix}commande ${commandName}\` pour plus d'informations sur chaque commande.`);
            newEmbed.addFields(
                { name: `Exemple : \`${prefix}passeport ${commandName}\``, value: `\u200b` },
                { name: '📇 Passeport', value: `\`create\` \`reset\` \`help\``, inline: true },
                { name: '📝 Bio', value: `\`create\` \`reset\` \`help\``, inline: true },
                { name: '✈️ Dodocode', value: `\`create\` \`reset\` \`all\` \`<n° de page>\` \`help\``, inline: true },
                { name: `\u200b`, value: `\u200b` },
                { name: '👭 Codeami', value: `\`<n° de page>\` \`help\``, inline: true },
                { name: `☁️ Onirique`, value: `\`create\` \`reset\` \`<n° de page>\` \`help\``, inline: true },
                { name: '🎟️ Waitinglist', value: `\`create\` \`reset\` \`next\` \`add\` \`delete\` \`help\``, inline: true },
                { name: `\u200b`, value: `\u200b` },
                { name: '💸 Wishlist', value: `\`create\` \`reset\` \`add\` \`delete\` \`n° de page\` \`search\` \`help\``, inline: true },
                { name: '🔨 Craft', value: `\`create\` \`reset\` \`add\` \`delete\` \`n° de page\` \`search\` \`help\``, inline: true },
                { name: '🎲 Card', value: `\`leaderboard\` \`points\` \`help\``, inline: true },
                { name: `\u200b`, value: `\u200b` },
                { name: `🕴️ Pnj`, value: `\`create\` \`reset\` \`search\` \`help\``, inline: true },
                { name: `🏆 Badge`, value: `\`titre\` \`help\``, inline: true },
                { name: `\u200b`, value: `\u200b`, inline: true }
                )
            newEmbed.setFooter(`Bot par Marie#1702`);
            return message.channel.send(newEmbed);
        }
});
