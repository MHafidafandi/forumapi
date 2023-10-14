const DetailThread = require('../DetailThread');

describe('a DetailThread Enitity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'proyek pertama',
      body: 'Hallo Gaes',
      date: '2023',
    };

    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 345,
      title: 1984,
      body: {},
      date: 1980,
      username: {},
      comments: 'comments',
    };

    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create DetailThread object correctly', () => {
    const payload = {
      id: 'thread-1234',
      title: 'proyek pertama',
      body: 'Hallo Gaes',
      date: '2023',
      username: 'user-hafid',
      comments: [],
    };

    const { id, title, body, date, username, comments } = new DetailThread(payload);
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
