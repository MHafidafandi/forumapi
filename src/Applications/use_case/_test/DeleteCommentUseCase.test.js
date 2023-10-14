const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userIdFromAccessToken = 'user-hafid';

    const mockCommentsRepository = new CommentsRepository();

    mockCommentsRepository.checkCommentIsExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.verifyCommentAccess = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentsRepository: mockCommentsRepository,
    });

    await deleteCommentUseCase.execute(useCaseParams, userIdFromAccessToken);

    expect(mockCommentsRepository.checkCommentIsExist).toBeCalledWith({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
    });
    expect(mockCommentsRepository.verifyCommentAccess).toBeCalledWith({
      ownerId: userIdFromAccessToken,
      commentId: useCaseParams.commentId,
    });
    expect(mockCommentsRepository.deleteCommentById).toBeCalledWith(useCaseParams.commentId);
  });
});
