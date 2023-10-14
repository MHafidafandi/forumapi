const AddThread = require('../AddThread');

describe('An AddThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'proyek pertama',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: true,
      body: 9090,
      owner: [],
    };

    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddThread object correctly', () => {
    const payload = {
      title: 'proyek pertama',
      body: 'Hallo Gaes',
      owner: 'user-hafid',
    };

    const { title, body } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
