const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');
const { prefix, token } = require('./config.js');
const Data = require('./models/id');
const Dodo = require ('./models/dodo');
const Wlist = require ('./models/wlist');
const Wishlist = require('./models/wishlist');
const Craft = require('./models/craft');

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

            if (why[1] === " ") return message.reply(`la raison doit contenir au moins une lettre.`);
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
                    raison: why[1],
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
            if (args.length === 1) return message.reply(`la commande \`${prefix}create ${object}\` prend au moins un argument.\n\`${prefix}create ${object} <@Membre> <@Membre> <@Membre>\``)
            if (args.length > 1) {
                var number = 0;
                for (i = 1; i < args.length + 1; i++) {
                    if (!getUserFromMention(args[i])) break;
                    var number = i;
                }
                if (number === 0) return message.reply(`utilisateur introuvable.\nPour créer une liste d'attente : \`${prefix}create ${object} <@Membre> <@Membre> <@Membre>\``);
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
                message.reply(`les données ont bien été mises à jour.\n\`${prefix}${object}\` pour voir ta liste d'attente.\n\`${prefix}reset ${object}\` pour supprimer ta liste d'attente.\n\`${prefix}next\` pour passer à la personne suivante.`);
        
                const slice = message.content.slice(prefix.length).split(/ +/);
                slice.splice(0, 2);

                for (i = 0; i < number; i++) {
                    const user = client.users.cache.get(getUserFromMention(slice[i]));
                    if (!user) break;
                    const update = await Wlist.findOneAndUpdate({
                        userID: message.author.id,
                        serverID: message.guild.id
                    }, {
                        $push: { users: getUserFromMention(slice[i]) }
                    });
                }
                
                const toto = await Wlist.findOne({
                    userID: message.author.id,
                    serverID: message.guild.id
                });

                const newDodo = await Dodo.findOne({
                    userID: message.author.id,
                    serverID: message.guild.id
                });

                let newEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle(`Liste d'attente de ${message.author.username}`)
                if (newDodo) newEmbed.setDescription(`${newDodo.dodocode}`)
                for (i = 1; i < args.length; i++) {
                    const user = client.users.cache.get(getUserFromMention(args[i]));
                    if (!user) break;
                    newEmbed.addField(`ac!next`, `**${i}.** ${user.username}`);
                }
                newEmbed.setFooter('Bot par Marie#1702');
    
                message.channel.send(newEmbed);
                return message.channel.send(`${slice[0]}, à ton tour !`);
            }
    }

        else if (object === 'wishlist') {
            if (args.length === 1) return message.reply(`la commande \`${prefix}create ${object}\` prend au moins un argument. S'il y en a plusieurs, ils doivent être séparés par une virgule.\nExemple : \`${prefix}create ${object} <Objet>,<Objet>,<Objet>\``)
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');

            const del = await Wishlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${object}\` pour voir ta wishlist.\n\`${prefix}reset ${object}\` pour supprimer ta wishlist.\n\`${prefix}wishdelete <Numéro> <Numéro>\` pour supprimer des objets.\n\`${prefix}wishadd <Objet>,<Objet>\` pour ajouter des objets.`)
            
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
        else if (object === 'craft') {
            if (args.length === 1) return message.reply(`la commande \`${prefix}create ${object}\` prend au moins un argument. S'il y en a plusieurs, ils doivent être séparés par une virgule.\nExemple : \`${prefix}create ${object} <Objet>,<Objet>,<Objet>\``)
            const parse = message.content.slice(prefix.length).split(/ +/);
            parse.splice(0, 2);
            const str = parse.join(' ');
            const wish = str.split(',');

            const del = await Craft.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
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
            message.reply(`les données ont bien été mises à jour.\n\`${prefix}${object}\` pour voir ta liste de crafts en double.\n\`${prefix}reset ${object}\` pour supprimer ta liste.\n\`${prefix}craftdelete <Numéro> <Numéro>\` pour supprimer des crafts.\n\`${prefix}craftadd <Objet>,<Objet>\` pour ajouter des crafts.`)
            
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
        else {
            message.reply(`la commande \`${prefix}create\` sert à créer un passeport, un dodocode, une liste d'attente, une wishlist, ou une liste de crafts.\n\`${prefix}help create\` pour plus d'infos.`);
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
        else if (object === 'wishlist') {
            const del = await Wishlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply(`aucune wishlist n\'a été trouvée.`);
            return message.reply(`ta wishlist a bien été effacée.`);
        }
        else if (object === 'craft') {
            const del = await Craft.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            })
            if (!del) return message.reply(`aucune liste de crafts n\'a été trouvée.`);
            return message.reply(`ta liste de crafts a bien été effacée.`);
        }
        if (!args.length) return message.reply(`la commande \`${prefix}${commandName}\` sert à effacer un passeport, un dodocode, une liste d'attente, une wishlist et une liste de crafts.\n\`${prefix}help reset\` pour plus d'infos.`);
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
            if (!newData) return message.reply(`aucun code ami n'a été trouvé pour ${taggedUser.username}.`);

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
            newEmbed.addField(`ac!next`, `**${i + 1}.** ${user.username}`);
        }
    
    newEmbed.setFooter('Bot par Marie#1702');

    return message.channel.send(newEmbed);
}

    else if (message.content.startsWith(prefix) && (commandName === 'next')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour passer à la personne suivente dans sa propre liste d'attente : \`${prefix}${commandName}\`\nPour passer à la personne suivante dans la liste d'attente de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Vérifiez que vous avez bien mentionné la personne.`);
        const newWlist = await Wlist.findOne({
            userID: taggedUser.id,
			serverID: message.guild.id
        });
        if (!newWlist) return message.reply(`aucune donnée n\'a été trouvée. Pour créer une liste d'attente :\n\`${prefix}create waitinglist <@Membre> <@Membre> <@Membre>\``);

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
        if (newOne.number === 0) {
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
            newEmbed.addField(`ac!next`, `**${i + 1}.** ${user.username}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');

        message.channel.send(newEmbed);

        var user = client.users.cache.get(newOne.users[0]);
        return message.channel.send(`${user}, à ton tour !`);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'wishlist')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher sa propre wishlist : \`${prefix}${commandName}\`\nPour afficher la wishlist de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher la wishlist d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
        const newWishlist = await Wishlist.findOne({
            userID: taggedUser.id,
            serverID: message.guild.id
        });
        if (!newWishlist) return message.reply(`aucune wishlist n'a été trouvée pour ${taggedUser.username}.`);

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

    else if (message.content.startsWith(prefix) && (commandName === 'add')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour ajouter des membres à sa liste d'attente : \`${prefix}${commandName} <@Membre> <@Membre>\``);
        var number = 0;
        for (i = 0; i < args.length; i++) {
            if (!getUserFromMention(args[i])) break;
            number++;
        }
        if (number === 0) return message.reply(`utilisateur introuvable.\nPour ajouter des membres à sa liste d'attente : \`${prefix}${commandName} <@Membre> <@Membre>\``);
        
        const newWlist = await Wlist.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        if (!newWlist) return message.reply(`aucune donnée n'a été trouvée. Pour créer une liste d'attente :\n\`${prefix}create waitinglist <@Membre> <@Membre>\``);
    
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
            newEmbed.addField(`ac!next`, `**${i + 1}.** ${user.username}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'delete')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour supprimer des membres de sa liste d'attente : \`${prefix}${commandName} <@Membre> <@Membre>\``);
        var number = 0;
        for (i = 0; i < args.length; i++) {
            if (!getUserFromMention(args[i])) break;
            number++;
        }
        if (number === 0) return message.reply(`utilisateur introuvable.\nPour ajouter des membres à sa liste d'attente : \`${prefix}${commandName} <@Membre> <@Membre>\``);
        
        const newWlist = await Wlist.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        if (!newWlist) return message.reply(`aucune donnée n'a été trouvée. Pour créer une liste d'attente :\n\`${prefix}create waitinglist <@Membre> <@Membre>\``);
        
        for (i = 1; i < args.length; i++) {
            if (args[0] === args[i]) {
                args.splice(i, 1);
            }
        }
        
        var temp = args.length * -1;
        for (i = 0; i < args.length; i++) {
            for (j = 0; j < newWlist.users.length; j++) {
                if (getUserFromMention(args[i]) === newWlist.users[j]) temp++;
            }
        }
        if (temp === -1) temp = 0;
        number = number + temp;

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
        if (newOne.number === 0) {
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
            newEmbed.addField(`ac!next`, `**${i + 1}.** ${user.username}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'craft')) {
        if (args.length > 1) return message.reply(`la commande \`${prefix}${commandName}\` prend 0 ou 1 argument.\nPour afficher sa propre liste de crafts : \`${prefix}${commandName}\`\nPour afficher la liste de crafts de quelqu'un d'autre : \`${prefix}${commandName} <@Membre>\``);
        const taggedUser = message.mentions.users.first() || message.author;

        if (args.length === 1 && taggedUser === message.author && message.author != message.mentions.users.first()) return message.reply(`utilisateur inconnu. Pour afficher la liste de crafts d'un.e autre membre :\n\`${prefix}${commandName} <@Membre>\``);
        const newCraft = await Craft.findOne({
            userID: taggedUser.id,
            serverID: message.guild.id
        });
        if (!newCraft) return message.reply(`aucune liste de crafts n'a été trouvée pour ${taggedUser.username}.`);

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

    else if (message.content.startsWith(prefix) && (commandName === 'wishadd')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour ajouter des objets à sa wishlist : \`${prefix}${commandName} <Objet>,<Objet>,<Objet>\``);
        const newWishlist = await Wishlist.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        if (!newWishlist) return message.reply(`aucune donnée n'a été trouvée. Pour créer une wishlist :\n\`${prefix}create wishlist <Objet>,<Objet>,<Objet>\``);
    
        const parse = message.content.slice(prefix.length).split(/ +/);
        parse.splice(0, 1);
        const str = parse.join(' ');
        const wish = str.split(',');
        
        for (i = 0; i < wish.length; i++) {
            const update = await Wishlist.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $push: { list: wish[i] },
                    $set: { number: newWishlist.number + wish.length }
                })
        }
        message.channel.send(`Les données ont bien été mises à jour.`);

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

    else if (message.content.startsWith(prefix) && (commandName === 'wishdel' || commandName === 'wishdelete')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour supprimer des objets de sa wishlist : \`${prefix}${commandName} <Numéro> <Numéro> <Numéro>\``);
        const newWishlist = await Wishlist.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        if (!newWishlist) return message.reply(`aucune donnée n'a été trouvée. Pour créer une wishlist :\n\`${prefix}create wishlist <Objet>,<Objet>,<Objet>\``);

        for (i = 0; i < args.length; i++) {
            if (isNaN(parseInt(args[i], 10))) return message.reply(`un ou plusieurs arguments sont erronés. Tous les arguments doivent être des numéros correspondant à la place de l'objet dans la wishlist.`);
            if (parseInt(args[i], 10) > newWishlist.number) return message.reply(`un ou plusieurs arguments sont erronés. Vérifiez que vous ne tentez pas d'effacer un objet qui n'existe pas.`);
        }
        if (args.length > newWishlist.number) return message.channel.send (`Erreur : il y a plus d'arguments que d'objets dans la wishlist.`);
        
        for (i = 0; i < args.length; i++) {
            var num = parseInt(args[i] - 1, 10);
            var str = newWishlist.list[num];
            const update = await Wishlist.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $pull: { list: str },
                    $set: { number: newWishlist.number - args.length }
                })
        }
        message.channel.send(`Les données ont bien été mises à jour.`);

        const newOne = await Wishlist.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        const newData = await Data.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })

        if (newOne.number < 1) {
            const del = await Wishlist.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
            return message.reply(`la wishlist est vide. Elle a donc été effacée.`);
        }

        const list = newOne.list;
        let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Wishlist de ${message.author.username}`)
        if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
        for (i = 0; i < newOne.number; i++) {
            newEmbed.addField(`\u200b`, `**${i + 1}.** ${list[i]}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'craftadd')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour ajouter des objets à sa liste de crafts : \`${prefix}${commandName} <Objet>,<Objet>,<Objet>\``);
        const newCraft = await Craft.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        });
        if (!newCraft) return message.reply(`aucune donnée n'a été trouvée. Pour créer une liste de crafts :\n\`${prefix}create craft <Objet>,<Objet>,<Objet>\``);
    
        const parse = message.content.slice(prefix.length).split(/ +/);
        parse.splice(0, 1);
        const str = parse.join(' ');
        const wish = str.split(',');
        
        for (i = 0; i < wish.length; i++) {
            const update = await Craft.findOneAndUpdate({
                userID: message.author.id,
                serverID: message.guild.id
                }, {
                    $push: { list: wish[i] },
                    $set: { number: newCraft.number + wish.length }
                })
        }
        message.channel.send(`Les données ont bien été mises à jour.`);

        const newOne = await Craft.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        const newData = await Data.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })

        const list = newOne.list;
        let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Liste de crafts de ${message.author.username}`)
        if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
        for (i = 0; i < newOne.number; i++) {
            newEmbed.addField(`\u200b`, `**${i + 1}.** ${list[i]}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
    }

    else if (message.content.startsWith(prefix) && (commandName === 'craftdel' || commandName === 'craftdelete')) {
        if (args.length < 1) return message.reply(`la commande \`${prefix}${commandName}\` prend au moins un argument.\nPour supprimer des objets de sa liste de crafts : \`${prefix}${commandName} <Numéro> <Numéro> <Numéro>\``);
        const newCraft = await Craft.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        if (!newCraft) return message.reply(`aucune donnée n'a été trouvée. Pour créer une liste de crafts :\n\`${prefix}create craft <Objet>,<Objet>,<Objet>\``);

        for (i = 0; i < args.length; i++) {
            if (isNaN(parseInt(args[i], 10))) return message.reply(`un ou plusieurs arguments sont erronés. Tous les arguments doivent être des numéros correspondant à la place de l'objet dans la liste de crafts.`);
            if (parseInt(args[i], 10) > newCraft.number) return message.reply(`un ou plusieurs arguments sont erronés. Vérifiez que vous ne tentez pas d'effacer un objet qui n'existe pas.`);
        }
        if (args.length > newCraft.number) return message.channel.send (`Erreur : il y a plus d'arguments que d'objets dans la liste de crafts.`);

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
        message.channel.send(`Les données ont bien été mises à jour.`);

        const newOne = await Craft.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })
        const newData = await Data.findOne({
            userID: message.author.id,
            serverID: message.guild.id
        })

        if (newOne.number < 1) {
            const del = await Data.findOneAndDelete({
                userID: message.author.id,
                serverID: message.guild.id
            });
            return message.reply(`la wishlist est vide. Elle a donc été effacée.`);
        }

        const list = newOne.list;
        let newEmbed = new Discord.MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`Liste de crafts de ${message.author.username}`)
        if (newData) newEmbed.setDescription(`Sur ${newData.ile}`);
        for (i = 0; i < newOne.number; i++) {
            newEmbed.addField(`\u200b`, `**${i + 1}.** ${list[i]}`);
        }
        newEmbed.setFooter('Bot par Marie#1702');
        return message.channel.send(newEmbed);
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