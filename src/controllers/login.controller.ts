import {authenticate, TokenService} from '@loopback/authentication';
import {
  Credentials,
  MyUserService,
  TokenServiceBindings,
  UserRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  get, getModelSchemaRef, post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {PasswordHasherBindings} from '../keys';
import {BcryptHasher} from '../services/hash.password';
import {validateCredentials} from '../services/validator.service';

@model()
export class User {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  passwdhash: string;
  @property({
    type: 'string',
    required: true,
  })
  usrname: string;
}

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
    @repository(UserRepository) protected userRepository: UserRepository,
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
  async login(@requestBody(User) credentials: Credentials): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    userProfile.permissions = user.permissions;
    const jwt = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: jwt});
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
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
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
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
          }),
        },
      },
    })
    userData: User) {
    validateCredentials(_.pick(userData, ['email', 'passwdhash']));
    userData.passwdhash = await this.hasher.hashPassword(userData.passwdhash);
    const savedUser = await this.userRepository.create(_.omit(userData, 'passwdhash'));
    delete savedUser.password;
    return savedUser;
  }
}
