/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - profileId
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - role
 *         - active
 *       properties:
 *         profileId:
 *           type: integer
 *           description: The unique identifier for the profile
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         role:
 *           type: string
 *           enum: [admin, manager, staff]
 *           description: The user's role in the system
 *         active:
 *           type: boolean
 *           description: Whether the profile is active
 *     ProfileInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - role
 *         - active
 *       properties:
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         role:
 *           type: string
 *           enum: [admin, manager, staff]
 *           description: The user's role in the system
 *         active:
 *           type: boolean
 *           description: Whether the profile is active
 */
export const PROFILE_ROLES = ['admin', 'manager', 'staff'] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

export interface ProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: ProfileRole;
  active: boolean;
}

export interface Profile extends ProfileInput {
  profileId: number;
}
