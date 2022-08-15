const router = require('express').Router();
const pool = require('../../connection');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require('../middleware/validInfo');
const authorization = require('../middleware/authorization');
const { application } = require('express');

//Registring a user

router.post('/register', validInfo, async (req, res) => {
	try {
		//1. Destructure the req.body(name, email, password, degree, degree_completion)

		const { user_name, user_email, user_password, degree, degree_completion } =
			req.body;

		//2. Check if user exist (throw error)

		const user = await pool.query(
			'SELECT * FROM userAccount WHERE user_email = $1',
			[user_email]
		);

		if (user.rows.length !== 0) {
			return res.status(401).send('User already exists.');
		}

		//3. Bcrypt user password

		const saltRound = 10;
		const salt = await bcrypt.genSalt(saltRound);

		const bcryptPassword = await bcrypt.hash(user_password, salt);

		//4. Enter new user inside the database

		const newUser = await pool.query(
			'INSERT INTO userAccount (user_name, user_email, user_password, degree, degree_completion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[user_name, user_email, bcryptPassword, degree, degree_completion]
		);

		// res.json(newUser.rows[0]);

		//5. Generating jwt token

		const token = jwtGenerator(newUser.rows[0].user_id);
		res.json({ token });
	} catch (err) {
		console.error(err.message);
		res.status(501).send('Server Error!!');
	}
});

//Login Route

router.post('/login', validInfo, async (req, res) => {
	try {
		//1. Destructure req.body

		const { user_email, user_password } = req.body;

		//2. Check if user exist (If not then throw error)

		const user = await pool.query(
			'SELECT * FROM userAccount WHERE user_email = $1',
			[user_email]
		);

		if (user.rows.length === 0) {
			return res.status(401).json('Password or Email is incorrect');
		}
		//3. Check if incoming password is the same as the password in databse

		const validPassword = await bcrypt.compare(
			user_password,
			user.rows[0].user_password
		);
		if (!validPassword) {
			return res.status(401).json('Password or Email is incorrect');
		}

		//4. Then give jwt token

		const token = jwtGenerator(user.rows[0].user_id);
		res.json({ token });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error!!');
	}
});

router.get('/is-verify', authorization, async (req, res) => {
	try {
		res.json(true);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error!!');
	}
});

module.exports = router;
