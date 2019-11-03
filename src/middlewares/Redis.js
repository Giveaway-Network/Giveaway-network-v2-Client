/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-27 20:48:21
*/
const Redis = require('ioredis')
class RedisInstance {
  constructor (options) {
    this.options = options
    this.redis = null
  }
  getDataBase () {
    return this.redis
  }
  setUp (client, next) {
    this.redis = new Redis(this.options)
    client.redis = this.redis
    next()
  }
}
module.exports = RedisInstance
