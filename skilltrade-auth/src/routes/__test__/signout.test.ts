import request from 'supertest';
import { app } from '../../app';

it('removes the cookie when requested', async () => {
  const reqCookie = await global.signin();

  const response = await request(app)
    .post('/api/users/signout')
    .set('Cookie', reqCookie)
    .send({})
    .expect(200);
  const resCookie = response.get('Set-Cookie');
  if (!resCookie) throw new Error('Undefined cookie');
  expect(resCookie[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
