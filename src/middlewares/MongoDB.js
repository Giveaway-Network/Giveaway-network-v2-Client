/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-31 17:59:46
*/
var MongoClient = require('mongodb').MongoClient
class MongoDB {
  constructor (url, options = {}) {
    this.url = url
    this.options = options
  }
  setUp (client, next) {
    MongoClient.connect(this.url, this.options, function (err, db) {
      if (err) throw err
      client.db = db
      next(err)
    })
  }
}
module.exports = MongoDB
