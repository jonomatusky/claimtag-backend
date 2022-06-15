const HttpError = require('../models/http-error')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const create = async (req, res, next) => {
  const { name, company, email, phone, message } = req.body

  const html = `
  <p>Someone submitted the contact form at Claimtag.io</p>
  <br>

  Name: ${name}<br>
  Email: ${email}<br>
  Outlet: ${company}<br>
  Phone: ${phone}<br>
  Message: ${message}<br> 
  <br> 
  Reply direct to this email to respond.

  </p>`

  if (!!email) {
    try {
      await sgMail.send({
        to: 'hello@claimtag.io',
        from: { email: 'contact@claimtag.io', name: 'Claimtags' },
        reply_to: { email },
        subject: 'IMPORTANT: New Contact Form Submission at Claimtag.io',
        text: `Someone submitted the contact form at Claimtag.io`,
        html,
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

  res.status(200).json({ message: 'Inquiry sent!' })
}

exports.create = create
