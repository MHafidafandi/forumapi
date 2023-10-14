const ThreadsRepository = require('../ThreadsRepository');

describe('A ThreadsRepository interface', () => {
  it('should throw error when invoke abstract behavior', () => {
    const threadsRepository = new ThreadsRepository();

    expect(() => threadsRepository.addThread({})).rejects.toThrowError(
      'THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    expect(() => threadsRepository.getThreadById('')).rejects.toThrowError(
      'THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });
});
