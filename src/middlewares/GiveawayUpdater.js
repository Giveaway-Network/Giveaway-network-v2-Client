/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-29 22:07:26
*/
var Queue = require('bull')
const { eachLimit } = require('async')
const Constants = require('../structure/Constants')
const moment = require('moment-shortformat')

class GiveawayUpdater {
  constructor (redis, client, redisOpts) {
    this.redis = redis
    this.client = client
    this.finishedQueue = new Queue('FinishedGiveaway', {redis: redisOpts})
    var that = this
    this.finishedQueue.process(function (job, done) {
      var key = Constants.giveawayUpdater.getPrefixeFromId(job.id)
      that.redis.multi().del(key).lrem(Constants.giveawayUpdater.getPrefixeLsFromShard(that.client.shard.id), key).exec().then(function () { done() }).catch(function (err) { done(err) })
    })
  }
  start () {
    this.update()
  }
  update () {
    var that = this
    this.redis.llen(Constants.giveawayUpdater.getPrefixeLsFromShard(this.client.shard.id)).then(count => {
      var ranges = that.buildRanges(count)
      console.log('====')
      eachLimit(ranges, Constants.giveawayUpdater.eachLimit, function (range, callback) {
        that.fetchGiveaways(range.from, range.to).then(function (results) {
          var promises = []
          console.log('Updating: ' + Date.now())
          for (var i in results) {
            var giveaway = results[i]
            var expire = Number(giveaway.expireDate)
            var embed = {}
            if (expire > Date.now()) {
              embed = {
                title: giveaway.title,
                description: moment(Number(giveaway.expireDate)).short()
              }
            } else {
              embed = {
                title: giveaway.title,
                description: 'Finished m8'
              }
              that.finishedQueue.add(giveaway, {jobId: giveaway.id}) // PROMISE UNHANDLED HERE})
            }
            promises.push(that.client.client.rest.makeRequest('patch', '/channels/' + giveaway.channelId + '/messages/' + giveaway.id, true, { embed: embed }))
          }
          Promise.all(promises).then(() => callback()).catch(err => callback(err))
        }).catch(err => callback(err))
      }, function (err) {
        console.log(err)
        setTimeout(that.update.bind(that), Constants.giveawayUpdater.updateMs)
      })
    })
  }
 /* update () {
    var that = this

    that.fetchGiveaways(0, 500).then(function (results) {
      eachLimit(results, 70, function (giveaway, callback) {
        var embed = {
          title: giveaway.title,
          description: moment(Number(giveaway.expireDate)).short()
        }
        that.client.client.rest.makeRequest('patch', '/channels/' + giveaway.channelId + '/messages/' + giveaway.id, true, { embed: embed }).then(() => callback())
      }, function (err) {
        console.log(err)
        setTimeout(that.update.bind(that), Constants.giveawayCustUpdateMs)
      })
    })
  } */
  fetchGiveaways (start, stop) {
    var that = this
    return new Promise(function (resolve, reject) {
      that.redis.lrange(Constants.giveawayUpdater.getPrefixeLsFromShard(that.client.shard.id), start, stop).then(function (results) {
        var promises = []
        for (var i in results) {
          var current = results[i]
          promises.push(new Promise(function (resolve, reject) {
            that.redis.hgetall(current).then(result => resolve(result)).catch(err => reject(err))
          }))
        }
        Promise.all(promises).then(results => resolve(results)).catch(err => reject(err))
      })
    })
  }
  buildRanges (count) {
    var retrieveRange = Constants.giveawayUpdater.retrieveRange
    if (count > retrieveRange) {
      var ranges = []
      var lastRange = 0
      for (var i = 1; count > retrieveRange; i++) {
        ranges.push({from: lastRange, to: retrieveRange * i})
        lastRange = retrieveRange * i
        count = count - retrieveRange
      }

      ranges.push({from: lastRange, to: count + lastRange})
      return ranges
    } else {
      return [{from: 0, to: count}]
    }
  }
}
module.exports = GiveawayUpdater
