/* eslint-disable jsdoc/require-jsdoc */

export class PowerController {
  async index (req, res, next) {
    return res.json('Empty')
  }

  async powerOn (req, res, next) {
    try {
      console.log(req.app.locals.powerstate)
      req.app.locals.powerstate = true
      console.log('poweron backend')
      res.status(200).send('Powering ON...')
    } catch (err) {
      console.error()
    }
  }

  async powerOff (req, res, next) {
    try {
      console.log(req.app.locals.powerstate)
      console.log('poweroff backend')
      req.app.locals.powerstate = false
      res.status(200).send('Powering OFF...')
    } catch (err) {
      console.error()
    }
  }

  async powerRestart (req, res, next) {
    try {
      // wait for pc iot response when up.
      console.log(req.app.locals.powerstate)
      console.log('power restart backend')
      res.status(200).send('Restarting...')
    } catch (err) {
      console.error()
    }
  }

  async createStats (req, res, next) {
    try {
      const result = await req.app.es.index({
        index: 'docker',
        document: {
          task: req.body.task,
          temp: req.body.temp
        }
      })

      return res.json(await result)
    } catch (err) {
      console.error()
    }
  }

  async allStats (req, res, next) {
    try {
      const result = await req.app.es.search({
        aggs: {
          docker: {
            multi_terms: {
              terms: [{ field: 'task.keyword' }, { field: 'temp.keyword' }], size: 100
            }
          }
        }
      })

      // const testMockup = {
      //   task: 'cpu',
      //   temp: '100c'
      // }

      // Remove metadata from result.
      const truncRes = []
      for (const i of result.aggregations.docker.buckets) {
        truncRes.push(i.key)
      }

      return res.json(truncRes)
    } catch (e) {
      console.error(e)
    }
  }
}
