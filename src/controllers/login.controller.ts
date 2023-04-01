import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {model, property, repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import _ from 'lodash';
import * as nodemailer from 'nodemailer';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator.service';
const fs = require('fs');
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
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject('services.user.service')
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.hasher')
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
          schema: getModelSchemaRef(Credentials),
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token});
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
    }
    else if (!existedemail) {
      throw new HttpErrors.UnprocessableEntity(
        'email already exist',
      );
    }
    else if (!existedusername) {
      throw new HttpErrors.UnprocessableEntity(
        'username already exist',
      );
    }
    else {
      throw new HttpErrors.UnprocessableEntity(
        'unexpected error',
      );
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
    ///Upravit
    await this.userRepository.replaceById(this.user.id, user);
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
