const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./connection');
require('dotenv').config();

app.use(express.json()); // => req.body
var corsOptions = {
	origin: 'http://localhost:5000',
};
app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

function verifyToken(req, res, next) {
	if (!req.headers.authorization) {
		return res.status(401).send('Unauthorized');
	}
	let token = req.headers.authorization.split(' ')[1];
	if (token === 'null') {
		return res.status(401).send('Unauthorized');
	}
	let payload = jwt.verify(token, process.env.jwtSecret);
	if (!payload) {
		return res.status(401).send('Unauthorized');
	}
	req.userId = payload.subject;
	next();
}

//ROUTES//

//Register and Login routes
app.use('/auth', require('./app/routes/jwtAuth'));

//Home Route

app.use('/home', require('./app/routes/home'));

//Get all users
app.get('/users', (req, res) => {
	pool.query(`Select * from users`, (err, result) => {
		if (!err) {
			res.send(result.rows);
		}
	});
	pool.end;
});

//Get user by ID
app.get('/users/:user_id', (req, res) => {
	pool.query(
		`Select * from users where user_id=${req.params.user_id}`,
		(err, result) => {
			if (!err) {
				res.send(result.rows);
			}
		}
	);
	pool.end;
});

//Create user
app.post('/users', (req, res) => {
	//await
	const user = req.body;
	const newUser = `INSERT INTO users (id, name, email, university, community, experience, password, dob, address) 
	VALUES (${user.id}, 
		'${user.name}', 
		'${user.email}', 
		'${user.university}', 
		'${user.community}', 
		'${user.experience}', 
		'${user.password}', 
		'${user.dob}', 
		'${user.address}')`;
	pool.query(newUser, (err, result) => {
		if (!err) {
			res.send('Insertion was successful');
		} else {
			console.log(err.message);
		}
	});
	pool.end;
});

//Update user

app.put('/users/:id', (req, res) => {
	let user = req.body;
	let updateQuery = `update users
    set 
    name = '${user.name}',
    email = '${user.email}',
    university = '${user.university}',
    community = '${user.community}',
    experience = '${user.experience}',
    password = '${user.password}',
    dob = '${user.dob}',
    address = '${user.address}'
    where id = ${user.id}`;
	pool.query(updateQuery, (err, result) => {
		if (!err) {
			res.send('Updation was successful');
		} else {
			console.log(err.message);
		}
	});
	pool.end;
});

//Delete user

app.delete('/users/:id', (req, res) => {
	let insertQuery = `Delete from users where id= ${req.params.id}`;

	pool.query(insertQuery, (err, result) => {
		if (!err) {
			res.send('Deletion was successful');
		} else {
			console.log(err.message);
		}
	});
	pool.end;
});

app.listen(5000, () => {
	console.log('Server is listening on port 5000.');
});
