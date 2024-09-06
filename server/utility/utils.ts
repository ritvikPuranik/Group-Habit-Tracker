import Db from './dbUtils';
import Users from '../controllers/userController';

type Constructor<T = {}> = new (...args: any[]) => T;

class Utils {
    
}

function mixin<T extends Constructor, U>(target: T, ...sources: Constructor<U>[]): void {
  sources.forEach(source => {
    Object.assign(target.prototype, source.prototype);
  });
}

mixin(Utils, Db);//Can be extended to inherit from multiple classes

export default Utils;