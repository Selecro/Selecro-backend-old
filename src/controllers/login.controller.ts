import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {get, getJsonSchemaRef, getModelSchemaRef, HttpErrors, post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import _ from "lodash";
import * as nodemailer from 'nodemailer';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {isDomainVerified, validateCredentials} from '../services/validator.service';

import * as dotenv from 'dotenv';
dotenv.config();

@model()
export class UserSingup {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  password: string;
  @property({
    type: 'string',
    required: true,
  })
  username: string;
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(Language),
    },
  })
  language: Language;
}

@model()
export class Credentials {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  passwordHash: string;
}

let transporter = nodemailer.createTransport({
  "host": process.env.EMAILHOST,
  "secure": true,
  "port": Number(process.env.EMAILPORT),
  "auth": {
    "user": process.env.EMAILUSER,
    "pass": process.env.EMAILPASSWORD
  }
});

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
    @repository(UserRepository) public userRepository: UserRepository,
  ) { }

  @post('/users/login', {
    security: [{jwt: []}],
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credentials)
        },
      },
    })
    credentials: Credentials): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token})
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(UserSingup)
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSingup)
        },
      },
    })
    userData: UserSingup) {
    validateCredentials(_.pick(userData, ['email', 'password']));
    let someResult = await Promise.all([isDomainVerified(userData.email)]);
    if (someResult[0] == true) {
      const user: User = new User(userData);
      await transporter.sendMail({
        from: process.env.EMAILUSER,
        to: user.email,
        subject: "Selecro",
        html: "xddddddd"
      });
      user.passwordHash = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(_.omit(user, 'password'));
      savedUser.passwordHash = "";
      userData.password = "";
      return savedUser;
    }
    else {
      throw new HttpErrors.UnprocessableEntity(
        'email does not exist'
      );
    }
  }
}
