const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

const claimtagSchema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error('Url is invalid')
        }
      },
    },
    collection: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Claimtag',
    },
    owner: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

claimtagSchema.methods.toJSON = function () {
  const claimtag = this
  const claimtagObject = claimtag.toObject({ getters: true, virtuals: true })

  return claimtagObject
}

module.exports = mongoose.model('Claimtag', claimtagSchema)
