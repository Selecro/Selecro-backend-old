import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {get, getJsonSchemaRef, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {isDomainVerified, validateCredentials} from '../services/validator.service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
const _ = require("lodash");

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
}

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
    security: OPERATION_SECURITY_SPEC,
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
  async login(@requestBody(UserSingup) credentials: Credentials): Promise<{token: string}> {
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
    isDomainVerified(userData.email.split("@")[1]);
    const user: User = new User(userData);
    user.passwordHash = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(_.omit(user, 'password'));
    //delete savedUser.passwdhash;
    return savedUser;
  }
}
