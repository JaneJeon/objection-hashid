import { Model, ModelClass, Page } from 'objection';
import { QueryBuilder } from 'knex';

declare module 'objection-hashid' {
  class AuthQueryBuilder<M extends Model, R = M[]> extends Model.QueryBuilder<M, R> {
    ArrayQueryBuilderType: AuthQueryBuilder<M, M[]>;
    SingleQueryBuilderType: AuthQueryBuilder<M, M>;
    NumberQueryBuilderType: AuthQueryBuilder<M, number>;
    PageQueryBuilderType: AuthQueryBuilder<M, Page<M>>;
  }

  class HashIdModelClass extends Model {
    QueryBuilderType: AuthQueryBuilder<this>;
    QueryBuilder: AuthQueryBuilder<this>;

    static get hashIdSalt(): string;

    static get hashIdMinLength(): number | void;

    static get hashIdAlphabet(): string | void;

    static get hashIdSeps(): string | void;

    static get _hashIdInstance(): string;

    get hashId(): string;

    get hashid(): string;

    static get hashIdField(): string;

    static get hashedFields(): Array<any>;
  }

  export default function hashid(model: new () => Model): ModelClass<HashIdModelClass>;
}
