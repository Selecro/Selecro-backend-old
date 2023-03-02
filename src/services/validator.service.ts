import {HttpErrors} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as isEmail from 'isemail';

import * as dotenv from 'dotenv';
dotenv.config();

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

export async function isDomainVerified(email: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.hunter.io/v2/email-verifier?email=' + email + '&api_key=' + process.env.API_KEY);
    const data = await response.json();
    console.log(data);
    return true;
  } catch (error) {
    console.error(error);
  }
  return false;
}
