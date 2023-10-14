const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'proyek pertama',
      body: 'Hallo Gaes',
      date: '2023',
      username: 'user-hafid',
      comments: [],
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'user 123',
        date: '2023',
        content: 'comment1',
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'user 456',
        date: '2023',
        content: 'comment2',
        isDeleted: false,
      }),
    ];

    const expectedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'reply comment1',
        date: '2023',
        username: 'user C',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'reply comment2',
        date: '2023',
        username: 'user D',
        isDeleted: false,
      }),
    ];

    const mockThreadsRepository = new ThreadsRepository();
    const mockCommentsRepository = new CommentsRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadsRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new DetailThread({
          id: 'thread-123',
          title: 'proyek pertama',
          body: 'Hallo Gaes',
          date: '2023',
          username: 'user-hafid',
          comments: [],
        })
      )
    );
    mockRepliesRepository.getRepliesByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        new DetailReply({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'reply comment1',
          date: '2023',
          username: 'user C',
          isDeleted: false,
        }),
        new DetailReply({
          id: 'reply-456',
          commentId: 'comment-456',
          content: 'reply comment2',
          date: '2023',
          username: 'user D',
          isDeleted: false,
        }),
      ])
    );

    mockCommentsRepository.getsCommentByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        new DetailComment({
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: false,
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'user 456',
          date: '2023',
          content: 'comment2',
          isDeleted: false,
        }),
      ])
    );

    const getThreadUseCase = new GetThreadUseCase({
      threadsRepository: mockThreadsRepository,
      commentsRepository: mockCommentsRepository,
      repliesRepository: mockRepliesRepository,
    });

    const { isDeleted: isDeletedCommentA, ...filteredComment1 } = expectedComments[0];
    const { isDeleted: isDeletedCommentB, ...filteredComment2 } = expectedComments[1];
    const {
      commentId: commentIdReply1,
      isDeleted: isDeletedReply1,
      ...filteredReplyDetails1
    } = expectedReplies[0];
    const {
      commentId: commentIdReply2,
      isDeleted: isDeletedReply2,
      ...filteredReplyDetails2
    } = expectedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredComment1, replies: [filteredReplyDetails1] },
      { ...filteredComment2, replies: [filteredReplyDetails2] },
    ];

    getThreadUseCase._checkIsDeletedComment = jest
      .fn()
      .mockImplementation(() => [filteredComment1, filteredComment2]);

    getThreadUseCase._getRepliesForComments = jest
      .fn()
      .mockImplementation(() => expectedCommentsAndReplies);

    const thread = await getThreadUseCase.execute(useCaseParam);

    expect(thread).toEqual(
      new DetailThread({
        ...expectedDetailThread,
        comments: expectedCommentsAndReplies,
      })
    );

    expect(mockThreadsRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentsRepository.getsCommentByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockRepliesRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);

    expect(getThreadUseCase._checkIsDeletedComment).toBeCalledWith(expectedComments);
    expect(getThreadUseCase._getRepliesForComments).toBeCalledWith(
      [filteredComment1, filteredComment2],
      expectedReplies
    );
  });

  describe('_checkIsDeletedComment', () => {
    it('should mark deleted comments correctly', async () => {
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();
      const mockRepliesRepository = new RepliesRepository();

      const getThreadUseCase = new GetThreadUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
        repliesRepository: mockRepliesRepository,
      });
      const comments = [
        new DetailComment({
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: true,
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'user 123',
          date: '2023',
          content: 'comment2',
          isDeleted: false,
        }),
      ];
      const updatedComments = await getThreadUseCase._checkIsDeletedComment(comments);
      expect(updatedComments).toEqual([
        new DetailComment({
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: '**komentar telah dihapus**',
          isDeleted: undefined,
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'user 123',
          date: '2023',
          content: 'comment2',
          isDeleted: undefined,
        }),
      ]);
    });
  });

  // Unit test untuk _getRepliesForComments
  describe('_getRepliesForComments', () => {
    it('should retrieve replies for comments correctly', async () => {
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();
      const mockRepliesRepository = new RepliesRepository();

      const getThreadUseCase = new GetThreadUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
        repliesRepository: mockRepliesRepository,
      });
      const comments = [
        new DetailComment({
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: undefined,
        }),
      ];
      const repliesComment = [
        new DetailReply({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'reply comment1',
          date: '2023',
          username: 'user C',
          isDeleted: true,
        }),
      ];
      const updatedComments = await getThreadUseCase._getRepliesForComments(
        comments,
        repliesComment
      );

      expect(updatedComments).toEqual([
        {
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: undefined,
          replies: [
            {
              id: 'reply-123',
              commentId: 'comment-123',
              content: '**balasan telah dihapus**',
              date: '2023',
              username: 'user C',
            },
          ],
        },
      ]);
    });
    it('should retrieve  not deleteed replies for comments correctly', async () => {
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();
      const mockRepliesRepository = new RepliesRepository();

      const getThreadUseCase = new GetThreadUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
        repliesRepository: mockRepliesRepository,
      });
      const comments = [
        new DetailComment({
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: undefined,
        }),
      ];
      const repliesComment = [
        new DetailReply({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'reply comment1',
          date: '2023',
          username: 'user C',
          isDeleted: false,
        }),
      ];
      const updatedComments = await getThreadUseCase._getRepliesForComments(
        comments,
        repliesComment
      );

      expect(updatedComments).toEqual([
        {
          id: 'comment-123',
          username: 'user 123',
          date: '2023',
          content: 'comment1',
          isDeleted: undefined,
          replies: [
            {
              id: 'reply-123',
              commentId: 'comment-123',
              content: 'reply comment1',
              date: '2023',
              username: 'user C',
            },
          ],
        },
      ]);
    });
  });
});
