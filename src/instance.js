/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-27 15:46:15
*/

const Fisherman = require('fisherman-discord.js')
const config = require('./config.json')
const CommandLoader = require('./middlewares/CommandLoader')
const GiveawayChecker = require('./middlewares/GiveawayUpdater')
const ParallelMiddleware = require('parallel-handle-fisherman')
const BotBlocker = require('./middlewares/BotBlocker')
const CommandThrottler = require('./middlewares/CommandThrottler')
const UserMiddleware = require('./middlewares/UserProvider')
const MongoInstance = require('./middlewares/MongoDB')
const RedisInstance = require('./middlewares/Redis')
const path = require('path')

var redisMiddleware = new RedisInstance(config.redisOpts)
var mongoMiddleware = new MongoInstance(config.mongoOpts.url, config.mongoOpts.opts)
var commandLoader = new CommandLoader(path.resolve(__dirname, 'commands'))

process.argv[2] = 0
process.argv[3] = 1
config.fishermanOpts.clientOptions = {
  shardId: process.argv[2],
  shardCount: process.argv[3]
}
var bot = new Fisherman.Fisherman(config.fishermanOpts)
var parallelHandler = new ParallelMiddleware()
var userMiddleware = new UserMiddleware(config.redisOpts, config.mongoOpts)
var throttlerMiddleware = new CommandThrottler()
var botBlocker = new BotBlocker(config.redisOpts)

parallelHandler.use(throttlerMiddleware)
parallelHandler.use(botBlocker)

bot.use(commandLoader)
bot.use(redisMiddleware)
bot.use(mongoMiddleware)
bot.use(userMiddleware)
bot.use(parallelHandler)

bot.init(config.token)
bot.on('initialized', () => {
  console.log(`Init: total register: ${bot.registers.size} Total commands : ${bot.commands.size}`)
  var redis = bot.redis
  var giveawayChecker = new GiveawayChecker(redis, bot, config.redisOpts)
  throttlerMiddleware.setDb(redis)
 // giveawayChecker.start()
})
bot.on('fisherCode', (router, code, err) => {
  console.log(code, err)
  router.response.send(`FISHER CODE HANDLING code: ${code}\nMessage: ${err.message}`)
})
var register = bot.createRegister('cat')
register.textCommand('cat', {}, function (req, res) { console.log('okay') })
register.textCommand('user', {locales: {timeout: 5, blocker: {ttl: 60, maxCount: 3}}}, function (req, res) { res.send(JSON.stringify(req.user)) })
