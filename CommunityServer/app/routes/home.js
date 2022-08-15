const router = require('express').Router();
const pool = require('../../connection');
const authorization = require('../middleware/authorization');

router.get('/', authorization, async (req, res) => {
	try {
		const user = await pool.query(
			'SELECT user_name FROM userAccount WHERE user_id = $1',
			[req.user]
		);
		res.json(user.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).json('Server Error');
	}
});

module.exports = router;
