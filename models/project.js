const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'standard' },
    name: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

projectSchema.methods.toJSON = function () {
  const project = this
  const projectObject = project.toObject({
    getters: true,
    virtuals: true,
  })

  return projectObject
}

module.exports = mongoose.model('Project', projectSchema)
