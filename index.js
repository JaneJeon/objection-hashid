const HashId = require('hashids/cjs')
const memoize = require('lodash.memoize')

const memoizeHashId = memoize(
  (salt, minLength, alphabet, seps) =>
    new HashId(salt, minLength, alphabet, seps)
)

module.exports = Model => {
  // you can override the hashid properties on a per-model basis using model properties
  return class extends Model {
    static get hashIdSalt () {
      return super.hashIdSalt || this.name
    }

    static get hashIdMinLength () {}

    static get hashIdAlphabet () {}

    static get hashIdSeps () {}

    static get _hashIdInstance () {
      return memoizeHashId(
        this.hashIdSalt,
        this.hashIdMinLength,
        this.hashIdAlphabet,
        this.hashIdSeps
      )
    }

    get hashId () {
      return this.constructor._hashIdInstance.encode(this.$id())
    }

    get hashid () {
      return this.hashId
    }

    // This field indicates what property the hashid is written under.
    // By default, it overwrites id, but if you're using Algolia, for example,
    // it may be useful to set a custom id field as "ObjectID".
    static get hashIdField () {
      return 'id'
    }

    // These are all of the **non-id** fields that are hashed.
    // Useful if you have FK references that points to an id that is hashed.
    static get hashedFields () {
      return []
    }

    $formatJson (obj) {
      obj = super.$formatJson(obj)

      // inject the hashed PK into the resulting JSON - a reminder
      // that hashId/hashid fields are virtual and do not get written to JSON.
      if (this.constructor.hashIdField) {
        obj[this.constructor.hashIdField] = this.hashId
      }

      // hash the rest of the fields
      this.constructor.hashedFields.forEach(field => {
        obj[field] = this.constructor._hashIdInstance.encode(obj[field])
      })

      return obj
    }

    static get QueryBuilder () {
      return class extends Model.QueryBuilder {
        findByHashId (hashId) {
          const id = this.modelClass()._hashIdInstance.decode(hashId)
          const compoundPK = Array.isArray(this.modelClass().idColumn)

          return this.findById(compoundPK ? id : id[0])
        }
      }
    }
  }
}
