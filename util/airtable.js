const { AIRTABLE_API_KEY } = process.env
const Airtable = require('airtable')

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
const userBase = airtable.base('appsVpXq7G78bU575')

const addEmailToAirtable = async ({ email, isSubscribed, isUser }) => {
  const table = userBase('Users')
  let userId

  try {
    let records = await table
      .select({
        filterByFormula: `{Email} = "${email}"`,
      })
      .firstPage()
    const record = (records || [])[0]
    userId = record.id
  } catch (err) {}

  const data = { Email: email }
  isSubscribed !== undefined && (data.Subscribed = isSubscribed)
  isUser !== undefined && (data.Account = isUser)

  if (!!userId) {
    try {
      await table.update([{ id: userId, fields: data }])
    } catch (err) {
      return err
    }
  } else {
    try {
      await table.create([{ fields: data }])
    } catch (err) {
      return err
    }
  }
}

module.exports = {
  addEmailToAirtable,
}
