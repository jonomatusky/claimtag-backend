const mongoose = require('mongoose')
var admin = require('firebase-admin')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    fid: { type: String, unique: true },
    email: { type: String, unique: true },
  },
  { timestamps: true }
)

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject({ getters: true, virtuals: true })

  return userObject
}

userSchema.methods.getEmail = async function () {
  if (!!fid) {
    try {
      const { email } = await admin.auth().getUser(fid)
      return email
    } catch (err) {
      throw new Error('Unable to access authentication service')
    }
  } else {
    return this.email
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
