import {describe, expect, it} from 'vitest';
import {idSchema, userSchema, usernameSchema} from './user';

describe('core/domain/user/user', () => {
  describe('idSchema', () => {
    it('should parse valid id', () => {
      expect(idSchema.parse('123e4567-e89b-12d3-a456-426614174000')).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error when id is invalid', () => {
      expect(() => idSchema.parse('123e4567-e89b-12d3-a456-42661417400')).toThrow();
    });
  })

  describe('usernameSchema', () => {
    it('should parse valid username', () => {
      expect(usernameSchema.parse('username')).toBe('username');
    });

    it('should throw error when username is number', () => {
      expect(() => usernameSchema.parse(123)).toThrow();
    })

    it('should throw error when username is empty', () => {
      expect(() => usernameSchema.parse('')).toThrow();
    })

    it('should throw error when username is too long', () => {
      expect(() => usernameSchema.parse('a'.repeat(256))).toThrow();
    })
  })

  describe('user', () => {
    it('should parse valid user', () => {
      expect(userSchema.parse({id: '123e4567-e89b-12d3-a456-426614174000', username: 'username'})).toEqual({id: '123e4567-e89b-12d3-a456-426614174000', username: 'username'});
    })

    it('should throw error when user is invalid', () => {
      expect(() => userSchema.parse({id: '123e4567-e89b-12d3-a456-42661417400', username: 'username'})).toThrow();
    })
  })
})
