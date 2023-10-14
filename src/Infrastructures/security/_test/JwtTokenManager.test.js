const Jwt = require('@hapi/jwt');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken)).rejects.toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(refreshToken)).resolves.not.toThrow(
        InvariantError
      );
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action
      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Action & Assert
      expect(expectedUsername).toEqual('dicoding');
    });
  });

  describe('getTokenFromHeader function', () => {
    it('should get token from header correctly', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const header = 'Bearer accessToken';

      const token = await jwtTokenManager.getTokenFromHeader(header);

      expect(token).toEqual('accessToken');
    });

    it('should throw an error when no header authentication', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const header = '';

      expect(jwtTokenManager.getTokenFromHeader(header)).rejects.toThrowError(AuthenticationError);
    });
  });

  describe('verifyAccessToken function', () => {
    it('should throw an error when verification failed', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = jwtTokenManager.createAccessToken({ username: 'hafid' });

      await expect(jwtTokenManager.verifyAccessToken(accessToken)).rejects.toThrow(InvariantError);
    });
    it('should resolve the access token', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'hafid' });

      await expect(jwtTokenManager.verifyAccessToken(accessToken)).resolves.not.toThrow(
        InvariantError
      );
    });
  });
});
