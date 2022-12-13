import { Context, hashPassword, HttpResponseOK, Post, ValidateBody, HttpResponseUnauthorized, verifyPassword, HttpResponseNoContent } from '@foal/core';
import { getSecretOrPrivateKey, setAuthCookie, removeAuthCookie } from '@foal/jwt';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';
import { User } from '../../entities';

const credentialsSchema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  type: 'object',
};

export class AuthController {

  @Post('/signup')
  @ValidateBody(credentialsSchema)
  async signup(ctx: Context) {
    const user = new User();
    user.email = ctx.request.body.email;
    user.username = ctx.request.body.username;
    user.password = await hashPassword(ctx.request.body.password);
    await user.save();

    const response = new HttpResponseOK();
    await setAuthCookie(response, await this.createJWT(user));
    return response;
  }

  @Post('/login')
  @ValidateBody(credentialsSchema)
  async login(ctx: Context) {
    const user = await User.findOneBy({ email: ctx.request.body.email });

    if (!user) {
      return new HttpResponseUnauthorized();
    }

    if (!await verifyPassword(ctx.request.body.password, user.password)) {
      return new HttpResponseUnauthorized();
    }

    return new HttpResponseOK({
      token: await this.createJWT(user)
    });
  }

  @Post('/logout')
  logout(ctx: Context) {
    const response = new HttpResponseNoContent();
    removeAuthCookie(response);
    return response;
  }

  private async createJWT(user: User): Promise<string> {
    const payload = {
      email: user.email,
      id: user.id,
    };

    return promisify(sign as any)(
      payload,
      getSecretOrPrivateKey(),
      { subject: user.id.toString() }
    );
  }
}
