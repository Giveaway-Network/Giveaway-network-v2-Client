/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-27 13:02:19
*/

/**
 * Just load the command in the directory
 * @class CommandLoader
 */
const {join} = require('path')
const defaults = require('defaults')
const { lstatSync, readdirSync } = require('fs')
class CommandLoader {
  /**
   * Creates an instance of CommandLoader.
   * @param {string} commandDir
   * @param {any} registers
   * @memberof CommandLoader
   */
  constructor (source) {
    const isDirectory = source => lstatSync(source).isDirectory()
    const getDirectories = source =>
      readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    this.registers = getDirectories(source)
  }
  /**
   *
   *
   * @param {Fisherman} client
   * @param {any} next
   * @memberof CommandLoader
   */
  setUp (client, next) {
    var i, dir
    for (i in this.registers) {
      dir = this.registers[i]
      var cmds = require('require-all')(dir)
      if (!cmds._register) throw new Error('no register json found')
      var register = defaults(cmds._register, {key: null, description: null, name: null})
      register = client.createRegister(register.key, register.name, register.description)
      cmds._register = undefined
      for (i in cmds) {
        if (cmds[i]) register.addCommand(cmds[i])
      }
    }
    next()
  }
}
module.exports = CommandLoader
