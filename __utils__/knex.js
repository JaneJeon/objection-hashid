const knexjs = require('knex')

module.exports = knexjs({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
})
