const CommentsRepository = require('../../Domains/comments/CommentsRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentsRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new this._dateGenerator().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1,$2,$3,$4,$5) RETURNING id,content,owner',
      values: [id, threadId, owner, content, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted=TRUE WHERE id=$1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('gagal mengahapus comment,comment tidak ditemukan');
    }
  }

  async getsCommentByThreadId(id) {
    const query = {
      text: 'SELECT comments.id,comments.content,comments.date,users.username,comments.is_deleted FROM comments INNER JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY comments.date ASC',
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows.map(
      (detail) =>
        new DetailComment({
          ...detail,
          isDeleted: detail.is_deleted,
        })
    );
  }

  async checkCommentIsExist({ threadId, commentId }) {
    const query = {
      text: 'SELECT 1 FROM comments INNER JOIN threads ON comments.thread_id = threads.id WHERE comments.id = $1 AND threads.id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentAccess({ ownerId, commentId }) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id=$1 AND owner=$2',
      values: [commentId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('anda tidak mempunyai akses');
    }
  }

  async checkCommentToThread({ threadId, commentId }) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id=$1 AND thread_id=$2',
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment dengan thread id tersebut tidak ditemukan tidak ditemukan');
    }
  }
}
module.exports = CommentRepositoryPostgres;
