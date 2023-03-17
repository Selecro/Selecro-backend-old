// import {SECURITY_SCHEME_SPEC} from './utils/security-spec';
import {
  JWTAuthenticationComponent,
  JWTAuthenticationStrategy,
  SECURITY_SCHEME_SPEC,
  UserRepository,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
//import {JWTStrategy} from './authentication-stratgies/jwt-stratgies';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {
  GroupRepository,
  InstructionRepository,
  StepRepository,
  UserGroupRepository,
  UserLinkRepository,
} from './repositories';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';

import {AuthenticationComponent} from '@loopback/authentication';
import * as dotenv from 'dotenv';
dotenv.config();

export {ApplicationConfig};
export class FirstappApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.bind('services.jwt').toClass(JWTService);

    // Configure the JWT authentication strategy as the default strategy
    this.component(JWTAuthenticationComponent);
    this.bind('authentication.strategies.jwt').toClass(
      JWTAuthenticationStrategy,
    );
    this.bind('authentication.jwt.secret').to('my-secret-key');
    this.bind('authentication.jwt.expiresIn').to('3600');

    // setup binding
    this.setupBinding();

    // Add security spec
    this.addSecuritySpec();

    //this.component(AuthenticationComponent);
    //registerAuthenticationStrategy(this, JWTStrategy)

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.repository(UserRepository);
    this.repository(InstructionRepository);
    this.repository(StepRepository);
    this.repository(UserGroupRepository);
    this.repository(UserLinkRepository);
    this.repository(GroupRepository);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
  setupBinding(): void {
    // this.bind('service.hasher').toClass(BcryptHasher);
    // this.bind('rounds').to(10);
    // this.bind('service.user.service').toClass(MyUserService)
    // this.bind('service.jwt.service').toClass(JWTService);
    this.bind('authentication.jwt.secret').to(process.env.TOKEN);
    this.bind('authentication.jwt.expiresIn').to('7h');

    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    //this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.component(AuthenticationComponent);
  }
  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Selecro backend',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}
