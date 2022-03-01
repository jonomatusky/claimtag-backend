const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')
const Project = require('../models/project')
const { sgMail } = require('../util/sendgrid')
const { addEmailToAirtable } = require('../util/airtable')

const { SITE_URL } = process.env

const sendProjectEmail = async (req, res, next) => {
  const { user } = req
  const { pid } = req.params
  let { isSubscribed } = req.body
  const email = req.body.email || user.email

  const message = `<p>Your Claimtags are ready!<br><br><a href="${SITE_URL}/download/${pid}">Click here</a> to access and download <br><br> Sent from the <a href="${SITE_URL}">Claimtag</a> team. If you did not request this email, please ignore it.</p>`

  if (!!email) {
    try {
      addEmailToAirtable({ email, isSubscribed })
    } catch (err) {
      console.log(err)
    }

    try {
      sgMail.send({
        to: email,
        from: { email: 'hello@claimtag.io', name: 'Claimtags' },
        subject: 'Download your Claimtags',
        text: 'Your Claimtags are ready to download!',
        html: message,
      })
    } catch (err) {
      console.log(err)
      const error = new HttpError(
        'There was an error sending the email. Please try again.',
        500
      )
      return next(error)
    }
  }

  res.status(200).json({ message: 'Email sent!' })
}

exports.sendProjectEmail = sendProjectEmail
