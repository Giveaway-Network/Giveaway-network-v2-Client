/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-09-03 19:35:50
*/
var {Schema} = require('mongoose')
var guild = new Schema({
  id: {type: String, index: true},
  channelGiveaway: {type: String, default: null},
  isEnabledGiveaway: {type: Boolean, default: false},
  deleteMessages: {type: Boolean, default: true},
  mentionType: {type: Number, default: 0},
  language: {type: String, default: 'en'},
  isMaster: {type: Boolean, default: false}
})
guild.statics.getGuild = function (id, cb) {
  return this.findOne({id: id}, cb)
}
module.exports = guild
