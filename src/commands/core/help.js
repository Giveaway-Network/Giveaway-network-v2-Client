/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-08-27 16:55:19
*/

var helpMessageBuilt = null
module.exports = {
  name: 'help',
  execute: function (req, res) {
    if (helpMessageBuilt) {
      res.send('', { embed: helpMessageBuilt }).catch(console.log)
      return
    }
    var embed = { title: 'Giveaway Network Help' }
    var description = ''
    var commands
    req.client.registers.forEach(function (register) {
      commands = ''
      register.forEach(function (value) {
        commands = commands + ' `' + value.name + '` '
      })
      description = description + '__' + register.name + ':__\n' + commands + '\n\n'
    })

    embed.description = description
    helpMessageBuilt = embed
    res.send('', { embed: helpMessageBuilt }).catch(console.log)
  },
  channelType: ['dm', 'text']

}
