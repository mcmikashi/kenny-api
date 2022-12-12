// Core
import { Context, HttpResponseOK, Post } from '@foal/core';

export class AuthController {

  @Post('/login')
  async login(ctx: Context) {
    return new HttpResponseOK('');
  }
}
