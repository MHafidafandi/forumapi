const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadsRepository }) {
    this._threadsRepository = threadsRepository;
  }

  async execute(useCasePayload, owner) {
    const newThread = new AddThread({ ...useCasePayload, owner });
    return this._threadsRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
