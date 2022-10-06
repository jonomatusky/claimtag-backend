const mongoose = require('mongoose')

const Schema = mongoose.Schema

const scanSchema = new Schema(
  {
    tempUser: { type: mongoose.Types.ObjectId, ref: 'TempUser' },
    claimtag: { type: mongoose.Types.ObjectId, ref: 'Claimtag' },
  },
  { timestamps: true, toJSON: { getters: true, virtuals: true } }
)

const Scan = mongoose.model('Scan', scanSchema)

module.exports = Scan
