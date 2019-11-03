/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-27 20:48:06
*/
// https://stackoverflow.com/questions/45917937/xregexp-javascript-optional-named-group-seperated-by-white-spaces/45918422#45918422
// https://regex101.com/r/lmOKvH/2 https://regex101.com/r/lmOKvH/1
const XRegExp = require('xregexp')
const GiveawayObject = require('../../structure/GiveawayObject')
const Constants = require('../../structure/Constants')
const moment = require('moment-shortformat')
const parser = require('parse-duration')
const pattern = XRegExp('d(?:uration)?:(?<time>.*?)\s*t(?:itle)?:(?<title>.*?)\s*(?:p(?:rize)?:(?<prize>.*?))?\s*(?:s(?:ecret)?:(?<secret>.*?))?\s*$')
module.exports = {
  name: 'giveaway',
  execute: function (req, res) {
    var result = XRegExp.exec(req.command.suffixe, pattern)
    var timestamp = parser(result.time)
    if (timestamp) {
      var embed = {}
      var currentTime = Date.now()
      embed.title = result.title
      embed.description = moment(currentTime + timestamp).short()
      res.send('', {embed: embed}).then(message => {
        var giveaway = new GiveawayObject({
          startedDate: currentTime,
          expireDate: currentTime + timestamp,
          duration: timestamp,
          id: message.id,
          channelId: req.channel.id,
          serverId: req.channel.guild.id,
          creator: req.message.author.id,
          title: result.title,
          prize: result.prize,
          secret: result.secret,
          isEncrypted: false
        })
        var key = Constants.giveawayUpdater.getPrefixeFromId(giveaway.id)
        var expireAt = Math.round((currentTime + timestamp + Constants.giveawayUpdater.saveDelayMs) / 1000) // convert it in seconds
        req.client.redis.multi().hmset(key, giveaway).expireat(key, expireAt).lpush(Constants.giveawayUpdater.getPrefixeLsFromShard(req.client.client.shard.id), key).exec().then(() => {
          message.react('🎁').catch()
        }).catch(err => res.sendCode(503, err))
      }).catch()
    } else {
      res.send('Invalid time parse')
    }
  },
  channelType: 'text',
  patternCallback: {
    test: function (suffixe, validate) {
      validate(XRegExp.test(suffixe, pattern))
    }
  }

}
