<h1 align="center">Welcome to objection-hashid 👋</h1>

[![CircleCI](https://circleci.com/gh/JaneJeon/objection-hashid/tree/master.svg?style=shield)](https://circleci.com/gh/JaneJeon/objection-hashid/tree/master)
[![codecov](https://codecov.io/gh/JaneJeon/objection-hashid/branch/master/graph/badge.svg)](https://codecov.io/gh/JaneJeon/objection-hashid)
[![Version](https://img.shields.io/npm/v/objection-hashid)](https://www.npmjs.com/package/objection-hashid)
[![Downloads](https://img.shields.io/npm/dt/objection-hashid)](https://www.npmjs.com/package/objection-hashid)
[![Docs](https://img.shields.io/badge/docs-github-blue)](https://janejeon.github.io/objection-hashid)

> Objection plugin to automatically obfuscate model ids using hashids!

### 🏠 [Homepage](https://github.com/JaneJeon/objection-hashid)

> Enjoy objection-hashid? Check out my other objection plugins: [objection-authorize](https://github.com/JaneJeon/objection-authorize) and [objection-tablename](https://github.com/JaneJeon/objection-table-name)!

## Why?

Sometimes you don't want to expose the id's of your model directly. Instead of `{id: 1}`, you can have `{id: 'W02nmXZ'}` like YouTube's video id or bitly's link id.

That's where [hashids](https://hashids.org) and this plugin comes in: it automatically converts the model id(s) (yes, it supports compound PKs) into an obfuscated form for the outside world to read, and then convert it back to the original form when the server's trying to read the model id.

And all of this operation is _entirely_ isomorphic, so you don't have to worry about the integrity of the ids and id references as you convert back and forth between your auto-generated id and the hashed version!

## Install

```sh
yarn add objection-hashid # or
npm install objection-hashid --save
```

## Usage

```js
const { Model } = require('objection')
const hashid = require('objection-hashid')

class Post extends hashid(Model) {
  // that's it! This is just a regular objection.js model class
}
```

Then you can take your resource model and...

```js
const post = await Post.query().findById(42)
console.log(post.id) // 42
console.log(post.hashId) // some string "XYZ"
console.log(JSON.stringify(post)) // {id: "XYZ", ...}
```

Note that the hashed form of your model id is readable while it's an object (i.e. you haven't serialized it yet by sending it thru `res.send()`, for example) via the `hashId` property.

When serialized, the `hashId` property won't be written so that your resulting object stays clean. Instead, the `hashId` gets written into the `id` field, overwriting it (this is configurable; see the _Configuration_ section).

Now when you receive an object that has an encoded hashid, you can "decode" it and find the model using the `findByHashId` query:

```js
console.log(obj.id) // "XYZ"

const post = await Post.query().findByHashId(obj.id)
console.log(post.id) // 42
console.log(post.hashId) // "XYZ"
```

Additionally, this plugin automatically detects and adjusts for composite primary keys, so you don't have to do anything; the hashid will show up the same:

```js
class SomeModel extends hashid(Model) {
  static get idColumn() {
    return ['id1', 'id2']
  }
}

const model = await SomeModel.query().findById([1, 2])
console.log(model.$id()) // [1, 2]
console.log(model.hashId) // "XYZ"
console.log(JSON.stringify(model)) // {id1: 1, id2: 2, id: "XYZ"}

const obj = await SomeModel.query().findByHashId(model.hashId)
assert(obj.$id() == model.$id())
```

You can even use this plugin with `objection-visibility`:

```js
const { Model } = require('objection')
const visibility = require('objection-visibility').default
const hashid = require('objection-hashid')

class BaseModel extends hashid(visibility(Model)) {
  static get hidden() {
    return ['foo', 'bar']
  }
}
```

It's recommended that you apply this plugin AFTER `objection-visibility` since the order in which you apply the plugins affect how properties are handled.  
Specifically, applying the visibility plugin after this plugin might strip away the `hashid` from the serialized object.

Note that this plugin directly uses Objection hooks to provide its functionality, so you don't have to do change your code if you're already using `virtualAttributes`.

And finally, you can hash non-id fields as well (especially useful for hashing foreign key references). For example, if you have a `Post` model that has a `creatorId` that points to a `User`'s `id`, you can hash the `creatorId` field as well as the `id` field.

In fact, you can hash any arbitrary non-id field in the model as follows:

```js
class Post extends hashid(Model) {
  static get hashedFields() {
    return ['creatorId'] // specify any non-PK fields
  }
}
```

## Configuration

You might've noticed that when initializing this plugin, it doesn't take in any options object. Instead, all of the configuration is done through specifying model properties, meaning you can configure this plugin on a per-model basis!

The `hashids` library accepts up to four parameters (see [hashids.org](https://hashids.org) for more details): `salt`, `minLength`, `alphabet`, and `seps`.

Each of those properties, for each model, can be overwritten by setting them as static properties. For example, if you want your hashid's to be at least 5 characters long:

```js
class BaseModel extends hashid(Model) {
  static get hashIdMinLength() {
    return 5
  }
}
```

So the `hashid` parameters can be overwritten by static `hashIdSalt`, `hashIdMinLength`, `hashIdAlphabet`, and `hashIdSeps` properties.

Furthermore, the `hashIdSalt` property defaults to the model's class name, i.e. your generated hashid's won't "collide" between two different models!

To configure which field the hashid is written to during serialization, set the static `hashIdField` property.  
By default, it's `id`, but you can change it to any string (e.g. `hashid`), or, you can set it to a falsey value to _disable_ writing the hashid to the final object, meaning you can only access the hashid before it's serialized.

### Configuring for Foreign Key Relations

Note that if you have any models that point to each other, _every_ bit of configuration that deals with the generation of hashids MUST be the same.

This usually just means passing the same `hashIdSalt` to both models (if you haven't configured any other fields differently) since `hashIdSalt` varies based on the model's name.

If you have a lot of models pointing to each other, though, I recommend that you have a BaseClass with the appropriate hashId configuration and just subclass all your models off of it, not touching any of the hashId configurations at the individual model level.

## Run tests

```sh
yarn test
```

## Author

👤 **Jane Jeon**

- Github: [@JaneJeon](https://github.com/JaneJeon)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/JaneJeon/objection-hashid/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2022 [Jane Jeon](https://github.com/JaneJeon).  
This project is [LGPL](https://github.com/JaneJeon/objection-hashid/blob/master/LICENSE) licensed.

TL;DR: you are free to import and use this library "as-is" in your code, without needing to make your code source-available or to license it under the same license as this library; however, if you do change this library and you distribute it (directly or as part of your code consuming this library), please do contribute back any improvements for this library and this library alone.
