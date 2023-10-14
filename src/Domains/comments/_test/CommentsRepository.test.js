const CommentsRepository = require('../CommentsRepository');

describe('A CommentsRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const commentsRepository = new CommentsRepository();

    await expect(commentsRepository.addComment({})).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentsRepository.getsCommentByThreadId('')).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );

    await expect(commentsRepository.deleteCommentById('')).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentsRepository.checkCommentIsExist({})).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentsRepository.verifyCommentAccess({})).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentsRepository.checkCommentToThread({})).rejects.toThrowError(
      'COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });
});
