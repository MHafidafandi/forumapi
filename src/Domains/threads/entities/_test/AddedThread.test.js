const AddedThread = require('../AddedThread');

describe('An AddedThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'proyek pertama',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'thread-123',
      title: true,
      owner: 9090,
    };

    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'proyek pertama',
      owner: 'user-hafid',
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
