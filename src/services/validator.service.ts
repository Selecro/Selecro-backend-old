import {HttpErrors} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as isEmail from 'isemail';

import * as dotenv from 'dotenv';
dotenv.config();

export function validateCredentials(credentials: {email: string, password: string, username: string}) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity(
      'invalid Email'
    );
  }

  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8'
    )
  }

  if (credentials.username.length < 4) {
    throw new HttpErrors.UnprocessableEntity(
      'username length should be greater than 4'
    )
  }
}

export async function isDomainVerified(email: string): Promise<any> {
  return fetch('https://api.hunter.io/v2/email-verifier?email=' + email + '&api_key=' + process.env.API_KEY)
    .then(response => response.json())
    .then(data => {
      if (data.data.status.toString() === 'valid') {
        return true;
      }
      else {
        return false;
      }
    });
}
