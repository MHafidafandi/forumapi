const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'reply comment',
      commentId: 'comment-123',
      userId: 'user-hafid',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: {},
      commentId: 123,
      owner: true,
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should should create AddReply object correctly', () => {
    const payload = {
      content: 'reply comment',
      commentId: 'comment-123',
      owner: 'user-hafid',
    };

    const newReply = new NewReply(payload);
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
  });
});
