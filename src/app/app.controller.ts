// Core
import { controller, IAppController } from '@foal/core';

// Local
import { AuthController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/api/auth', AuthController),
  ];
}
