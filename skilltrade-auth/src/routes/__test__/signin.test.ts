import request from 'supertest';
import { app } from '../../app';

it('response with cookies if given correct creds', async () => {
  await global.signin();
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
it('fails when either incorrect email or passowrd is suplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'notcreated@test.com',
      password: 'test',
    })
    .expect(400);
  await global.signin();
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'Incorrect',
    })
    .expect(400);
});
