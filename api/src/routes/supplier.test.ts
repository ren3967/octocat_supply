import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter from './supplier';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Supplier API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/suppliers', supplierRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new supplier', async () => {
    const newSupplier = {
      name: 'Acme Corp',
      description: 'A reliable parts supplier',
      contactPerson: 'John Smith',
      email: 'jsmith@acme.com',
      phone: '555-0300',
      active: 1,
      verified: 1,
    };
    const response = await request(app).post('/suppliers').send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newSupplier.name);
    expect(response.body.email).toBe(newSupplier.email);
    expect(response.body.supplierId).toBeDefined();
  });

  it('should get all suppliers', async () => {
    const response = await request(app).get('/suppliers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a supplier by ID', async () => {
    const newSupplier = {
      name: 'Beta Supplies',
      description: 'Secondary supplier',
      contactPerson: 'Jane Doe',
      email: 'jdoe@beta.com',
      phone: '555-0400',
      active: 1,
      verified: 0,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
    expect(response.body.name).toBe('Beta Supplies');
  });

  it('should update a supplier by ID', async () => {
    const newSupplier = {
      name: 'Original Supplier',
      description: 'Original description',
      contactPerson: 'Bob Jones',
      email: 'bjones@original.com',
      phone: '555-0500',
      active: 1,
      verified: 0,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const updatedSupplier = {
      ...newSupplier,
      name: 'Updated Supplier',
      verified: 1,
    };
    const response = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Supplier');
    expect(response.body.verified).toBe(true);
  });

  it('should delete a supplier by ID', async () => {
    const newSupplier = {
      name: 'Delete Me Supplier',
      description: 'This supplier will be deleted',
      contactPerson: 'Delete Person',
      email: 'delete@supplier.com',
      phone: '555-9999',
      active: 0,
      verified: 0,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for a non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating a non-existing supplier', async () => {
    const response = await request(app).put('/suppliers/999').send({
      name: 'Ghost Supplier',
      description: 'Does not exist',
      contactPerson: 'Nobody',
      email: 'nobody@ghost.com',
      phone: '000-0000',
      active: 0,
      verified: 0,
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing supplier', async () => {
    const response = await request(app).delete('/suppliers/999');
    expect(response.status).toBe(404);
  });

  it('should return the status of an active supplier', async () => {
    const newSupplier = {
      name: 'Active Supplier',
      description: 'An active verified supplier',
      contactPerson: 'Carol White',
      email: 'cwhite@active.com',
      phone: '555-0600',
      active: 1,
      verified: 1,
    };
    const createResponse = await request(app).post('/suppliers').send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(['INACTIVE', 'APPROVED', 'PENDING']).toContain(response.body.status);
  });

  it('should return 404 for status of a non-existing supplier', async () => {
    const response = await request(app).get('/suppliers/999/status');
    expect(response.status).toBe(404);
  });
});
