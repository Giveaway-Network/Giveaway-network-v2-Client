/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-31 17:52:52
*/
var {Schema} = require('mongoose')
var user = new Schema({
  id: {type: String, index: true},
  keyClaimed: {type: Number, default: 0},
  keyDonated: {type: Number, default: 0},
  badReputation: {type: Number, default: 0},
  goodReputation: {type: Number, default: 0},
  reputation: {type: Number, default: 0},
  credits: {type: Number, default: 0},
  username: String,
  discriminator: String,
  avatar: String,
  isBanned: {type: Boolean, default: false},
  isAdmin: {type: Boolean, default: false}
})

// INSTANCE METHODS

user.methods.incrkeyDonated = function (incr = 1) {
  this.keyDonated = this.keyDonated + incr
}
user.methods.incrkeyClaimed = function (incr = 1) {
  this.keyClaimed = this.keyClaimed + incr
}
user.methods.incrgoodRep = function (incr = 1) {
  this.goodReputation = this.goodReputation + incr
  this.updateRep()
}
user.methods.incrbadRep = function (incr = 1) {
  this.badReputation = this.badReputation + incr
  this.updateRep()
}
user.methods.incrCredits = function (incr = 1) {
  this.credits = this.credits + incr
}
user.methods.updateRep = function () {
  this.reputation = this.goodReputation - this.badReputation
}
user.methods.getRep = function () {
  this.updateRep()
  return this.reputation
}

// STATICS METHODS
user.statics.getUser = function (id, cb) {
  return this.findOne({id: id}, cb)
}
user.methods.getAvatarUrl = function (type = 'jpg', protocol = 'https') {
  return this.discordAvatarID && this.id ? protocol + '://cdn.discordapp.com/avatars/' + this.id + '/' + this.discordAvatarID + '.' + type + '?size=1024' : null
}
module.exports = user
