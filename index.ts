import * as serverless from 'serverless-http'
import * as express from 'express'
import {getFlowStructureErrors, IContainer} from '@floip/flow-runner'

const app = express()

// parse application/x-www-form-urlencoded
const urlParser = express.urlencoded({ extended: false })
// parse application/json
const jsonParser = express.json()

app.post('/validate', jsonParser, function (req, res) {
  res.set('Access-Control-Allow-Origin', '*')
  const containerJson = req.body as IContainer
  validate(containerJson, req, res)
})

app.post('/validateForm', urlParser, function (req, res) {
  res.set('Access-Control-Allow-Origin', '*')
  try {
    const containerJson = JSON.parse(req.body.flow) as IContainer
    validate(containerJson, req, res)
  }
  catch(e) {
    res.json({
      specification_version: undefined,
      result: 'Failed',
      errors: [
        {
          keyword: 'invalid',
          dataPath: '/container',
          schemaPath: null,
          params: [],
          propertyName: null,
          message: 'Could not parse Flow Container JSON: ' + e.message,
        }
      ]
    })
  }
})

function validate(container: any, req, res) {
  const specVersion = container.specification_version
  const errors = getFlowStructureErrors(container)
  if(errors == null) {
    res.json({
      specification_version: container.specification_version,
      result: 'Passed',
    })
  }
  else {
    res.json({
      specification_version: container.specification_version,
      result: 'Failed',
      errors: errors
    })
  }
}

export const handler = serverless(app)