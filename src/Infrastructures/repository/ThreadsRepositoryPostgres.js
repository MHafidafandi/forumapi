const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ThreadsRepository = require('../../Domains/threads/ThreadsRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadsRepositoryPostgres extends ThreadsRepository {
  constructor(pool, idGenerator, fakeDateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._fakeDateGenerator = fakeDateGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new this._fakeDateGenerator().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, date],
    };
    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads INNER JOIN users ON threads.owner = users.ID WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = ThreadsRepositoryPostgres;
