import express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/frontend-router.js'

await init()
async function init () {
  try {
    const app = express()
    const port = 8081
    const directoryFullName = dirname(fileURLToPath(import.meta.url))

    app.set(join(directoryFullName, 'views'))
    app.set('view engine', 'squirrelly')

    // Parse requests.
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.use(express.static(join(directoryFullName, 'public')))

    app.use('/', router)

    app.listen(port, function () {
      console.log('server is listening on port:' + port)
    })
  } catch (e) {
    console.error(e)
  }
}