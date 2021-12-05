const sqlite3 = require('sqlite3').verbose()

class Sqlite3Promise {
	constructor(db_name) {
		this.db = new sqlite3.Database(db_name);
	}
	Run(query, params = []) {
		return new Promise(async (resolve, reject) => {
			this.db.run(query, params, function(err) {
				if (err) return reject(err);
				resolve(this);
			})
		})
	}
	Get(query, params = []) {
		return new Promise(async (resolve, reject) => {
			this.db.get(query, params, (err, row) => {
				if (err) return reject(err);
				resolve(row);
			})
		})
	}
	All(query, params = []) {
		return new Promise(async (resolve, reject) => {
			this.db.all(query, params, (err, rows) => {
				if (err) return reject(err);
				return resolve(rows);
			})
		})
	}
}


module.exports = Sqlite3Promise;