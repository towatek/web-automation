const puppeteer = require('puppeteer')
const nodeMailer = require('nodemailer')

const COVID_UTM_VACCINE_STANDBY_PAGE =
  'https://op.trilliumhealthpartners.ca/VaccinationReg/standby.aspx?vgroup=arhc'

const mailOptions = {
  from: 'towatekautomation@gmail.com',
  to: 'twangtong@gmail.com',
  subject: 'UTM Vaccination Standby Appointment Available',
  text: `Please go to the UTM vaccination site: ${COVID_UTM_VACCINE_STANDBY_PAGE}`,
  attachments: [
    {
      path: 'success.png',
    },
  ],
}

const transporter = nodeMailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'towatekautomation@gmail.com',
    pass: 'Towatek4you!',
  },
})

const sendMail = async () => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`error: ${error}`)
        return reject(error)
      }

      console.log(`message sent: ${info}`)
      return resolve()
    })
  })
}

const checkSite = async () => {
  let maxLimitReached = false
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('response', (e) => {
    const url = e.url()
    if (url.split('/').includes('max-limit-reached.aspx')) {
      maxLimitReached = true
    }
  })
  await page.goto(COVID_UTM_VACCINE_STANDBY_PAGE)
  console.log(`max limit reached: ${maxLimitReached} ${new Date()}`)
  if (!maxLimitReached) {
    await page.screenshot({ path: 'success.png' })
    await sendMail()
  }
  await browser.close()
}

;(async () => {
  setInterval(checkSite, 5 * 60 * 1000)
})()
