const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ commentsRepository, repliesRepository }) {
    this._commentsRepository = commentsRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload, useCaseParams, owner) {
    await this._commentsRepository.checkCommentToThread(useCaseParams);
    const reply = new NewReply({
      ...useCasePayload,
      ...useCaseParams,
      owner,
    });

    return await this._repliesRepository.addReply(reply);
  }
}
module.exports = AddReplyUseCase;
