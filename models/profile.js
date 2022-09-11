const mongoose = require('mongoose')
const Schema = mongoose.Schema

const profileSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    title: { type: String },
    company: { type: String },
    companyUrl: { type: String },
    avatar: { type: String },
    email: { type: String },
    phone: { type: String },
    linkedinUrl: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true, getters: true } }
)

module.exports = profileSchema
