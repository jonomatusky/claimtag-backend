const mongoose = require('mongoose')
const Schema = mongoose.Schema

const collectionSchema = new Schema(
  {
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    name: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

collectionSchema.methods.toJSON = function () {
  const collection = this
  const collectionObject = collection.toObject({
    getters: true,
    virtuals: true,
  })

  return collectionObject
}

module.exports = mongoose.model('Collection', collectionSchema)
