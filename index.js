const Joi = require('joi');
const authorizaion = require('./middleware/authorization');
const express = require('express');
var mysql = require('mysql');
const uuid = require('uuid');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Express Middlewares
// Middleware for parsing requests
app.use(express.json());
app.use(authorizaion);

// MySQL config
var pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: 'Taskly',
	charset: 'utf8mb4_unicode_ci',
});

// const connection = mysql.createConnection({
// 	host: process.env.DB_HOST,
// 	user: process.env.DB_USER,
// 	password: process.env.DB_PASS,
// 	database: 'Taskly',
// 	charset: 'utf8mb4_unicode_ci',
// });

// Joi schema for event
const eventSchema = Joi.object({
	title: Joi.string().max(100).required(),
	description: Joi.string().max(255).required(),
	icon: Joi.string().required(),
	timeStart: Joi.date().required(),
	timeEnd: Joi.date().required(),
	isPinned: Joi.boolean().required().default(false),
});

app.get('/api/events', (req, res) => {
	sendRequest('SELECT * FROM events', res);
});

app.get('/api/events/:id', (req, res) => {
	const eventId = req.params.id;

	sendRequest(
		`SELECT * 
    FROM events 
    WHERE id=${eventId}`,
		res,
	);
});

app.post('/api/events', (req, res) => {
	const { error } = eventSchema.validate(req.body);
	if (error) {
		res.send(error.details[0].message);
		return;
	}

	const { title, description, timeStart, timeEnd, icon, isPinned } = req.body;
	const eventId = uuid.v1();

	sendRequest(
		`
        INSERT INTO events 
            (id, title, description, time_start, time_end, emoji, is_pinned)
        VALUES 
            ("${eventId}", "${title}", "${description}", "${timeStart}", "${timeEnd}", "${icon}", ${isPinned});
        `,
		res,
	);
});

// Need to open the tab with update version
app.put('/api/events/:id', (req, res) => {
	const { error } = eventSchema.validate(req.body);
	if (error) return res.send(error.details[0].message);

	const { title, description, timeStart, timeEnd, icon, isPinned } = req.body;
	const eventId = req.params.id;

	sendRequest(
		`
    UPDATE events 
    SET 
        title = "${title}", 
        description="${description}",
        time_start="${timeStart}", 
        time_end="${timeEnd}", 
        emoji="${icon}", 
        is_pinned=${isPinned}
    WHERE id="${eventId}"
    `,
		res,
	);
});

// Need to create a new lightbox
app.delete('/api/events/:id', (req, res) => {
	const eventId = req.params.id;

	sendRequest(
		`DELETE FROM events 
    WHERE id="${eventId}"`,
		res,
	);
});

function sendRequest(SQLString, res) {
	pool.getConnection((err, connection) => {
		if (err) {
			throw err;
		}

		connection.query(SQLString, (error, results) => {
			if (error) res.status(404).send(error);
			else res.send(results);
			connection.release();
		});
	});

	// connection.connect(() => console.log('DB connected'));

	// connection.query(SQLString, function (error, results) {
	// 	if (error) return res.status(404).send(error);
	// 	else res.send(results);
	// });

	// connection.end();
}

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Server started on port ${port}...`));
