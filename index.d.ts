import { Model, Page } from 'objection-2';

declare module 'objection-hashid' {
  class HashIdQueryBuilder<M extends Model, R = M[]> {
    ArrayQueryBuilderType: HashIdQueryBuilder<M, M[]>;
    SingleQueryBuilderType: HashIdQueryBuilder<M, M>;
    NumberQueryBuilderType: HashIdQueryBuilder<M, number>;
    PageQueryBuilderType: HashIdQueryBuilder<M, Page<M>>;

    findByHashId: (hashId: string) => this['SingleQueryBuilderType'] & M['QueryBuilderType']['SingleQueryBuilderType'];
  }

  interface HashIdInstance<T extends typeof Model> {
    QueryBuilderType: HashIdQueryBuilder<this & T['prototype']>;

    hashid: string;
    hashId: string;
  }

  interface HashIdStatic<T extends typeof Model> {
    QueryBuilder: typeof HashIdQueryBuilder;
    hashIdSalt: string;
    hashIdMinLength: number | void;
    hashIdAlphabet: string | void;
    hashIdSeps: string | void;
    hashIdField: string | boolean;
    hashedFields: Array<string>;

    new(): HashIdInstance<T> & T['prototype'];
  }

  export default function hashid<T extends typeof Model>(model: T): HashIdStatic<T> & Omit<T, 'new'> & T['prototype'];
}