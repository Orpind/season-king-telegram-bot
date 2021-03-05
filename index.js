const { Telegraf } = require('telegraf');
const moment = require('moment');

const bot = new Telegraf(process.env.BOT_TOKEN);

let chatName = {
    default: 'Default name'
};

let interval = {};

const COMMANDS = {
    START: 'start',
    STOP: 'stop',
    UPDATE: 'update',
    SETNAME: 'setname',
    STATUS: 'status'
};

const EMOJI = {
    SUMMER: ['☀️', '🌴', '🍃', '🌊', '🍉',],
    AUTUMN: ['☂️', '🍁', '🍂', '🌻', '🍄'],
    WINTER: ['🌨', '❄️', '☃️', '⛄️', '🎄'],
    SPRING: ['🌼', '🌺', '🌿', '🌷', '☀️']
}

const SEASONS = {
    SUMMER: 'SUMMER',
    AUTUMN: 'AUTUMN',
    WINTER: 'WINTER',
    SPRING: 'SPRING'
}

const helpMsg = `Commands list:
/help - List of all commands
/update - Update title and avatar
/setname "name" - Set chat name
/start - Start automatic update title and avatar
/stop - Stop automatic update title and avatar
/status - Get a automatic update status
`;

function getSeason() {
    const date = moment();

    const month = date.get('month');

    let season = '';

    switch(month){
        case 11:
        case 0:
        case 1:
            season = SEASONS.WINTER;
            break;
        case 2:
        case 3:
        case 4:
            season = SEASONS.SPRING;
            break;
        case 5:
        case 6:
        case 7:
            season = SEASONS.SUMMER;
            break;
        case 8:
        case 9:
        case 10:
            season = SEASONS.AUTUMN;
            break;
    }
    
    return {hit: date.get('date') === 1, season}
}

function getRandomEmoji(season) {
    const random = Math.floor(Math.random() * Math.floor(EMOJI[season].length))
    return EMOJI[season][random];
}

function changeTitle(ctx, forse){
    const {season, hit} = getSeason();

    if (forse || hit) {
        ctx.telegram.setChatTitle(ctx.message.chat.id, `${getRandomEmoji(season)}${chatName[ctx.message.chat.id] || changeTitle.default}${getRandomEmoji(season)}`)
    }
}

bot.telegram.setMyCommands([
    {command: "update", description:"Update title and avatar"},
    {command: "help", description:"List of all commands"},
    {command: "setname", description:"Set chat name"},
    {command: "start", description:"Start automatic update title and avatar"},
    {command: "stop", description:"Stop automatic update title and avatar"},
    {command: "status", description:"Get a automatic update status"},
])

bot.help((ctx) => {
    ctx.reply(helpMsg);
});

bot.command(COMMANDS.UPDATE, (ctx) => {
    changeTitle(ctx, true);
    ctx.reply('Updated');
})

bot.command(COMMANDS.START, (ctx) => {
    const dayInMilliseconds = 1000 * 60 * 60 * 24;
    interval[ctx.message.chat.id] = setInterval(() => {
        changeTitle(ctx, true);
    }, dayInMilliseconds);
    ctx.reply('Started');
})

bot.command(COMMANDS.STOP, (ctx) => {
    clearInterval(interval[ctx.message.chat.id])
    ctx.reply('Stoped');
})

bot.command(COMMANDS.STATUS, (ctx) => {
    ctx.reply(interval[ctx.message.chat.id] ? "Enabled": "Disabled");
})

bot.command(COMMANDS.SETNAME, (ctx) => {
    const [,name] = ctx.message.text.match(/"(.*?)"/);
    chatName[ctx.message.chat.id] = name;
    ctx.reply(`Identified like a "${name}"`);
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))