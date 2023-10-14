const RepliesRepository = require('../RepliesRepository');

describe('A RepliesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const repliesRepository = new RepliesRepository();

    await expect(repliesRepository.addReply({})).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(repliesRepository.getsReplyByCommentId('')).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );

    await expect(repliesRepository.deleteReplyById('')).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(repliesRepository.checkReplyIsExist({})).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(repliesRepository.verifyReplyAccess({})).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(repliesRepository.getRepliesByThreadId('')).rejects.toThrowError(
      'REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });
});
