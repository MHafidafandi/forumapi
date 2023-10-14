class GetThreadUseCase {
  constructor({ threadsRepository, commentsRepository, repliesRepository }) {
    this._threadsRepository = threadsRepository;
    this._commentsRepository = commentsRepository;
    this._repliesRepository = repliesRepository;
  }
  async execute(useCaseParam) {
    const { threadId } = useCaseParam;
    const threadDetail = await this._threadsRepository.getThreadById(threadId);
    threadDetail.comments = await this._commentsRepository.getsCommentByThreadId(threadId);
    const repliesComment = await this._repliesRepository.getRepliesByThreadId(threadId);
    threadDetail.comments = this._checkIsDeletedComment(threadDetail.comments);
    threadDetail.comments = this._getRepliesForComments(threadDetail.comments, repliesComment);

    return threadDetail;
  }

  _checkIsDeletedComment(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      comments[i].content = comments[i].isDeleted
        ? '**komentar telah dihapus**'
        : comments[i].content;
      delete comments[i].isDeleted;
    }
    return comments;
  }

  _getRepliesForComments(comments, repliesComment) {
    for (let i = 0; i < comments.length; i += 1) {
      const commentId = comments[i].id;
      comments[i].replies = repliesComment
        .filter((reply) => reply.commentId === commentId)
        .map((replycom) => {
          replycom.content = replycom.isDeleted ? '**balasan telah dihapus**' : replycom.content;
          delete replycom.isDeleted;
          return replycom;
        });
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
