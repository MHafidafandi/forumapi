const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const ThreadsRepositoryPostgres = require('../ThreadsRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('A ThreadsRepositoryPostgres', () => {
  it('should be instance of ThreadsRepository', () => {
    const threadsRepositoryPostgres = new ThreadsRepositoryPostgres({}, {});

    expect(threadsRepositoryPostgres).toBeInstanceOf(ThreadsRepository);
  });

  describe('Behavior test ThreadsRepositoryPostgres', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should persist register user and return registered user correctly', async () => {
        await UsersTableTestHelper.addUser({
          id: 'user-hafid',
          username: 'hafid',
          password: 'password',
          fullname: 'fullname',
        });

        const fakeThreadIdGenerator = (x = 10) => '123';
        function fakeDateGenerator() {
          this.toISOString = () => '2023';
        }

        const newThread = new AddThread({
          title: 'proyek pertama',
          body: 'Hallo Gaes',
          owner: 'user-hafid',
        });

        const threadRepositoryPostgres = new ThreadsRepositoryPostgres(
          pool,
          fakeThreadIdGenerator,
          fakeDateGenerator
        );

        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        const threads = await ThreadsTableTestHelper.getThreadById(addedThread.id);

        expect(addedThread).toStrictEqual(
          new AddedThread({
            id: `thread-${fakeThreadIdGenerator(10)}`,
            title: 'proyek pertama',
            owner: 'user-hafid',
          })
        );
        expect(threads).toBeDefined();
      });
    });

    describe('getThreadById function', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-hafid' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-hafid' });

        await expect(threadRepositoryPostgres.getThreadById('thread-456')).rejects.toThrowError(
          NotFoundError
        );
      });

      it('should return thread when thread is found', async () => {
        const newThread = {
          id: 'thread-123',
          title: 'proyek pertama',
          body: 'Hallo Gaes',
          owner: 'user-hafid',
          date: '2023',
        };
        const expectedThread = {
          id: 'thread-123',
          title: 'proyek pertama',
          date: '2023',
          username: 'hafid',
          body: 'Hallo Gaes',
        };
        const threadRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-hafid', username: expectedThread.username });
        await ThreadsTableTestHelper.addThread(newThread);

        const findedThread = await threadRepositoryPostgres.getThreadById('thread-123');

        expect(findedThread).toStrictEqual(expectedThread);
      });
    });
  });
});
