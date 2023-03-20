import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import _ from 'lodash';
import * as nodemailer from 'nodemailer';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {isDomainVerified, validateCredentials} from '../services/validator.service';
const fs = require('fs');

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

const transporter = nodemailer.createTransport({
  host: process.env.EMAILHOST,
  secure: true,
  port: Number(process.env.EMAILPORT),
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASSWORD,
  },
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
          schema: getModelSchemaRef(Credentials),
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    if (credentials.email.includes('@')) {
      const user = await this.userService.verifyCredentials(credentials);
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token: token});
    }
    else {
      const user = await this.userService.verifyCredentialsUsername(
        credentials,
      );
      const userProfile = this.userService.convertToUserProfileUsername(user);
      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token: token});
    }
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
    currentUser: User,
  ): Promise<User> {
    return Promise.resolve(currentUser);
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'Signup',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                signup: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSingup),
        },
      },
    })
    userData: UserSingup,
  ) {
    validateCredentials(_.pick(userData, ['email', 'password', 'username']));
    const someResult = await Promise.all([isDomainVerified(userData.email)]);
    if (someResult[0] === true) {
      const existedemail = await this.userRepository.findOne({
        where: {email: userData.email},
      });
      const existedusername = await this.userRepository.findOne({
        where: {username: userData.username},
      });
      if (!existedemail && !existedusername) {
        const user: User = new User(userData);
        user.passwordHash = await this.hasher.hashPassword(userData.password);
        const savedUser = await this.userRepository.create(
          _.omit(user, 'password'),
        );
        savedUser.passwordHash = '';
        userData.password = '';
        if (userData.language === Language.CZ) {
          await transporter.sendMail({
            from: process.env.EMAILUSER,
            to: user.email,
            subject: 'Selecro',
            html: fs.readFileSync('./src/html/registrationCZ.html', 'utf-8'),
          });
        }
        else {
          await transporter.sendMail({
            from: process.env.EMAILUSER,
            to: user.email,
            subject: 'Selecro',
            html: fs.readFileSync('./src/html/registrationEN.html', 'utf-8'),
          });
        }
        return true;
      } else {
        throw new HttpErrors.UnprocessableEntity(
          'email or username already exist',
        );
      }
    } else {
      throw new HttpErrors.UnprocessableEntity('email does not exist');
    }
  }

  @authenticate('jwt')
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async findById(): Promise<User> {
    return this.userRepository.findById(this.user.id);
  }

  @authenticate('jwt')
  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @requestBody() user: User,
  ): Promise<void> {
    if (this.user.date == user.date && this.user.passwordHash == this.hasher.hashPassword(user.passwordHash)) {
      await this.userRepository.replaceById(this.user.id, user);
    }
    else if (this.user.date != user.date) {
      throw new HttpErrors.UnprocessableEntity(
        'cant change creation date',
      );
    }
    else if (this.user.passwordHash != this.hasher.hashPassword(user.passwordHash)) {
      if (this.user.language === Language.CZ) {
        await transporter.sendMail({
          from: process.env.EMAILUSER,
          to: user.email,
          subject: 'Selecro',
          html: fs.readFileSync('./src/html/emailchangeCZ.html', 'utf-8'),
        });
      }
      else {
        await transporter.sendMail({
          from: process.env.EMAILUSER,
          to: user.email,
          subject: 'Selecro',
          html: fs.readFileSync('./src/html/emailchangeEN.html', 'utf-8'),
        });
      }
      await this.userRepository.replaceById(this.user.id, user);
    }
    else {
      throw new HttpErrors.UnprocessableEntity(
        'unexpected error',
      );
    }
  }

  @authenticate('jwt')
  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(): Promise<void> {
    await this.userRepository.deleteById(this.user.id);
  }
}
