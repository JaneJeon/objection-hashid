const HashId = require('hashids/cjs')
const memoize = require('lodash.memoize')

const memoizeHashId = memoize(
  (salt, minLength, alphabet, seps) =>
    new HashId(salt, minLength, alphabet, seps)
)

// you can override any of the hashid properties (minus the salt) by passing thru opt
module.exports = opts => {
  return Model => {
    // you can also override the hashid properties on a per-model basis using model properties
    return class extends Model {
      static get hashIdSalt () {
        return this.name
      }

      static get hashIdMinLength () {
        return opts.minLength
      }

      static get hashIdAlphabet () {
        return opts.alphabet
      }

      static get hashIdSeps () {
        return opts.seps
      }

      // you can even override the hashId instance!
      static get hashIdInstance () {
        return memoizeHashId(
          this.hashIdSalt,
          this.hashIdMinLength,
          this.hashIdAlphabet,
          this.hashIdSeps
        )
      }

      get hashId () {
        return this.constructor.hashIdInstance.encode(this.$id())
      }

      $formatJson (obj) {
        obj = super.$formatJson(obj)

        // if the id is blurred out, then the hashId doesn't matter anyway
        obj.hashId = this.hashId

        return obj
      }

      static get QueryBuilder () {
        return class extends Model.QueryBuilder {
          findByHashId (hashId) {
            const id = this.modelClass().hashIdInstance.decode(hashId)
            const compoundPK = Array.isArray(this.modelClass().idColumn)

            return this.findById(compoundPK ? id : id[0])
          }
        }
      }
    }
  }
}
