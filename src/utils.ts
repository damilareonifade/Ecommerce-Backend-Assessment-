export enum HttpStatus {
  CREATED = 'CREATED',
  OK = 'OK',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

export const HttpStatusCode = {
  BAD_REQUEST: 400,
  CREATED: 201,
  INTERNAL_SERVER_ERROR: 500,
  OK: 200,
  UNAUTHORIZED_ACCESS: 401,
};

export class GenericApiResponse<T> {
  constructor(
    public data: T,
    public status: string,
    public statusCode: number,
    public isSuccesfull: boolean,
  ) {}

  static returnCreated<T>(data: T): GenericApiResponse<T> {
    return new GenericApiResponse(
      data,
      HttpStatus.CREATED,
      HttpStatusCode.CREATED,
      true,
    );
  }

  static returnBadRequest<T extends string>(data: T): GenericApiResponse<T> {
    return new GenericApiResponse(
      data,
      HttpStatus.BAD_REQUEST,
      HttpStatusCode.BAD_REQUEST,
      false,
    );
  }

  static returnInternalServerErrorResponse<T>(data: T): GenericApiResponse<T> {
    return new GenericApiResponse(
      data,
      HttpStatus.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      false,
    );
  }

  static returnOkResponse<T>(data: T): GenericApiResponse<T> {
    return new GenericApiResponse(data, HttpStatus.OK, HttpStatusCode.OK, true);
  }
}
