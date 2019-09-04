const HashId = require('hashids/cjs')
const memoize = require('lodash.memoize')

const memoizeHashId = memoize(
  (salt, minLength, alphabet, seps) =>
    new HashId(salt, minLength, alphabet, seps)
)

// you can override any of the hashid properties (minus the salt) by passing thru opt
module.exports = (opts = {hashId = 'id'}) => {
  return Model => {
    // you can also override the hashid properties on a per-model basis using model properties
    return class extends Model {
      static get hashIdSalt() {
        return this.name
      }

      static get hashIdMinLength() {
        return opts.minLength
      }

      static get hashIdAlphabet() {
        return opts.alphabet
      }

      static get hashIdSeps() {
        return opts.seps
      }

      // you can even override the hashId instance!
      static get hashIdInstance() {
        return memoizeHashId(
          this.hashIdSalt,
          this.hashIdMinLength,
          this.hashIdAlphabet,
          this.hashIdSeps
        )
      }

      static get QueryBuilder() {
        return class extends Model.QueryBuilder {
          // TODO:
        }
      }
    }
  }
}
