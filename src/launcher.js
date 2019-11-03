/* Copyright (C) MXB-SOFTWARE, Inc - All Rights Reserved
 * Written by Simon Sassi, 2017-09-02 22:51:19
*/
const Discord = require('discord.js')
const path = require('path')

const sharder = new Discord.ShardingManager(path.resolve(__dirname, 'instance.js'), {respawn: false, totalShards: 1})
sharder.on('launch', shard => console.log(`launched ${shard.id}`))
sharder.spawn(1)
