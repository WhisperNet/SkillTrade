import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
const promisifyScrypt = promisify(scrypt);
export class Password {
  static async toHash(givenPassword: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await promisifyScrypt(givenPassword, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
  static async toCheck(storedPassword: string, givenPassword: string) {
    const [password, salt] = storedPassword.split('.');
    const buf = (await promisifyScrypt(givenPassword, salt, 64)) as Buffer;
    return buf.toString('hex') === password;
  }
}
