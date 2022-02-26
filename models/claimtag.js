const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const base64url = require('base64url')
const { encode } = require('punycode')

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
    project: {
      type: mongoose.Types.ObjectId,
      ref: 'Project',
    },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

claimtagSchema.methods.toJSON = function () {
  const claimtag = this
  const claimtagObject = claimtag.toObject({ getters: true, virtuals: true })

  return claimtagObject
}

claimtagSchema.virtual('path').get(function () {
  return base64url(this._id, 'hex')
})

module.exports = mongoose.model('Claimtag', claimtagSchema)
