class CommentsRepository {
  async addComment(newComment) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getsCommentByThreadId(Id) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteCommentById(commentId) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkCommentIsExist({ threadId, commentId }) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyCommentAccess({ ownerId, commentId }) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
  async checkCommentToThread({ commentId, threadId }) {
    throw new Error('COMMENTS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentsRepository;
