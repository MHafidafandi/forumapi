const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const pool = require('../../database/postgres/pool');
const RepliesRepositoryPostgres = require('../RepliesRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('RepliesRepositoryPostgres', () => {
  it('should be instance of RepliesRepository domain', () => {
    const repliesRepositoryPostgres = new RepliesRepositoryPostgres({}, {});
    expect(repliesRepositoryPostgres).toBeInstanceOf(RepliesRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      const userId = 'user-hafid';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'hafid' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addReply function', () => {
      it('should add reply to database', async () => {
        const newReply = {
          commentId: 'comment-123',
          content: 'reply comment',
          owner: 'user-hafid',
        };

        const fakeIdGenearator = () => '123';
        function fakeDateGenerator() {
          this.toISOString = () => '2023';
        }

        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(
          pool,
          fakeIdGenearator,
          fakeDateGenerator
        );

        const addedReply = await repliesRepositoryPostgres.addReply(newReply);
        const reply = await RepliesTableTestHelper.getReplyById(addedReply.id);

        expect(addedReply).toStrictEqual(
          new AddedReply({
            id: 'reply-123',
            content: newReply.content,
            owner: newReply.owner,
          })
        );

        expect(reply).toBeDefined();
      });
    });

    describe('deleteReplyById function', () => {
      it('should delete reply by id correctly', async () => {
        const newReply = {
          id: 'reply-123',
          commentId: 'comment-123',
        };

        await RepliesTableTestHelper.addReply({ id: newReply.id, commentId: newReply.commentId });
        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});
        await repliesRepositoryPostgres.deleteReplyById(newReply.id);
        const reply = await RepliesTableTestHelper.getReplyById(newReply.id);

        expect(reply.is_deleted).toEqual(true);
      });

      it('should throw error when reply does not exist', async () => {
        const addedReplyId = 'comment-123';
        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});

        expect(repliesRepositoryPostgres.deleteReplyById(addedReplyId)).rejects.toThrowError(
          'gagal mengahapus reply,reply tidak ditemukan'
        );
      });
    });

    describe('checkReplyIsExist function', () => {
      it('should resolve if reply exists', async () => {
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
        });

        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});

        await expect(
          repliesRepositoryPostgres.checkReplyIsExist({
            commentId: 'comment-123',
            replyId: 'reply-123',
          })
        ).resolves.not.toThrowError();
      });

      it('should reject when reply does not exist', async () => {
        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});

        await expect(
          repliesRepositoryPostgres.checkReplyIsExist({
            commentId: 'comment-123',
            replyId: 'notreply-456',
          })
        ).rejects.toThrowError(NotFoundError);
      });
    });

    describe('verifyReplyAccess function', () => {
      it('should resolve when user has authorization', async () => {
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          commentId: 'comment-123',
          owner: 'user-hafid',
        });
        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});
        await expect(
          repliesRepositoryPostgres.verifyReplyAccess({
            replyId: 'reply-123',
            ownerId: 'user-hafid',
          })
        ).resolves.toBeUndefined();
      });
      it('should reject when user has no authorization', async () => {
        await RepliesTableTestHelper.addReply({
          id: 'reply-456',
          commentId: 'comment-123',
          owner: 'user-hafid',
        });
        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});

        await expect(
          repliesRepositoryPostgres.verifyReplyAccess({
            commentId: 'comment-123',
            owner: 'user-456',
          })
        ).rejects.toThrowError('anda tidak mempunyai akses');
      });
    });

    describe('getRepliesByThreadId function', () => {
      it('it should return all of the replies in a thread', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-456', username: 'UserB' });

        await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-456' });

        await CommentsTableTestHelper.addComment({
          id: 'comment-456',
          owner: 'user-456',
          threadId: 'thread-456',
        });

        const replyA = {
          id: 'reply-234',
          commentId: 'comment-456',
          content: 'reply A',
          date: '2020',
          isDeleted: false,
        };

        const expectedReplies = [{ ...replyA, username: 'UserB' }];

        await RepliesTableTestHelper.addReply({ ...replyA, owner: 'user-456' });

        const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {}, {});

        const retrievedReplies = await repliesRepositoryPostgres.getRepliesByThreadId('thread-456');

        expect(retrievedReplies).toEqual(expectedReplies);
      });
    });
  });
});
