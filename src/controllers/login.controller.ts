import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {model, property, repository} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  getModelSchemaRef,
  post,
  put,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {EmailService} from '../services/email';
import {BcryptHasher} from '../services/hash.password';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator.service';
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
  username: string;
  @property({
    type: 'string',
    required: true,
  })
  password: string;
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
    @inject('services.email')
    public emailService: EmailService,
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
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    if (userProfile.emailVerified) {
      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token: token});
    }
    else {
      throw new HttpErrors.UnprocessableEntity(
        'email is not verified',
      );
    }
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
      try {
        await this.emailService.sendVerificationEmail(savedUser);
      } catch (error) {
        throw new HttpErrors.InternalServerError('Error sending email');
      }
    }
    else if (existedemail) {
      throw new HttpErrors.UnprocessableEntity(
        'email already exist',
      );
    }
    else if (existedusername) {
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

  @post('/verify-email')
  async verifyEmail(@requestBody() requestBody: {token: string}) {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    const {token} = requestBody;
    const secret = process.env.JWT_SECRET ?? '';
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, secret) as DecodedToken;
    } catch (err) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid or expired verification token',
      );
    }
    const {userId} = decodedToken;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid or expired verification token',
      );
    }
    user.emailVerified = true;
    try {
      await this.userRepository.update(user);
    } catch (error) {
      throw new HttpErrors.UnprocessableEntity(
        'Failed to update user email verification status',
      );
    }
    return {message: 'Email address verified successfully'};
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
  async replaceById(@requestBody() user: User): Promise<void> {
    if (this.user.date == user.date && this.user.id == user.id && this.user.passwordHash == this.hasher.hashPassword(user.passwordHash) && this.user.emailVerified == user.emailVerified) {
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
