const plugin = require('.')
const { Model } = require('objection')
const visibility = require('objection-visibility').default
const knexjs = require('knex')

const knex = knexjs({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
})

Model.knex(knex)

class BaseModel extends plugin(visibility(Model)) {
  static get tableName () {
    return 'users'
  }
}

class HiddenId extends BaseModel {
  static get hidden () {
    return ['id']
  }

  static get hashIdField () {
    return false
  }
}

describe('objection-hashid', () => {
  beforeAll(async () => {
    return knex.schema.createTable('users', table => {
      table.increments()
    })
  })

  test('fills out hashId', async () => {
    const model = await BaseModel.query().insert({})

    expect(typeof model.id).toBe('number')
    expect(typeof model.hashId).toBe('string')
    expect(model.hashId.length).toBeGreaterThan(0) // hashid returns blank string on error
  })

  test('aliases hashid', async () => {
    const model = await BaseModel.query().first()

    expect(model.hashid).toBeDefined()
  })

  test('writes hashid to resulting object', async () => {
    const model = await BaseModel.query().first()

    expect(typeof model.toJSON().id).toBe('string')
  })

  let obj, hashId

  test('works with objection-visibility', async () => {
    const model = await HiddenId.query().insert({})
    obj = model.toJSON()
    hashId = model.hashId

    expect(obj.id).toBeUndefined()
    expect(typeof obj.hashId).toBe('undefined')
  })

  test('search by hashId', async () => {
    const model = await HiddenId.query().findByHashId(hashId)

    expect(model).toBeTruthy()
  })

  test.skip('works with compound primary keys', () => {
    // TODO:
  })
})
