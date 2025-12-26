export const firebaseIdToken = 'firebaseIdToken';

export const forceRefreshToken = 'forceRefreshToken';

export class FirebaseCollection {
  static readonly users = 'users';

  static readonly messages = 'messages';

  static readonly notifications = 'notifications';
}

export class FirebaseDocument {
  static readonly members = 'members';

  static readonly messages = 'messages';
}

export declare type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';

export class FirebaseWhereFilter {
  static readonly lessThan: WhereFilterOp = '<';

  static readonly lessThanOrEqual: WhereFilterOp = '<=';

  static readonly equal: WhereFilterOp = '==';

  static readonly notEqual: WhereFilterOp = '!=';

  static readonly greaterThanOrEqual: WhereFilterOp = '>=';

  static readonly greaterThan: WhereFilterOp = '>';

  static readonly arrayContains: WhereFilterOp = 'array-contains';

  static readonly in: WhereFilterOp = 'in';

  static readonly arrayContainsAny: WhereFilterOp = 'array-contains-any';

  static readonly notIn: WhereFilterOp = 'not-in';
}
