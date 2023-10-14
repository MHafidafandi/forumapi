const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const userIdFromAccessToken = 'user-hafid';

    const mockRepliesRepository = new RepliesRepository();

    mockRepliesRepository.checkReplyIsExist = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.verifyReplyAccess = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      repliesRepository: mockRepliesRepository,
    });

    await deleteReplyUseCase.execute(useCaseParams, userIdFromAccessToken);

    expect(mockRepliesRepository.checkReplyIsExist).toBeCalledWith(useCaseParams);
    expect(mockRepliesRepository.verifyReplyAccess).toBeCalledWith({
      ownerId: userIdFromAccessToken,
      replyId: useCaseParams.replyId,
    });
    expect(mockRepliesRepository.deleteReplyById).toBeCalledWith(useCaseParams.replyId);
  });
});
