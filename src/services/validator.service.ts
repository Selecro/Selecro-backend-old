import {HttpErrors} from '@loopback/rest';
import * as isEmail from 'isemail';

import * as dotenv from 'dotenv';
dotenv.config();

export function validateCredentials(credentials: {
  email: string;
  password: string;
  username: string;
}) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity(
      'invalid Email'
    );
  }

  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8',
    );
  }

  if (credentials.username.length < 4) {
    throw new HttpErrors.UnprocessableEntity(
      'username length should be greater than 4',
    );
  }
}
