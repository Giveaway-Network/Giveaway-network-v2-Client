/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-09-03 14:08:21
*/
const Constants = require('../structure/Constants')
const Redis = require('ioredis')
const UserBlockedEception = require('./exceptions/UserBlockedException')
class BotBlocker {
  /**
   * Creates an instance of BotBlocker.
   * @param  redisOpts The redis options
   * @memberof BotBlocker
   */
  constructor (redisOpts) {
    this.redis = new Redis(redisOpts)
  }
  parallelHandle (router, next) {
    if (router.req.isCommand && router.req.command.locales.blocker) this.block(router.req, router.res, next)
    else next()
  }
  block (req, res, next) {
    var that = this
    var key = Constants.botBlocker.getCountCmdPrefixe(req.command.name, req.message.author.id)
    var opts = req.command.locales.blocker
    this.redis.get(key, function (err, result) {
      if (result) {
        var count = parseInt(result)
        if (count > opts.maxCount) that.redis.persist(key).then(function () { next(new UserBlockedEception(req.command.name, req.message.author.id)) }).catch(err => next(err))
        else that.redis.incr(key, function (err) { next(err) })
      } else {
        if (err) next(err)
        else that.redis.multi().set(key, 1).expire(key, opts.ttl).exec(function (err) { next(err) })
      }
    })
  }
}
module.exports = BotBlocker
