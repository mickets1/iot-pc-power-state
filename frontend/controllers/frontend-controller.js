import bcrypt from 'bcrypt'
import axios from 'axios'
import { user, sensorData } from '../data.js'

export class FrontendController {
  async index (req, res) {
      res.render("index")
    }

  async login (req, res) {
    try {
      const foundUser = req.body.email === user.email
      if (foundUser) {
        const submittedPass = req.body.password

        // Comparing the hashes.
        const passwordMatch = await bcrypt.compare(submittedPass, user.password)
        
        if (passwordMatch) {
          this.adminPanel(req, res, 'init')
        } else {
          res.send('<div align="center"><h2>Invalid email or password</h2><br><br><a href="/">login again</a></div>')
        }
      }
      } catch (err) {
      console.log(err)
      res.send('server error')
    }
  }

  async getStats (req, res) {
    const response = await axios.get(process.env.API_URL + '/getstats')
    console.log(response.data)

    this.adminPanel(req, res, response.data)
  }

  async powerOn (req, res) {
    this.adminPanel(req, res)
  }

  async powerOff (req, res) {
    this.adminPanel(req, res)
  }

  async logout (req, res) {
    try {
      res.redirect('.')
    } catch (e) {
      console.error(e)
    }
  }

  async adminPanel (req, res, data) {
    res.render('admin')
  }
}