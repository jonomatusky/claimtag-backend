const HttpError = require('../models/http-error')
const sgMail = require('@sendgrid/mail')
const { default: base64url } = require('base64url')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const Claimtag = require('../models/claimtag')

const { SITE_URL } = process.env

const create = async (req, res, next) => {
  const {
    userEmail,
    path,
    eventName,
    firstName,
    lastName,
    company,
    companyUrl,
    linkedinUrl,
    email,
    title,
    phone,
  } = req.body

  const html = `
  <p>You met a new contact${!!eventName && ` at ${eventName}:`}<br><br>
  <b>${firstName} ${lastName}</b><br>${!!title ? title + '<br>' : ''}${
    !!company
      ? `<i>${company}</i>${
          !!companyUrl
            ? ` (<a href="${companyUrl}" target="_blank">visit site</a>)`
            : ''
        } <br>`
      : ''
  }<br>
  ${!!email ? `Email: ${email}<br>` : ''}${!!phone ? `Phone: ${phone}<br>` : ''}
  <br>
  ${!!email ? `<a href="mailto:${email}" >Send an Email</a><br>` : ''}${
    !!linkedinUrl ? `<a href="${linkedinUrl}" >Connect on Linkedin</a><br>` : ''
  }${
    !!path
      ? `<a href="${path}" target="_blank">Add to address book</a><br>`
      : ''
  }<br>
  ${
    !!email ? `You can reply directly to this email to contact them.<br>` : ''
  }<br>
  <i>Sent via <a href="https://claimtag.io" target="_blank">Claimtags</a> powered by <a href="https://plynth.com" target="_blank">Plynth</a></i><br>

  </p>`

  const emailParams = {
    to: userEmail,
    from: {
      email: 'hello@claimtag.io',
      name: `Sharing for ${firstName} ${lastName}`,
    },
    bcc: 'contact@claimtag.io',
    subject: `Meet ${firstName} ${lastName}`,
    text: `You made a new contact`,
    html,
  }

  if (!!email) {
    emailParams.reply_to = { email }
  }

  if (!!userEmail) {
    try {
      await sgMail.send(emailParams)
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

const sendUpdateEmail = async (req, res, next) => {
  const { cid } = req.params
  let claimtag

  if (cid.length === 24) {
    claimtagId = cid
  } else {
    try {
      claimtagId = base64url.decode(cid, 'hex')
    } catch (err) {
      const error = new HttpError(
        'There was an error retreiving this claimtag. Please try again.',
        500
      )
      return next(error)
    }
  }

  try {
    claimtag = await Claimtag.findById(claimtagId)
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving this claimtag. Please try again.',
      500
    )
    return next(error)
  }

  if (!claimtag) {
    const error = new HttpError(
      'There was an error retreiving this claimtag. Please try again.',
      500
    )
    return next(error)
  }

  const profile = claimtag.profile

  if (!profile || !profile.email) {
    const error = new HttpError(
      'There was an error retreiving this claimtag. Please try again.',
      500
    )
    return next(error)
  }

  const html = `
  <p>Please use the link below to update your Claimtag profile: <br><br>
  <a href="${SITE_URL}/update/${claimtagId}" target="_blank">${SITE_URL}/update/${claimtagId}</a><br><br>
  <i>Sent via <a href="https://claimtag.io" target="_blank">Claimtags</a> powered by <a href="https://plynth.com" target="_blank">Plynth</a></i><br>
  </p>`

  const emailParams = {
    to: profile.email,
    from: {
      email: 'hello@claimtag.io',
      name: `Claimtags`,
    },
    bcc: 'contact@claimtag.io',
    subject: `Update your profile`,
    text: `Please use the link below to update your Claimtag profile`,
    html,
  }

  try {
    await sgMail.send(emailParams)
    console.log('email sent')
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'There was an error sending the email. Please try again.',
      500
    )
    return next(error)
  }

  res.status(200).json({ message: 'Email sent!' })
}

exports.create = create
exports.sendUpdateEmail = sendUpdateEmail
