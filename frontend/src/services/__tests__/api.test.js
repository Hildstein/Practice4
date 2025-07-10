// Mock axios before importing our API service
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import { authAPI, userAPI, vacancyAPI, applicationAPI } from '../api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('authAPI', () => {
    it('should have login method', () => {
      expect(typeof authAPI.login).toBe('function');
    });

    it('should have registerCandidate method', () => {
      expect(typeof authAPI.registerCandidate).toBe('function');
    });

    it('should have registerEmployer method', () => {
      expect(typeof authAPI.registerEmployer).toBe('function');
    });
  });

  describe('userAPI', () => {
    it('should have getProfile method', () => {
      expect(typeof userAPI.getProfile).toBe('function');
    });

    it('should have updateProfile method', () => {
      expect(typeof userAPI.updateProfile).toBe('function');
    });

    it('should have getUsers method', () => {
      expect(typeof userAPI.getUsers).toBe('function');
    });
  });

  describe('vacancyAPI', () => {
    it('should have getVacancies method', () => {
      expect(typeof vacancyAPI.getVacancies).toBe('function');
    });

    it('should have getVacancy method', () => {
      expect(typeof vacancyAPI.getVacancy).toBe('function');
    });

    it('should have createVacancy method', () => {
      expect(typeof vacancyAPI.createVacancy).toBe('function');
    });

    it('should have updateVacancy method', () => {
      expect(typeof vacancyAPI.updateVacancy).toBe('function');
    });

    it('should have deleteVacancy method', () => {
      expect(typeof vacancyAPI.deleteVacancy).toBe('function');
    });
  });

  describe('applicationAPI', () => {
    it('should have getApplications method', () => {
      expect(typeof applicationAPI.getApplications).toBe('function');
    });

    it('should have getApplication method', () => {
      expect(typeof applicationAPI.getApplication).toBe('function');
    });

    it('should have createApplication method', () => {
      expect(typeof applicationAPI.createApplication).toBe('function');
    });

    it('should have updateApplicationStatus method', () => {
      expect(typeof applicationAPI.updateApplicationStatus).toBe('function');
    });

    it('should have withdrawApplication method', () => {
      expect(typeof applicationAPI.withdrawApplication).toBe('function');
    });

    it('should have deleteApplication method', () => {
      expect(typeof applicationAPI.deleteApplication).toBe('function');
    });
  });
});