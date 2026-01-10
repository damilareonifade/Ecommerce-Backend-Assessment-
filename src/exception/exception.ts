export interface CustomErrors {
  name: ErrorType;
  message: string;
}

export class GenericCustomExceptionClass extends Error {
  constructor(message: CustomErrors) {
    super(message.message);
    this.name = message.name;
  }
}

export enum ErrorType {
  ProductError = 'ProductError',
  RoleError = 'RoleError',
  LoginError = 'LoginError',
  UserError = 'UserError',
  AuthenticationError = 'AuthenticationError',
  LoanError = 'loanError',
  LoanRepaymentReportError = 'LoanRepaymentReportError',
  CustomerError = 'CustomerError',
  ChargePointError = 'ChargePointError',
  ChargeSessionError = 'ChargeSessionError',
  InternalServerError = 'InternalServerError',
  PaystackInitializationError = 'PaystackInitializationError',
  PaymentVerificationError = 'PaymentVerificationError',
}
