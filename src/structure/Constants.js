/**
 * @typedef Constants
 * @type {Object}
 * @property
 */
var Constants = {

  /**
   * Options for giveaway updater
   * @type {object}
   */
  giveawayUpdater: {
    updateMs: 10000,
    retrieveRange: 50,
    eachLimit: 50,
    saveDelayMs: 86400000,
    custPrefixe: 'custga',
    listShardPrefixe: 'custgals',
    getPrefixeFromId: function (id) {
      return this.custPrefixe + id
    },
    getPrefixeLsFromShard: function (shardId) {
      return this.listShardPrefixe + shardId
    }
  },
  botBlocker: {
    countCmdPrefixe: 'cntcmd',
    getCountCmdPrefixe (cmd, id) {
      return this.countCmdPrefixe + cmd + id
    }
  },
  giveawayHandler: {
    unknowChannelCode: 10003,
    eachLimit: 50
  }
}
module.exports = Constants
