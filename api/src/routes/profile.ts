/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: API endpoints for managing user profiles
 */

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create a new user profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid profile payload
 *       409:
 *         description: A profile with the same email already exists
 *
 * /api/profiles/{id}:
 *   get:
 *     summary: Get a user profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid profile ID
 *       404:
 *         description: Profile not found
 *   put:
 *     summary: Update a user profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid profile payload
 *       404:
 *         description: Profile not found
 *       409:
 *         description: A profile with the same email already exists
 *   delete:
 *     summary: Delete a user profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       204:
 *         description: Profile deleted successfully
 *       400:
 *         description: Invalid profile ID
 *       404:
 *         description: Profile not found
 */

import express from 'express';
import { PROFILE_ROLES, ProfileInput } from '../models/profile';
import { getProfilesRepository } from '../repositories/profilesRepo';
import { NotFoundError, ValidationError } from '../utils/errors';

const router = express.Router();
const profileFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'active'] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProfileId(value: string): number {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Profile ID must be a positive integer');
  }
  return id;
}

function requireStringField(payload: Record<string, unknown>, fieldName: keyof ProfileInput): string {
  const value = payload[fieldName];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function requireActiveField(payload: Record<string, unknown>): boolean {
  const value = payload.active;
  if (typeof value !== 'boolean') {
    throw new ValidationError('active must be a boolean');
  }
  return value;
}

function validateRole(role: string): ProfileInput['role'] {
  if (!PROFILE_ROLES.includes(role as ProfileInput['role'])) {
    throw new ValidationError(`role must be one of: ${PROFILE_ROLES.join(', ')}`);
  }
  return role as ProfileInput['role'];
}

function validateProfileInput(body: unknown): ProfileInput {
  if (!isRecord(body)) {
    throw new ValidationError('Profile payload must be an object');
  }

  const unexpectedFields = Object.keys(body).filter(
    (fieldName) => !profileFields.includes(fieldName as (typeof profileFields)[number]),
  );
  if (unexpectedFields.length > 0) {
    throw new ValidationError(`Unexpected field(s): ${unexpectedFields.join(', ')}`);
  }

  const email = requireStringField(body, 'email').toLowerCase();
  if (!emailPattern.test(email)) {
    throw new ValidationError('email must be a valid email address');
  }

  return {
    firstName: requireStringField(body, 'firstName'),
    lastName: requireStringField(body, 'lastName'),
    email,
    phone: requireStringField(body, 'phone'),
    role: validateRole(requireStringField(body, 'role')),
    active: requireActiveField(body),
  };
}

router.post('/', async (req, res, next) => {
  try {
    const repo = await getProfilesRepository();
    const createdProfile = await repo.create(validateProfileInput(req.body));
    res.status(201).json(createdProfile);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getProfilesRepository();
    const profileId = parseProfileId(req.params.id);
    const profile = await repo.findById(profileId);

    if (!profile) {
      throw new NotFoundError('Profile', profileId);
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getProfilesRepository();
    const profileId = parseProfileId(req.params.id);
    const updatedProfile = await repo.update(profileId, validateProfileInput(req.body));
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getProfilesRepository();
    const profileId = parseProfileId(req.params.id);
    await repo.delete(profileId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
