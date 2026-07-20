import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilesRepository } from './profilesRepo';
import { NotFoundError } from '../utils/errors';
import { ProfileInput } from '../models/profile';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('ProfilesRepository', () => {
  let repository: ProfilesRepository;
  let mockDb: {
    db: Record<string, never>;
    run: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    all: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  const profileInput: ProfileInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '555-0001',
    role: 'manager',
    active: true,
  };

  beforeEach(() => {
    mockDb = {
      db: {},
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    repository = new ProfilesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a profile when found', async () => {
      mockDb.get.mockResolvedValue({
        profile_id: 1,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-0001',
        role: 'manager',
        active: 1,
      });

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM profiles WHERE profile_id = ?', [1]);
      expect(result).toEqual({
        profileId: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-0001',
        role: 'manager',
        active: true,
      });
    });

    it('should return null when the profile does not exist', async () => {
      mockDb.get.mockResolvedValue(undefined);

      await expect(repository.findById(999)).resolves.toBeNull();
    });

    it('should convert database failures into repository errors', async () => {
      mockDb.get.mockRejectedValue(new Error('lookup failed'));

      await expect(repository.findById(1)).rejects.toThrow('Database operation failed: lookup failed');
    });
  });

  describe('create', () => {
    it('should create a profile and return the created record', async () => {
      mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
      mockDb.get.mockResolvedValue({
        profile_id: 3,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-0001',
        role: 'manager',
        active: 1,
      });

      const result = await repository.create(profileInput);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO profiles (first_name, last_name, email, phone, role, active) VALUES (?, ?, ?, ?, ?, ?)',
        ['Jane', 'Doe', 'jane.doe@example.com', '555-0001', 'manager', true],
      );
      expect(result.profileId).toBe(3);
      expect(result.active).toBe(true);
    });

    it('should throw when the created profile cannot be reloaded', async () => {
      mockDb.run.mockResolvedValue({ lastID: 3, changes: 1 });
      mockDb.get.mockResolvedValue(undefined);

      await expect(repository.create(profileInput)).rejects.toThrow(
        'Database operation failed: Failed to retrieve created profile',
      );
    });
  });

  describe('update', () => {
    it('should update an existing profile and return the updated record', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        profile_id: 1,
        first_name: 'Janet',
        last_name: 'Doe',
        email: 'janet.doe@example.com',
        phone: '555-0001',
        role: 'admin',
        active: 0,
      });

      const result = await repository.update(1, {
        firstName: 'Janet',
        lastName: 'Doe',
        email: 'janet.doe@example.com',
        phone: '555-0001',
        role: 'admin',
        active: false,
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE profiles SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, active = ? WHERE profile_id = ?',
        ['Janet', 'Doe', 'janet.doe@example.com', '555-0001', 'admin', false, 1],
      );
      expect(result).toEqual({
        profileId: 1,
        firstName: 'Janet',
        lastName: 'Doe',
        email: 'janet.doe@example.com',
        phone: '555-0001',
        role: 'admin',
        active: false,
      });
    });

    it('should throw NotFoundError when the profile does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, profileInput)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete an existing profile', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM profiles WHERE profile_id = ?', [1]);
    });

    it('should throw NotFoundError when deleting a missing profile', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when the profile exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      await expect(repository.exists(1)).resolves.toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM profiles WHERE profile_id = ?',
        [1],
      );
    });

    it('should return false when the profile does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      await expect(repository.exists(999)).resolves.toBe(false);
    });
  });
});
