const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadsRepository, commentsRepository }) {
    this._threadsRepository = threadsRepository;
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload, useCaseParam, owner) {
    await this._threadsRepository.getThreadById(useCaseParam.threadId);
    const newComment = new NewComment({
      ...useCasePayload,
      threadId: useCaseParam.threadId,
      owner,
    });

    return await this._commentsRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
