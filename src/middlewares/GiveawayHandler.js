/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-09-02 22:33:48
*/
const Constants = require('../structure/Constants').giveawayHandler
const EventEmitter = require('events').EventEmitter
const Queue = require('bull')
const io = require('socket.io')
const eachLimit = require('async').eachLimit
class GiveawayHandler extends EventEmitter {
  constructor (socketOpts, mongoOpts, redisOpts) {
    super()
    this.mongoOpts = mongoOpts
    this.mongoose = require('mongoose')
    this.errorHandleQueue = new Queue('giveawayErrorHandle', {redis: redisOpts})
    this.errorHandleQueue.process(function (job, done) {
      console.log(job)
      done()
    })
    this.socket = io(socketOpts.url, socketOpts.opts)
    this.Guild = this.mongoose.model('guild', require('../structure/Guild'))
    this.channels = new Map()
    this.invalidChannels = []
  }
  setUp (client, next) {
    this.client = client
    this.socket.on('giveaway.new', this.handleNewGiveaway.bind(this))
    var that = this
    this.mongoose.connect(this.mongoOpts.url, Object.assign(this.mongoOpts.opts, {useMongoClient: true}), function (err) {
      if (err) return next(err)
      that.Guild.find({}).then(function (docs) {
        that.addChannels(docs)
        this.emit('channels:loaded', this.channels, this.invalidChannels)
        that.socket.emit('giveaway.invalidChannels', that.invalidChannels)
        that.invalidChannels = []
        next()
      }).catch(err => next(err))
    })
  }
  handleNewGiveaway () {
  }
  cacheAnnounceGuilds () {

  }
  fetchAnnounceGuilds () {

  }
  initializeAnnounceGuilds () {

  }
  sendAll (msg, msgOpts, callback) {
    var that = this
    var channel
    eachLimit(this.channels, Constants.eachLimit, function (item, cb) {
      channel = item[1]
      if (!channel.id) {
        that.addErrorHandle(channel, {code: Constants.unknowChannelCode})
        return cb()
      }

      channel.send(msg, msgOpts).then(function () {
        cb()
      }).catch(function (err) {
        that.addErrorHandle(channel, err)
        cb()
      })
    }, function () {
      if (callback) callback()
    })
  }
  applyAll (funct) {
    var that = this
    return new Promise(function (resolve, reject) {
      eachLimit(that.channels, Constants.eachLimit, function (item, cb) {
        funct(item[1], that.addErrorHandle, cb)
      }, function (err) {
        if (err) return reject(err)
        resolve()
      })
    })
  }
  addErrorHandle (channel, err) {
    return this.errorHandleQueue.add({id: channel.id, code: err.code})
  }
  addChannels (docs) {
    var doc, i
    for (i in docs) {
      doc = doc[i]
      if (!doc.isEnabledGiveaway) break
      if (this.client.client.channels.has(doc.id)) {
        var channel = this.client.client.channels.get(doc.id)
        channel.props = doc
        this.channels.set(doc.id, channel)
      } else this.invalidChannels.push(doc.id)
    }
  }
}
module.exports = GiveawayHandler
