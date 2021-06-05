const HashId = require('hashids/cjs')
const memoize = require('lodash/memoize')
const get = require('lodash/get')
const set = require('lodash/set')
const deepCopy = require('lodash/cloneDeep')

const memoizeHashId = memoize(
  (salt, minLength, alphabet, seps) =>
    new HashId(salt, minLength, alphabet, seps)
)

module.exports = Model => {
  // you can override the hashid properties on a per-model basis using model properties
  return class extends Model {
    static get hashIdSalt() {
      return super.hashIdSalt || this.name
    }

    static get hashIdMinLength() {}

    static get hashIdAlphabet() {}

    static get hashIdSeps() {}

    static get _hashIdInstance() {
      return memoizeHashId(
        this.hashIdSalt,
        this.hashIdMinLength,
        this.hashIdAlphabet,
        this.hashIdSeps
      )
    }

    get hashId() {
      return this.constructor._hashIdInstance.encode(this.$id())
    }

    get hashid() {
      return this.hashId
    }

    // This field indicates what property the hashid is written under.
    // By default, it overwrites id, but if you're using Algolia, for example,
    // it may be useful to set a custom id field as "ObjectID".
    static get hashIdField() {
      return 'id'
    }

    // These are all of the **non-id** fields that are hashed.
    // Useful if you have FK references that points to an id that is hashed.
    static get hashedFields() {
      return []
    }

    $formatJson(originalObj) {
      const obj = deepCopy(super.$formatJson(originalObj))

      // inject the hashed PK into the resulting JSON - a reminder
      // that hashId/hashid fields are virtual and do not get written to JSON.
      if (this.constructor.hashIdField) {
        set(obj, this.constructor.hashIdField, this.hashId)
      }

      // hash the rest of the fields
      this.constructor.hashedFields.forEach(field => {
        const encoded = this.constructor._hashIdInstance.encode(get(obj, field))
        set(obj, field, encoded)
      })

      return obj
    }

    $parseJson(originalJSON, opt) {
      const json = deepCopy(super.$parseJson(originalJSON, opt))

      // decode any `hashedFields`, which are guaranteed to be single column
      this.constructor.hashedFields.forEach(field => {
        const hashId = get(json, field)
        const decoded = this.constructor._hashIdInstance.decode(hashId)
        set(json, field, decoded[0])
      })

      // decoding the id is a bit trickier as it can be a compound PK.
      // The only reason this works is because hashid can decode back into
      // the original array form, allowing us to map each entry in the array
      // to each column in the id
      const hashId = get(json, this.constructor.hashIdField)
      const decodedId = this.constructor._hashIdInstance.decode(hashId)

      if (Array.isArray(this.constructor.idColumn)) {
        for (let i = 0; i < decodedId.length; i++) {
          set(json, this.constructor.idColumn[i], decodedId[i])
        }
      } else set(json, this.constructor.idColumn, decodedId[0])

      return json
    }

    static get QueryBuilder() {
      return class extends Model.QueryBuilder {
        findByHashId(hashId) {
          const id = this.modelClass()._hashIdInstance.decode(hashId)
          const compoundPK = Array.isArray(this.modelClass().idColumn)

          return this.findById(compoundPK ? id : id[0])
        }
      }
    }
  }
}
