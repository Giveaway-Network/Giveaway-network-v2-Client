/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-09-03 15:19:41
*/
class UserBlockedException extends Error {
  constructor (cmd, id) {
    super('User blocked ' + id + ' from command: ' + cmd)
    this.command = cmd
    this.id = id
  }
}
module.exports = UserBlockedException
