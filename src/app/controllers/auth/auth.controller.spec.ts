// std
import { ok, strictEqual, notEqual, rejects } from 'assert';

// 3p
import { Context, createController, getHttpMethod, getPath, isHttpResponseOK } from '@foal/core';
import { DataSource } from 'typeorm';

// App
import { AuthController } from './auth.controller';
import { createDataSource } from '../../../db';
import { User } from '../../entities';

describe('AuthController', () => {

  let dataSource: DataSource;
  let controller: AuthController;

  before(async () => {
    dataSource = createDataSource();
    await dataSource.initialize();
  });

  // Close the database connection after running all the tests whether they succeed or failed.
  after(async () => {
    if (dataSource) {
      await dataSource.close();
    }
  });

  beforeEach(() => controller = createController(AuthController));

  it('should handle requests POST request', () => {
    strictEqual(getHttpMethod(AuthController, 'signup'), 'POST');
    strictEqual(getPath(AuthController, 'signup'), '/signup');
  });

  it('should return an HttpResponseOK, an user should be created and jwt should be set', async () => {
    const ctx = new Context({
      body: {
        'email': 'jhondoe@test.com',
        'username': 'jhone2',
        'password': 'thescsuperscretpassword123',
      }
    });
    const response = await controller.signup(ctx);
    // Check that  the auth jwt token is set
    notEqual(response.getCookie('auth'), null, 'an user should have an auth token');
    ok(isHttpResponseOK(response), 'response should be an instance of HttpResponseOK.');
    // Check that the user is created
    const user = await User.findOneBy({ email: ctx.request.body.email });
    strictEqual(user?.username, ctx.request.body.username, 'an user should be created with the good username');
    notEqual(user?.password, ctx.request.body.password, 'an user should have a crypted password');
  });

  it('should not return an QueryFailedError when we does not send username and email', async () => {
    const ctx = new Context({
      body: {
        'password': 'thescsuperscretpassword123',
      }
    });
    await rejects(
      async () => {
        const response = await controller.signup(ctx);
      },
      {
        name: 'QueryFailedError',
      });
  });

  it('should not return an QueryFailedError when we does not send a valid email', async () => {
    const ctx = new Context({
      body: {
        'email': 'jhondoe.com',
        'username': 'jhone2',
        'password': 'thescsuperscretpassword123',
      }
    });
    await rejects(
      async () => {
        const response = await controller.signup(ctx);
      },
      {
        name: 'QueryFailedError',
      });
  });

  it('should not return an QueryFailedError when we does not send a valid username', async () => {
    const ctx = new Context({
      body: {
        'email': 'jhondoe@test.com',
        'username': 'jd',
        'password': 'thescsuperscretpassword123',
      }
    });
    await rejects(
      async () => {
        const response = await controller.signup(ctx);
      },
      {
        name: 'QueryFailedError',
      });
  });
});
