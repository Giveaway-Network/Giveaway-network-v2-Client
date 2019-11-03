/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-31 17:44:00
*/
const Queue = require('bull')
class UserProvider {
  constructor (redisOpts, mongoOpts = {}) {
    var that = this
    if (mongoOpts.url) this.mongoOpts = mongoOpts
    this.mongoose = require('mongoose')
    this.queue = new Queue('newUser', {redis: redisOpts})
    this.updateQueue = new Queue('updateUser', {redis: redisOpts})
    this.updateQueue.client.on('error', (err) => console.log(err))
    this.User = this.mongoose.model('user', require('../structure/User'))
    this.updateQueue.process(function (job, done) {
      that.User.collection.updateOne({id: job.id}, {$set: job.data}, function (err) {
        done(err)
      })
    })
    this.queue.process(function (job, done) {
      that.User.create(job.data, function (err) {
        done(err)
      })
    })
  }
  setUp (client, next) {
    this.client = client
    if (this.mongoOpts) {
      this.mongoose.connect(this.mongoOpts.url, Object.assign(this.mongoOpts.opts, {useMongoClient: true}), function (err) {
        next(err)
      })
    }
  }
  setDb (db) {
    this.mongoose = db
  }
  handle (req, res, next) {
    if (req.isCommand) this.fetchUser(req, res, next)
  }
  fetchUser (req, res, next) {
    var that = this
    this.User.getUser(req.message.author.id, function (err, user) {
      if (user) {
        var set = that.compareUser(user, req.message.author)
        if (set) that.updateQueue.add(set, {jobId: user.id, removeOnComplete: true, removeOnFail: true}) // PROMISE UNHANDLED HERE
        req.user = user
      } else {
        var msg = req.message
        user = new this.User({id: msg.author.id,
          username: msg.author.username,
          discriminator: msg.author.discriminator,
          avatar: msg.author.avatar})
        req.user = user
        that.queue.add(user.toObject(), {jobId: user.id, removeOnComplete: true, removeOnFail: true}) // PROMISE UNHANDLED HERE
      }
      next(err, req, res)
    })
  }
  parallelHandle (router, next) {
    if (router.req.isCommand) this.fetchUser(router.req, router.res, next)
  }
  compareUser (stored, current) {
    var set = {}
    if (stored.username !== current.username) {
      stored.username = current.username
      set.username = current.username
    }
    if (stored.discriminator !== current.discriminator) {
      stored.discriminator = current.discriminator
      set.discriminator = current.discriminator
    }
    if (stored.avatar !== current.avatar) {
      stored.avatar = current.avatar
      set.avatar = current.avatar
    }
    return Object.keys(set).length === 0 ? null : set
  }
}
module.exports = UserProvider
