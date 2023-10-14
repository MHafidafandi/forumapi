const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response and persisted thread', async () => {
      const requestPayload = {
        title: 'proyek pertama',
        body: 'Hallo Gaes',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });

      const { accessToken } = JSON.parse(responseAuth.payload).data;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        body: 'Hallo Gaes',
      };
      const server = await createServer(container);

      // Action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });

      const { accessToken } = JSON.parse(responseAuth.payload).data;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat menambahkan thread baru karena data tidak sesuai'
      );
    });
  });

  it('should response 400 when request payload not meet data type specification', async () => {
    // Arrange
    const requestPayload = {
      title: true,
      body: {},
    };
    const server = await createServer(container);

    // Action
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username: 'dicoding', password: 'secret' },
    });

    const { accessToken } = JSON.parse(responseAuth.payload).data;

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual(
      'tidak dapat menambahkan thread baru karena tipe data tidak sesuai'
    );
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response and persisted thread detail and comment', async () => {
      const server = await createServer(container);

      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-hafid', username: 'hafid' });
      await UsersTableTestHelper.addUser({ id: 'user-afandi', username: 'afandi' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-hafid' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        owner: 'user-afandi',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-345',
        threadId,
        owner: 'user-afandi',
        date: '2016',
      });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
    });
  });
});
