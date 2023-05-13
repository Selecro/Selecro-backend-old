import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {model, property, repository} from '@loopback/repository';
import {
  HttpErrors,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  post,
  put,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import multer from 'multer';
import {config} from '../datasources/sftp.datasource';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {EmailService} from '../services/email';
import {BcryptHasher} from '../services/hash.password';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator.service';
dotenv.config();
const fs = require('fs');
const Client = require('ssh2-sftp-client');
const sftp = new Client();

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
    const existedemail = await this.userRepository.findOne({
      where: {email: user.email},
    });
    const existedusername = await this.userRepository.findOne({
      where: {username: user.email},
    });
    if (existedemail?.emailVerified || existedusername?.emailVerified) {
      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token: token});
    } else {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
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
        await this.emailService.sendRegistrationEmail(savedUser);
      } catch (error) {
        throw new HttpErrors.InternalServerError('Error sending email');
      }
    } else if (existedemail) {
      throw new HttpErrors.UnprocessableEntity('email already exist');
    } else if (existedusername) {
      throw new HttpErrors.UnprocessableEntity('username already exist');
    } else {
      throw new HttpErrors.UnprocessableEntity('unexpected error');
    }
  }

  @post('/verify-email')
  async verifyEmail(@requestBody() request: {token: string}) {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    const {token} = request;
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
    try {
      await this.userRepository.updateById(user.id, {emailVerified: true});
    } catch (error) {
      throw new HttpErrors.UnprocessableEntity(
        'Failed to update user email verification status',
      );
    }
    return {message: 'Email address verified successfully'};
  }

  @post('/send-password-change')
  async sendPasswordChange(@requestBody() request: {email: string}) {
    const user = await this.userRepository.findOne({
      where: {
        email: request.email,
      },
    });
    if (!user) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid or expired verification token',
      );
    }
    try {
      await this.emailService.sendPasswordChange(user);
    } catch (err) {
      throw new HttpErrors.UnprocessableEntity('error in email send');
    }
  }

  @post('/password-change')
  async changePassword(
    @requestBody()
    request: {
      token: string;
      password0: string;
      password1: string;
    },
  ) {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    const {token} = request;
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
    if (
      (await this.hasher.hashPassword(request.password0)) ===
      (await this.hasher.hashPassword(request.password1))
    ) {
      try {
        await this.emailService.sendSuccessfulyPasswordChange(user);
        await this.userRepository.updateById(user.id, {
          passwordHash: await this.hasher.hashPassword(request.password0),
        });
      } catch (error) {
        throw new HttpErrors.UnprocessableEntity(
          'Failed to update user password',
        );
      }
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
  async replaceById(@requestBody() user: User): Promise<void> {
    const dbuser = await this.userRepository.findById(this.user.id);
    if (
      dbuser.date.toString() === new Date(user.date).toString() &&
      dbuser.id === user.id &&
      dbuser.passwordHash === user.passwordHash &&
      dbuser.emailVerified === user.emailVerified &&
      dbuser.link === user.link
    ) {
      await this.userRepository.updateById(this.user.id, user);
    } else if (dbuser.email !== user.email) {
      if (!isEmail.validate(user.email)) {
        throw new HttpErrors.UnprocessableEntity('invalid Email');
      }
      await this.emailService.sendResetEmail(dbuser, user.email);
      await this.userRepository.updateById(user.id, {emailVerified: false});
    } else if (dbuser.date.toString() !== new Date(user.date).toString()) {
      throw new HttpErrors.UnprocessableEntity('cant change creation date');
    } else if (dbuser.link !== user.link) {
      throw new HttpErrors.UnprocessableEntity('cant change profile link');
    } else if (dbuser.emailVerified !== user.emailVerified) {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
    } else if (dbuser.id !== user.id) {
      throw new HttpErrors.UnprocessableEntity('cant change id');
    } else if (dbuser.passwordHash !== user.passwordHash) {
      throw new HttpErrors.UnprocessableEntity('cant change password');
    } else {
      throw new HttpErrors.UnprocessableEntity('unexpected error');
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

  @authenticate('jwt')
  @get('/users/{id}/profilePictureGet', {
    responses: {
      '200': {
        description: 'User profile picture content',
        content: {'image/jpeg': {}},
      },
    },
  })
  async getUserProfilePicture(): Promise<void> {
    const user = await this.userRepository.findById(this.user.id);
    if (user.link != null) {
      sftp
        .connect(config)
        .then(async () => {
          return await sftp.get("/users/" + user.link);
        })
        .then(() => {
          sftp.end();
        })
        .catch((error: any) => {
          console.log(error);
          throw new HttpErrors.UnprocessableEntity('error in get picture');
        });
    } else {
      throw new HttpErrors.UnprocessableEntity(
        'user does not have profile picture',
      );
    }
  }

  @authenticate('jwt')
  @post('/users/{id}/profilePictureSet', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: '',
      },
    },
  })
  async uploadImage(
    @requestBody({
      description: 'multipart/form-data for files/fields',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              file: {type: 'string', format: 'binary'},
            },
          },
        },
      },
    })
    request: Request | any,
    @inject(RestBindings.Http.RESPONSE) response: Response | any,
  ): Promise<void> {
    const user = await this.userRepository.findById(this.user.id);
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public");
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
      },
    });
    const upload = multer({storage: storage});
    try {
      await new Promise<void>((resolve, reject) => {
        upload.single('image')(request, response, async (err) => {
          if (err) {
            reject(err);
          } else {
            sftp.connect(config).then(() => {
              return sftp.put("./public/" + request.file.filename, "users/" + request.file.filename);
            }).then((data: any) => {
              sftp.end();
              return data;
            }).catch((err: any) => {
              throw new HttpErrors.UnprocessableEntity(
                'error in get picture',
              );
            });
            await this.userRepository.updateById(user.id, {link: request.file.filename});
            fs.unlink("./public/" + request.file.filename, function (err: any) {
              if (err) {
                // handle the error here
                console.error(err);
              } else {
                // file deleted successfully
                console.log("File deleted");
              }
            });
            resolve();
          }
        });
      });
    } catch (error) {
      throw new HttpErrors.InternalServerError('Failed to upload file');
    }
  }
}
