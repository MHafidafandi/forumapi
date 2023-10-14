class DeleteReplyUseCase {
  constructor({ repliesRepository }) {
    this._repliesRepository = repliesRepository;
  }

  async execute(useCaseParams, ownerId) {
    await this._repliesRepository.checkReplyIsExist(useCaseParams);
    await this._repliesRepository.verifyReplyAccess({ ownerId, replyId: useCaseParams.replyId });
    await this._repliesRepository.deleteReplyById(useCaseParams.replyId);
  }
}

module.exports = DeleteReplyUseCase;
