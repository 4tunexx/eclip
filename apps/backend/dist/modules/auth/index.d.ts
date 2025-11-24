import { AuthController } from './controller';
import { AuthService } from './service';
import type { AppContext } from '../../context';
export declare const createAuthModule: (ctx: AppContext) => {
    controller: AuthController;
    service: AuthService;
};
