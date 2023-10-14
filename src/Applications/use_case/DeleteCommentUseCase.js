class DeleteCommentUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }
  async execute(useCaseParams, ownerId) {
    const { threadId, commentId } = useCaseParams;
    await this._commentsRepository.checkCommentIsExist({ threadId, commentId });
    await this._commentsRepository.verifyCommentAccess({ ownerId, commentId });
    await this._commentsRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
