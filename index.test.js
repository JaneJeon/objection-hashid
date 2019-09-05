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

class BaseModel extends visibility(Model) {
  static get tableName () {
    return 'users'
  }

  static get hidden () {
    return ['id']
  }
}

describe('objection-hashid', () => {
  beforeAll(async () => {
    return knex.schema.createTable('users', table => {
      table.increments()
      table.text('username')
      table.text('email')
      table.text('role')
    })
  })
})
