const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const uniqueValidator = require('mongoose-unique-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
var admin = require('firebase-admin')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    fid: { type: String, unique: true },
    maxClaimtags: { type: Number, default: 100 },
  },
  { timestamps: true }
)

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject({ getters: true, virtuals: true })

  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1 day' }
  )

  const expiresAt = jwt.decode(token).exp * 1000

  user.tokens = user.tokens.concat({ token, expiresAt })
  await user.save()
  return token
}

userSchema.methods.generatePasswordReset = async function () {
  const user = this
  const token = crypto.randomBytes(20).toString('hex')
  user.passwordResetToken = token
  user.passwordResetExpires = Date.now() + 3600000
  await user.save()
  return token
}

userSchema.statics.findByCredentials = async ({
  email,
  username,
  password,
}) => {
  const query = {}
  if (email) {
    query.email = email
  }

  if (username) {
    query.username = username
  }

  console.log(query)

  const user = await User.findOne(query).select('+password')

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10)
  }

  if (user.isModified('passwordResetToken') && !!user.passwordResetToken) {
    user.passwordResetToken = await bcrypt.hash(user.passwordResetToken, 10)
  }

  next()
})

userSchema.virtual('avatarLink').get(function () {
  let re =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  if (this.avatar) {
    if (re.exec(this.avatar)) {
      return this.avatar
    } else {
      return `${ASSET_URL}/${this.avatar}`
    }
  } else {
    return
  }
})

userSchema.virtual('pieceLimit').get(function () {
  if (!!this.pieceLimitOverride) {
    return this.pieceLimitOverride
  } else if (!!this.admin) {
    return 10000
  } else if (!!this.tier) {
    return tiers[this.tier].pieceLimit
  } else {
    return 1
  }
})

userSchema.virtual('scanLimit').get(function () {
  if (!!this.scanLimitOverride) {
    return this.scanLimitOverride
  } else if (!!this.admin) {
    return 50000
  } else if (!!this.tier) {
    return tiers[this.tier].scanLimit
  } else {
    return 10
  }
})

userSchema.plugin(uniqueValidator)

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
