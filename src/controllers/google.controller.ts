/*import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {GoogleAuth} from 'google-auth-library';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {UserSingup} from './login.controller';

export class GoogleLoginController {
  constructor(
    @repository(UserSingup)
    public userRepository: UserRepository,
    @inject('googleClientId')
    public googleClientId: string,
    @inject('googleClientSecret')
    public googleClientSecret: string,
  ) { }

  @post('/google/login')
  async googleLogin(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              idToken: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    body: {idToken: string},
  ): Promise<{token: string}> {
    const auth = new GoogleAuth({
      clientId: this.googleClientId,
      clientSecret: this.googleClientSecret,
    });
    const client = await auth.getIdTokenClient(body.idToken);
    const payload = client.verifyIdToken({idToken: body.idToken}).payload;
    const {sub, email, name} = payload;

    // Check if user exists
    let user = await this.userRepository.findOne({where: {googleId: sub}});
    if (!user) {
      // If user does not exist, create a new one
      user = new User({googleId: sub, email, name});
      user = await this.userRepository.create(user);
    }

    // Generate JWT token
    const token = await user.generateToken();

    return {token};
  }
}
*/
