const NewComment = require('../NewComment');
describe('NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment',
      threadId: 'thread-123',
      userId: 'user-hafid',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: {},
      threadId: 123,
      owner: true,
    };

    expect(() => new NewComment(payload)).toThrowError(
      'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should should create AddThread object correctly', () => {
    const payload = {
      content: 'comment',
      threadId: 'thread-123',
      owner: 'user-hafid',
    };

    const newComment = new NewComment(payload);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
