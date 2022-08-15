const Pool = require('pg').Pool;

const pool = new Pool({
	user: 'postgres',
	password: 'alee@9699',
	database: 'it_community',
	host: 'localhost',
	port: '5432',
});

module.exports = pool;
