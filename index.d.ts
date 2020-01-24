declare module 'objection-hashid' {
  import { Model } from 'objection-2';
  import { QueryBuilder } from 'knex';

  class HashIdExtensionClass extends Model {
    static get hashIdSalt(): string;

    static get hashIdMinLength(): number | void;

    static get hashIdAlphabet(): string | void;

    static get hashIdSeps(): string | void;

    static get _hashIdInstance(): string;

    get hashId(): string;

    get hashid(): string;

    static get hashIdField(): string;

    static get hashedFields(): Array<any>;

    $formatJson(obj: object): object;
  }

  export default function (model: new (...args: any[]) => Model): new (...args: any[]) => HashIdExtensionClass;
}
