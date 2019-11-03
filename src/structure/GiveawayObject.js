class Giveaway {
  constructor (object = {}) {
    /**
     * the message id
     * @type {string}
     */
    this.id = object.id
    /**
     * the channel id
     * @type {string}
     */
    this.channelId = object.channelId
    /**
     * the server id
     * @type {string}
     */
    this.serverId = object.serverId
    /**
     * the media url
     * @type {string}
     */
    this.media = object.media
    /**
     * the media type
     * @type {number}
     */
    this.mediaType = object.mediaType
    /**
     * the giveaway duration in ms
     * @type {number}
     */
    this.duration = object.duration
    /**
     * The timestamp expire date
     * @type {number}
     */
    this.expireDate = object.expireDate
    /**
     * The timestamp started date
     * @type {number}
     */
    this.startedDate = object.startedDate
    /**
     * The winning secret
     * @type {string}
     */
    this.secret = object.secret
    /**
     * The prize name
     * @type {string}
     */
    this.prize = object.prize
    /**
     * The giveaway title
     * @type {string}
     */
    this.title = object.title
    /**
     * The giveaway creator discord id
     * @type {string}
     */
    this.creator = object.creator
    /**
     * If the giveaway is encrypted
     * @type {boolean}
     */
    this.isEncrypted = object.isEncrypted
    /**
     * Role id to be given to the winner
     * @type {string}
     */
    this.roleID = object.roleID
  }
}
module.exports = Giveaway
