const plugin = require('.')
const visibility = require('objection-visibility').default
const knexjs = require('knex')

const knex = knexjs({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
});

[1, 2].forEach(version => {
  const { Model } = require(`objection-${version}`)
  Model.knex(knex)

  class BaseModel extends plugin(visibility(Model)) {
    static get tableName () {
      return `table1-${version}`
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

  class AlgoliaObject extends BaseModel {
    static get hashIdField () {
      return 'ObjectID'
    }
  }

  class FatModel extends BaseModel {
    static get hashedFields () {
      return ['foo', 'bar']
    }
  }

  class CompoundPK extends BaseModel {
    static get tableName () {
      return `table2-${version}`
    }

    static get idColumn () {
      return ['x', 'y']
    }
  }

  describe(`objection-hashid (w/ objection v${version})`, () => {
    beforeAll(async () => {
      await knex.schema.createTable(BaseModel.tableName, table => {
        table.increments()
        table.integer('foo')
      })

      await knex.schema.createTable(CompoundPK.tableName, table => {
        table.integer('x').notNullable()
        table.integer('y').notNullable()
        table.primary(['x', 'y'])
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

      expect(typeof model.toJSON().id).toEqual('string')
    })

    test('can change what field the hashed PK is written under', async () => {
      const model = await AlgoliaObject.query().first()

      expect(typeof model.toJSON().ObjectID).toBe('string')
    })

    test('can hash other fields as well', async () => {
      const model = await FatModel.query().insertAndFetch({ foo: 4 })

      expect(typeof model.toJSON().foo).toBe('string')
    })

    let obj, hashId

    test('works with objection-visibility', async () => {
      const model = await HiddenId.query().insertAndFetch({})
      obj = model.toJSON()
      hashId = model.hashId

      expect(obj.id).toBeUndefined()
      expect(typeof obj.hashId).toBe('undefined')
    })

    test('search by hashId', async () => {
      const model = await HiddenId.query().findByHashId(hashId)

      expect(model).toBeTruthy()
    })

    test('works with compound primary keys', async () => {
      const model = await CompoundPK.query().insertAndFetch({ x: 6, y: 9 })
      const hashId = model.toJSON().id
      expect(typeof hashId).toBe('string')

      const instance = await CompoundPK.query().findByHashId(hashId)
      expect(instance.$id()).toEqual([6, 9])
    })
  })
})
