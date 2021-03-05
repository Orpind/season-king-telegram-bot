const { Telegraf } = require('telegraf');
const moment = require('moment');

const bot = new Telegraf(process.env.BOT_TOKEN);

let chatName = 'Default name';
let interval = null;

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
        ctx.telegram.setChatTitle(ctx.message.chat.id, `${getRandomEmoji(season)}${chatName}${getRandomEmoji(season)}`)
    }
}
bot.help((ctx) => {
    ctx.telegram.sendMessage(
        ctx.message.chat.id, 
        `
        /update - update title and avatar
        /setname "name" - set chat name
        /start - start automatic update title and avatar
        /stop - stop automatic update title and avatar
        /status - get a automatic update status
        `
    );
});

bot.command(COMMANDS.UPDATE, (ctx) => {
    changeTitle(ctx, true);
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Updated');
})

bot.command(COMMANDS.START, (ctx) => {
    const dayInMilliseconds = 1000 * 60 * 60 * 24;
    interval = setInterval(() => {
        changeTitle(ctx);
    }, dayInMilliseconds);
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Started');
})

bot.command(COMMANDS.STOP, (ctx) => {
    clearInterval(interval)
    ctx.telegram.sendMessage(ctx.message.chat.id, 'Stoped');
})

bot.command(COMMANDS.STATUS, (ctx) => {
    ctx.telegram.sendMessage(ctx.message.chat.id, interval ? "Enabled": "Disabled");
})

bot.command(COMMANDS.SETNAME, (ctx) => {
    const [,name] = ctx.message.text.match(/"(.*?)"/);
    chatName = name;
    ctx.telegram.sendMessage(ctx.message.chat.id, `Identified like a "${chatName}"`);
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))