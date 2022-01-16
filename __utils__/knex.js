const knexjs = require('knex')

module.exports = knexjs({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
})
