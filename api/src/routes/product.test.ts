import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter from './product';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Product API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier id 1
    const db = await getDatabase();
    await db.run(
      'INSERT INTO suppliers (supplier_id, name, description, contact_person, email, phone, active, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 'Test Supplier', 'A test supplier', 'Alice', 'alice@test.com', '555-0100', 1, 1]
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/products', productRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new product', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Widget Alpha',
      description: 'A high-quality widget',
      price: 9.99,
      sku: 'WGT-001',
      unit: 'piece',
      imgName: 'widget-alpha.png',
    };
    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newProduct);
    expect(response.body.productId).toBeDefined();
  });

  it('should get all products', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Widget Beta',
      description: 'Another widget',
      price: 14.99,
      sku: 'WGT-002',
      unit: 'piece',
      imgName: 'widget-beta.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.productId).toBe(productId);
    expect(response.body.name).toBe('Widget Beta');
  });

  it('should update a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Widget Original',
      description: 'Original description',
      price: 5.00,
      sku: 'WGT-003',
      unit: 'piece',
      imgName: 'widget-original.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const updatedProduct = {
      ...newProduct,
      name: 'Widget Updated',
      price: 7.50,
    };
    const response = await request(app).put(`/products/${productId}`).send(updatedProduct);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Widget Updated');
    expect(response.body.price).toBe(7.50);
  });

  it('should delete a product by ID', async () => {
    const newProduct = {
      supplierId: 1,
      name: 'Widget Delete Me',
      description: 'To be deleted',
      price: 1.00,
      sku: 'WGT-DEL',
      unit: 'piece',
      imgName: 'widget-delete.png',
    };
    const createResponse = await request(app).post('/products').send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).delete(`/products/${productId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for a non-existing product', async () => {
    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
  });

  it('should return 404 when updating a non-existing product', async () => {
    const response = await request(app).put('/products/999').send({
      supplierId: 1,
      name: 'Ghost Product',
      description: 'Does not exist',
      price: 0,
      sku: 'GHOST',
      unit: 'piece',
      imgName: 'ghost.png',
    });
    expect(response.status).toBe(404);
  });

  it('should return 404 when deleting a non-existing product', async () => {
    const response = await request(app).delete('/products/999');
    expect(response.status).toBe(404);
  });
});
