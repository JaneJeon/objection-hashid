import { Model, ModelClass, Page } from 'objection-2';
import { QueryBuilder } from 'knex';

export as namespace ObjectionHashID;

export interface HashProperties {
  hashid: string;
  hashId: string;
}

export class AuthQueryBuilder<M extends Model, R = M[]> {
  ArrayQueryBuilderType: AuthQueryBuilder<M, M[]>;
  SingleQueryBuilderType: AuthQueryBuilder<M, M>;
  NumberQueryBuilderType: AuthQueryBuilder<M, number>;
  PageQueryBuilderType: AuthQueryBuilder<M, Page<M>>;

  findByHashId: (hashId: string) => this['SingleQueryBuilderType'] & M['QueryBuilderType']['SingleQueryBuilderType'];
}

export interface HashIdInstance<T extends typeof Model> {
  QueryBuilderType: AuthQueryBuilder<this & T['prototype']>;

  hashid: string;
  hashId: string;
}

export interface HashIdStatic<T extends typeof Model> {
  QueryBuilder: typeof AuthQueryBuilder;
  hashIdSalt: string;
  hashIdMinLength: number | void;
  hashIdAlphabet: string | void;
  hashIdSeps: string | void;
  hashIdField: string | boolean;
  hashedFields: Array<any>;

  new (): HashIdInstance<T> & T['prototype'];
}

export default function hashid<T extends typeof Model>(model: T): HashIdStatic<T> & Omit<T, 'new'> & T['prototype'];