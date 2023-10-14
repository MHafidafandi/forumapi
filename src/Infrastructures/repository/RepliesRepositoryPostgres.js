const RepliesRepository = require('../../Domains/replies/RepliesRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO replies VALUES($1,$2,$3,$4,$5) RETURNING id,content,owner',
      values: [id, commentId, owner, content, date],
    };
    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id=$1 RETURNING id',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('gagal mengahapus reply,reply tidak ditemukan');
    }
  }

  async checkReplyIsExist({ commentId, replyId }) {
    const query = {
      text: 'SELECT 1 FROM replies INNER JOIN comments ON replies.comment_id = comments.id WHERE replies.id = $1 AND comments.id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyAccess({ ownerId, replyId }) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id=$1 AND owner=$2',
      values: [replyId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('anda tidak mempunyai akses');
    }
  }

  async getRepliesByThreadId(id) {
    const query = {
      text: `SELECT replies.id, comments.id AS comment_id, 
              replies.is_deleted, replies.content, 
              replies.date, users.username 
              FROM replies 
              INNER JOIN comments ON replies.comment_id = comments.id
              INNER JOIN users ON replies.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(
      (reply) =>
        new DetailReply({
          ...reply,
          commentId: reply.comment_id,
          isDeleted: reply.is_deleted,
        })
    );
  }
}

module.exports = RepliesRepositoryPostgres;
