<h1 align="center">Welcome to objection-hashid 👋</h1>

[![CircleCI](https://img.shields.io/circleci/build/github/JaneJeon/objection-hashid)](https://circleci.com/gh/JaneJeon/objection-hashid) [![codecov](https://codecov.io/gh/JaneJeon/objection-hashid/branch/master/graph/badge.svg)](https://codecov.io/gh/JaneJeon/objection-hashid) [![Maintainability](https://api.codeclimate.com/v1/badges/744d3e3b2ab971a81016/maintainability)](https://codeclimate.com/github/JaneJeon/objection-hashid/maintainability) [![Version](https://img.shields.io/npm/v/objection-hashid)](https://www.npmjs.com/package/objection-hashid) [![Downloads](https://img.shields.io/npm/dt/objection-hashid)](https://www.npmjs.com/package/objection-hashid) [![install size](https://packagephobia.now.sh/badge?p=objection-hashid)](https://packagephobia.now.sh/result?p=objection-hashid) [![Dependencies](https://img.shields.io/david/JaneJeon/objection-hashid)](https://david-dm.org/JaneJeon/objection-hashid) [![Known Vulnerabilities](https://snyk.io//test/github/JaneJeon/objection-hashid/badge.svg?targetFile=package.json)](https://snyk.io//test/github/JaneJeon/objection-hashid?targetFile=package.json) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=JaneJeon/objection-hashid)](https://dependabot.com) [![License](https://img.shields.io/npm/l/objection-hashid)](https://github.com/JaneJeon/objection-hashid/blob/master/LICENSE) [![Docs](https://img.shields.io/badge/docs-github-blue)](https://janejeon.github.io/objection-hashid) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> Objection plugin to automatically obfuscate model ids using hashids!

### 🏠 [Homepage](https://github.com/JaneJeon/objection-hashid)

## Why?

Sometimes you don't want to expose the id's of your model directly. Instead of `{id: 1}`, you can have `{id: 'W02nmXZ'}` like YouTube's video id or bitly's link id.

That's where [hashids](https://hashids.org) and this plugin comes in: it automatically converts the model id(s) (yes, it supports compound PKs) into an obfuscated form for the outside world to read, and then convert it back to the original form when the server's trying to read the model id.

## Install

```sh
yarn add objection-hashid # or
npm install objection-hashid --save
```

## Usage

```js
const { Model } = require("objection");
const hashid = require("objection-hashid");

class Post extends hashid(Model) {
  // that's it! This is just a regular objection.js model class
}
```

Then you can take your resource model and...

```js
const post = await Post.query().findById(42);
console.log(post.id); // 42
console.log(post.hashId); // some string "XYZ"
console.log(JSON.stringify(post)); // {id: "XYZ", ...}
```

Note that the hashed form of your model id is readable while it's an object (i.e. you haven't serialized it yet by sending it thru `res.send()`, for example) via the `hashId` property.

When serialized, the `hashId` property won't be written so that your resulting object stays clean. Instead, the `hashId` gets written into the `id` field, overwriting it (this is configurable; see the _Configuration_ section).

You can even use this plugin with `objection-visibility`:

```js
const { Model } = require("objection");
const visibility = require("objection-visibility").default;
const hashid = require("objection-hashid");

class BaseModel extends hashid(visibility(Model)) {
  static get hidden() {
    return ["foo", "bar"];
  }
}
```

It's recommended that you apply this plugin AFTER `objection-visibility` since the order in which you apply the plugins affect how properties are handled.  
Specifically, applying the visibility plugin after this plugin might strip away the `hashid` from the serialized object.

Note that this plugin directly uses Objection hooks to provide its functionality, so you don't have to do change your code if you're already using `virtualAttributes`.

## Configuration

You might've noticed that when initializing this plugin, it doesn't take in any options object. Instead, all of the configuration is done through specifying model properties, meaning you can configure this plugin on a per-model basis!

The `hashids` library accepts up to four parameters (see [hashids.org](https://hashids.org) for more details): `salt`, `minLength`, `alphabet`, and `seps`.

Each of those properties, for each model, can be overwritten by setting them as static properties. For example, if you want your hashid's to be at least 5 characters long:

```js
class BaseModel extends hashid(Model) {
  static get hashIdMinLength() {
    return 5;
  }
}
```

So the `hashid` parameters can be overwritten by static `hashIdSalt`, `hashIdMinLength`, `hashIdAlphabet`, and `hashIdSeps` properties.

Furthermore, the `hashIdSalt` property defaults to the model's class name, i.e. your generated hashid's won't "collide" between two different models!

And finally, to configure which field the hashid is written to during serialization, set the static `hashIdField` property.  
By default, it's `id`, but you can change it to any string (e.g. `hashid`), or, you can set it to a falsey value to _disable_ writing the hashid to the final object, meaning you can only access the hashid before it's serialized.

## Run tests

```sh
yarn test
```

## Author

👤 **Jane Jeon**

- Github: [@JaneJeon](https://github.com/JaneJeon)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check [issues page](https://github.com/JaneJeon/objection-hashid/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Jane Jeon](https://github.com/JaneJeon).  
This project is [MIT](https://github.com/JaneJeon/objection-hashid/blob/master/LICENSE) licensed.
