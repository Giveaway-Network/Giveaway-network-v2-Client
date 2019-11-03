/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-31 18:40:30
*/
const defaults = require('defaults')
const moment = require('moment-shortformat')
class CommandThrottler {
  constructor (options) {
    var that = this
    var opts = defaults(options, {
      redis: null,
      keyMapper: function (req) {
        return that.prefixe + req.command.name + req.message.author.id
      },
      prefixe: 'cmdthr:'})
    if (opts.redis) this.setDb(opts.redis)
    this.keyMapper = opts.keyMapper
    this.prefixe = opts.prefixe
  }
  setDb (redis) {
    this.redis = redis
  }
  parallelHandle (router, next) {
    if (router.req.isCommand && router.req.command.locales.timeout) {
      var that = this
      var key = this.keyMapper(router.req)
      this.redis.ttl(key).then(function (ttl) {
        var timestamp = Date.now()
        if (ttl > 0) router.res.send('You have to wait **' + moment(timestamp + (ttl * 1000)).short(true) + '** before doing again dat command').then(function (message) { message.delete(2000) })
        else {
          that.redis.multi().set(key, null).expire(key, router.req.command.locales.timeout).exec().then(function () { next() }).catch(err => next(err))
        }
      }).catch(err => next(err))
    } else next()
  }
}
module.exports = CommandThrottler
