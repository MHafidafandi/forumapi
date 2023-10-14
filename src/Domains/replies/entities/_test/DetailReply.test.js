const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      username: 'hafid',
      date: '2023',
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      commentId: {},
      username: {},
      date: true,
      content: {},
      isDeleted: 'false',
    };

    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create DetailReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      username: 'hafid',
      date: '2023',
      content: 'comment',
      isDeleted: false,
    };

    const detailReply = new DetailReply(payload);
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.commentId).toEqual(payload.commentId);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.isDeleted).toEqual(payload.isDeleted);
  });
});
