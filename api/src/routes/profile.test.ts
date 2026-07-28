import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import profileRouter from './profile';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

const validProfile = {
  firstName: 'Taylor',
  lastName: 'Morgan',
  email: 'taylor.morgan@example.com',
  phone: '555-0101',
  role: 'manager',
  active: true,
} as const;

describe('Profile API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    app = express();
    app.use(express.json());
    app.use('/profiles', profileRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new profile', async () => {
    const response = await request(app).post('/profiles').send(validProfile);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(validProfile);
    expect(response.body.profileId).toBeDefined();
  });

  it('should get a profile by ID', async () => {
    const createResponse = await request(app).post('/profiles').send(validProfile);

    const response = await request(app).get(`/profiles/${createResponse.body.profileId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(createResponse.body);
  });

  it('should update a profile by ID', async () => {
    const createResponse = await request(app).post('/profiles').send(validProfile);

    const updatedProfile = {
      ...validProfile,
      firstName: 'Jordan',
      email: 'jordan.morgan@example.com',
      role: 'admin',
      active: false,
    };

    const response = await request(app)
      .put(`/profiles/${createResponse.body.profileId}`)
      .send(updatedProfile);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(updatedProfile);
  });

  it('should delete a profile by ID', async () => {
    const createResponse = await request(app).post('/profiles').send(validProfile);

    const deleteResponse = await request(app).delete(`/profiles/${createResponse.body.profileId}`);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/profiles/${createResponse.body.profileId}`);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject duplicate emails', async () => {
    await request(app).post('/profiles').send(validProfile);

    const response = await request(app).post('/profiles').send(validProfile);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('should validate the route parameter and payload', async () => {
    const invalidIdResponse = await request(app).get('/profiles/not-a-number');
    expect(invalidIdResponse.status).toBe(400);
    expect(invalidIdResponse.body.error.code).toBe('VALIDATION_ERROR');

    const invalidPayloadResponse = await request(app).post('/profiles').send({
      ...validProfile,
      email: 'invalid-email',
    });
    expect(invalidPayloadResponse.status).toBe(400);
    expect(invalidPayloadResponse.body.error.code).toBe('VALIDATION_ERROR');
  });
});
