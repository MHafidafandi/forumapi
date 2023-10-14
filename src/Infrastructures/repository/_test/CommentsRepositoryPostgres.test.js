const CommentRepositoryPostgres = require('../CommentsRepositoryPostgres');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddedComment = require('./../../../Domains/comments/entities/AddedComment');
const DetailsComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentsRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentsRepositoryPostgres).toBeInstanceOf(CommentsRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      const userId = 'user-hafid';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'hafid' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    });

    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addComment function', () => {
      it('should add comment to database', async () => {
        const newComment = {
          content: 'comment',
          threadId: 'thread-123',
          owner: 'user-hafid',
        };

        const fakeIdGenearator = () => '123';
        function fakeDateGenerator() {
          this.toISOString = () => '2023';
        }

        const commentsRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          fakeIdGenearator,
          fakeDateGenerator
        );

        const addedComment = await commentsRepositoryPostgres.addComment(newComment);
        const comment = await CommentsTableTestHelper.getCommentById(addedComment.id);

        expect(addedComment).toStrictEqual(
          new AddedComment({
            id: 'comment-123',
            content: newComment.content,
            owner: newComment.owner,
          })
        );
        expect(comment).toBeDefined();
      });
    });

    describe('deleteCommentById', () => {
      it('should delete a comment at database by id', async () => {
        const addedComment = {
          id: 'comment-123',
          threadId: 'thread-123',
        };

        await CommentsTableTestHelper.addComment({
          id: addedComment.id,
          threadId: addedComment.threadId,
        });

        const commentsRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        await commentsRepositoryPostgres.deleteCommentById(addedComment.id);
        const comment = await CommentsTableTestHelper.getCommentById(addedComment.id);

        expect(comment.is_deleted).toEqual(true);
      });

      it('should throw erro when comment does not exist', async () => {
        const addedCommentId = 'comment-123';
        const commentsRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        expect(commentsRepositoryPostgres.deleteCommentById(addedCommentId)).rejects.toThrowError(
          'gagal mengahapus comment,comment tidak ditemukan'
        );
      });
    });

    describe('getsCommentByThreadId', () => {
      it('should return all comments from thread id', async () => {
        const comment1 = {
          id: 'comment-123',
          content: 'comment1',
          date: '2023',
          isDeleted: false,
        };
        const comment2 = {
          id: 'comment-456',
          content: 'comment2',
          date: '2023',
          isDeleted: false,
        };

        await CommentsTableTestHelper.addComment(comment1);
        await CommentsTableTestHelper.addComment(comment2);

        const commentsRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        const detailsComment = await commentsRepositoryPostgres.getsCommentByThreadId('thread-123');
        expect(detailsComment).toEqual([
          new DetailsComment({ ...comment1, username: 'hafid' }),
          new DetailsComment({ ...comment2, username: 'hafid' }),
        ]);
      });
    });

    describe('checkCommentIsExist', () => {
      it('should resolve if comment exists', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        await expect(
          commentRepositoryPostgres.checkCommentIsExist({
            threadId: 'thread-123',
            commentId: 'comment-123',
          })
        ).resolves.not.toThrowError();
      });

      it('should reject when comment does not exist', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        await expect(
          commentRepositoryPostgres.checkCommentIsExist({
            threadId: 'thread-123',
            commentId: 'comment-456',
          })
        ).rejects.toThrowError('comment tidak ditemukan');
      });

      it('should reject when comment is already deleted', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          isDeleted: true,
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        await expect(
          commentRepositoryPostgres.checkCommentIsExist({
            threadId: 'thread-123',
            commentId: 'comment-456',
          })
        ).rejects.toThrowError('comment tidak ditemukan');
      });
    });

    describe('verifyCommentAccess', () => {
      it('should resolve when user has authorization', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          threadId: 'thread-123',
          owner: 'user-hafid',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        await expect(
          commentRepositoryPostgres.verifyCommentAccess({
            commentId: 'comment-123',
            ownerId: 'user-hafid',
          })
        ).resolves.toBeUndefined();
      });

      it('should reject when user has no authorization', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-456',
          threadId: 'thread-123',
          owner: 'user-hafid',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        await expect(
          commentRepositoryPostgres.verifyCommentAccess({
            threadId: 'thread-123',
            owner: 'user-456',
          })
        ).rejects.toThrowError('anda tidak mempunyai akses');
      });
    });
    describe('checkCommentToThread', () => {
      it('should resolve when user has commentId and threadId', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          threadId: 'thread-123',
          owner: 'user-hafid',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        await expect(
          commentRepositoryPostgres.checkCommentToThread({
            threadId: 'thread-123',
            commentId: 'comment-123',
          })
        ).resolves.toBeUndefined();
      });

      it('should reject when user has no authorization', async () => {
        await CommentsTableTestHelper.addComment({
          id: 'comment-456',
          threadId: 'thread-123',
          owner: 'user-hafid',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
        await expect(
          commentRepositoryPostgres.checkCommentToThread({
            threadId: 'thread-123',
            owner: 'user-456',
          })
        ).rejects.toThrowError('comment dengan thread id tersebut tidak ditemukan tidak ditemukan');
      });
    });
  });
});
