import plugin from '.';
import {Model} from 'objection-2';
import knexjs from 'knex';

const knex = knexjs({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
});

Model.knex(knex)

class BaseModel extends plugin(Model) {
  static get tableName () {
    return 'table1'
  }

  id!: string;
}

class HiddenId extends BaseModel {
  static hidden = ['id'];
  static hashIdField = false;
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
    return 'table2'
  }

  static get idColumn () {
    return ['x', 'y']
  }
}

class SubModel extends BaseModel {
  static get hashIdSalt () {
    return 'static'
  }

  static get hashIdMinLength () {
    return 6
  }
}

class ModelA extends SubModel {
  static get relationMappings () {
    return {
      modelBs: {
        relation: BaseModel.HasManyRelation,
        modelClass: ModelB,
        join: {
          from: `${this.tableName}.id`,
          to: `${ModelB.tableName}.fk_id`
        }
      }
    }
  }
}

class ModelB extends SubModel {
  static get tableName () {
    return 'table3'
  }

  static get hashedFields () {
    return ['fk_id']
  }
}

describe(`objection-hashid types (w/ objection v2)`, () => {
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

    await knex.schema.createTable(ModelB.tableName, table => {
      table.increments()
      table
        .integer('fk_id')
        .references(`${ModelA.tableName}.id`)
        .notNullable()
    })
  })

  test('fills out hashId', async () => {
    const model = await BaseModel.query().insert({});

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

  test('maintains reference across multiple models', async () => {
    const modelA = await ModelA.query().insertAndFetch({})
    const modelB = await modelA.$relatedQuery('modelBs').insert({})

    expect(modelA.toJSON().id).toEqual(modelB.toJSON().fk_id)
  })
})