// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject('authentication.jwt.secret')
    private jwtSecret: string,
    @inject('authentication.jwt.expiresIn')
    private jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: '', username: ''},
        {
          [securityId]: decodedToken.id,
          username: decodedToken.username,
          id: decodedToken.id,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    const userInfoForToken = {
      id: userProfile[securityId],
      username: userProfile.username,
      email: userProfile.email,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }
}
