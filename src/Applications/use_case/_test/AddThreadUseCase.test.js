const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThread = require('../../../Domains/threads/entities/AddThread');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'proyek pertama',
      body: 'Hallo Gaes',
    };

    const mockAddThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-hafid',
    });

    const mockThreadsRepository = new ThreadsRepository();

    mockThreadsRepository.addThread = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new AddedThread({ id: 'thread-123', title: 'proyek pertama', owner: 'user-hafid' })
        )
      );

    const addThreadUseCase = new AddThreadUseCase({
      threadsRepository: mockThreadsRepository,
    });

    const addedThread = await addThreadUseCase.execute(useCasePayload, mockAddThread.owner);

    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: mockAddThread.id,
        title: mockAddThread.title,
        owner: mockAddThread.owner,
      })
    );

    expect(mockThreadsRepository.addThread).toBeCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: mockAddThread.owner,
      })
    );
  });
});
