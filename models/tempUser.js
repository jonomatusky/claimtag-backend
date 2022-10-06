const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tempUserSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { getters: true, virtuals: true } }
)

const TempUser = mongoose.model('TempUser', tempUserSchema)

module.exports = TempUser
