/*import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, HttpErrors, param} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {FacebookLoginProvider} from '../providers';
import {FacebookProfile} from '../types';

export class FacebookController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUserProfile: UserProfile,
    @inject('providers.FacebookLoginProvider')
    private facebookLoginProvider: FacebookLoginProvider,
  ) { }

  @get('/auth/facebook', {
    responses: {
      '200': {
        description: 'Facebook OAuth2 login',
      },
    },
  })
  @authenticate('facebook')
  async facebookLogin(
    @param.query.string('access_token') accessToken: string,
  ): Promise<string> {
    if (!accessToken) {
      throw new HttpErrors.BadRequest('access_token is required.');
    }

    const profile: FacebookProfile = await this.facebookLoginProvider.verifyToken(
      accessToken,
    );

    // Create or update user profile
    const userProfile: UserProfile = {
      id: `facebook-${profile.id}`,
      name: profile.name,
      email: profile.email,
      avatar: profile.picture,
      [securityId]: ''
    };

    // Set the current user profile
    this.currentUserProfile = userProfile;

    // Return the access token
    return this.facebookLoginProvider.generateToken(userProfile);
  }
}
*/
