const supertest = require('supertest');
const PgPromise = require("pg-promise")
const express = require('express');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config()

const API = require('../api');
const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});
const db = pgp(DATABASE_URL);

API(app, db);

describe('The Movie API', function () {

	before(async function () {
		this.timeout(5000);
		await db.none(`delete from user_movies`);
		await db.none(`delete from users`);
		// await db.none(commandText)
	});

	it('should have a test method', async () => {
		const response = await supertest(app)
			.get('/api/test')
			.expect(200);

		assert.deepStrictEqual({ name: 'joe' }, response.body);

	});

    it('should create a users table in the database', async () => {
		const result = await db.one('select count(*) from users')
		assert.ok(result.count);
	});

	it('should create a user_movies table in the database', async () => {
		const result = await db.one('select count(*) from user_movies')
		assert.ok(result.count);
	});

	it('should be able to signup', async () => {
		const response = await supertest(app)
			.post('/api/signup')
			.send({
				username:'kim',
				password:'123'
			})

		const signup = response.body.message;
		assert.deepStrictEqual('successfully registered', signup);

	})


	it('should allow to add movie to favourite ', async () => {
		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpbSIsImlhdCI6MTY1NzE5NjUzNn0.PvBd8r-wrV1OB4WgaiWuZGKPdAIehGCbIHfwt7bOIvg'
		const response = await supertest(app)
			.post('/api/playlist/1')
			.set("Authorization", "Bearer " + `${token}`)
			.send({
				// userId:'1',
				movie_id:'1234'
			})
			
		const message = response.body.message;
		assert.deepStrictEqual('added to favourites', message);

	})

	it('should throw error if movie has already been added to favourites', async () => {
		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpbSIsImlhdCI6MTY1NzE5NjUzNn0.PvBd8r-wrV1OB4WgaiWuZGKPdAIehGCbIHfwt7bOIvg'
		const response = await supertest(app)
			.post('/api/playlist/1')
			.set("Authorization", "Bearer " + `${token}`)
			.send({
				movie_id:'1234'
			})
			

		const message = response.body.message;
		assert.deepStrictEqual('this movie has already been added to favourites', message);

	})

	it('should display favourites ', async () => {
		const response = await supertest(app)
			.post('/api/favourite/')
			.send({
				userId:'1',
				movie_id:'1234'
			})
			

		const message = response.body.test;
		assert.deepStrictEqual(message, message);

	})

	it('should delete a movie from favourites', async () => {

		const reponse = await supertest(app)
			.delete('/api/remove/1234')

		assert.equal('success', reponse.body.status)

	})


	after(() => {
		db.$pool.end();
	});
});