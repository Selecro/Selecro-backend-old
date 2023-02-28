import {HttpErrors} from '@loopback/rest';
import * as isEmail from 'isemail';

export function validateCredentials(credentials: {email: string, password: string}) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }

  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8'
    )
  }
}
