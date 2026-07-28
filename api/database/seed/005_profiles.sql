-- 005_profiles.sql
-- Seed data for profiles table
-- Provides realistic profile data for development and demo purposes

INSERT INTO profiles (profile_id, first_name, last_name, email, phone, role, active) VALUES
  (1, 'Avery', 'Cole', 'avery.cole@octocat.example', '555-1001', 'admin', 1),
  (2, 'Jordan', 'Reed', 'jordan.reed@octocat.example', '555-1002', 'manager', 1),
  (3, 'Morgan', 'Lee', 'morgan.lee@octocat.example', '555-1003', 'staff', 1),
  (4, 'Riley', 'Shaw', 'riley.shaw@octocat.example', '555-1004', 'staff', 0);
