const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'comment',
    };
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedAddedComment = new AddedComment({
      content: useCasePayload.content,
      id: 'comment-123',
      owner: 'user-hafid',
    });

    const mockThreadsRepository = new ThreadsRepository();
    const mockCommentsRepository = new CommentsRepository();

    mockThreadsRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve({}));
    mockCommentsRepository.addComment = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new AddedComment({ id: 'comment-123', content: 'comment', owner: 'user-hafid' })
        )
      );

    const addCommentUseCase = new AddCommentUseCase({
      threadsRepository: mockThreadsRepository,
      commentsRepository: mockCommentsRepository,
    });

    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      useCaseParam,
      expectedAddedComment.owner
    );

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadsRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentsRepository.addComment).toBeCalledWith(
      new NewComment({
        content: useCasePayload.content,
        threadId: useCaseParam.threadId,
        owner: expectedAddedComment.owner,
      })
    );
  });
});
