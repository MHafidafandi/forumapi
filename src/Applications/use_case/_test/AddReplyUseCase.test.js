const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'reply comment',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userIdFromAccessToken = 'user-hafid';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: userIdFromAccessToken,
    });

    const mockCommentRepository = new CommentsRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockCommentRepository.checkCommentToThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockRepliesRepository.addReply = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedReply({
          id: 'reply-123',
          content: 'reply comment',
          owner: 'user-hafid',
        })
      )
    );

    const addReplyUseCase = new AddReplyUseCase({
      commentsRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      useCaseParams,
      userIdFromAccessToken
    );

    expect(addedReply).toStrictEqual(expectedAddedReply);

    expect(mockCommentRepository.checkCommentToThread).toBeCalledWith({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
    });

    expect(mockRepliesRepository.addReply).toBeCalledWith(
      new NewReply({
        threadId: useCaseParams.threadId,
        commentId: useCaseParams.commentId,
        owner: userIdFromAccessToken,
        content: useCasePayload.content,
      })
    );
  });
});
