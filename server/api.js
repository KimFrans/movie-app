const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios = require('axios');
const { json } = require('express');

module.exports = function (app, db) {

    function verifyToken(req, res, next) {

        const token = req.headers.authorization && req.headers.authorization.split(" ")[1] || req.body.token;
        console.log(!token);

        // console.log(req.headers.authorization);

        if (!token) {
            res.sendStatus(401);
            return;
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const { username } = decoded;

        // console.log(username);

        if (username && username) {
            next();
        } else {
            res.sendStatus(403);
        }

    }

    app.post('/api/signup', async function (req, res) {

        try {
            const { username, password } = req.body
            const checkDup = await db.oneOrNone('select name from users where name = $1', [username])
            let success

            if (checkDup == null) {
                bcrypt.hash(password, saltRounds).then(async function (hash) {
                    await db.none('insert into users (name, password) values ($1,$2)', [username, hash, 0])
                });
                success = 'successfully registered'
            }
            else {
                throw new Error("User already exists")
            }

            res.json({
                message: success
            });

        } catch (error) {
            res.json({
                message: error.message
            })

        }


    })


    app.post('/api/login', async function (req, res) {
        try {
            let message
            const { username, password } = req.body
            const user = await db.one('select * from users where name = $1', [username])
            const decrypt = await bcrypt.compare(password, user.password)

            if(username == ''){
                throw new Error("name required")
            }
            if(password == ''){
                throw new Error("password required")
            }

            if (!decrypt) {
                throw new Error("Wrong password or username")
            }
            
            const token = jwt.sign({
                username
            }, process.env.ACCESS_TOKEN_SECRET);


            res.json({
                token,
                user: {
                    ...user,
                    password: null
                },
                message

            });

        } catch (error) {
            res.json({
                message: error.message
            })

        }
    })


    app.get('https://api.themoviedb.org/3/search/movie?api_key=7feaca8fabb152ec6a6a5540ef986570&query:movie_name', async function (req, res) {

        // const movieName = req.params

        res.json({
            data: results
        })

    })

    app.post('/api/playlist/:movie', verifyToken, async function (req, res) {

        try {
            
            const { userId } = req.body
            const movie = req.params
            let message
    
            const check = await db.oneOrNone('select movie_id from user_movies where movie_id = $1', [movie.movie])
    
            if(check == null){
                await db.none('insert into user_movies (movie_id, usersId) values ($1, $2)', [movie.movie, userId])
                message = "added to favourites"
                console.log('false');
                // alert('added')
    
            }else{
                message = 'this movie has alredy been added to favourites'
    
            }
    
            res.json({
                message : message
            })

        } catch (error) {
            res.json({
                message: error.message
            })
            
        }

    })



    async function getMovieByID(id){

        const fetch = await
        axios
            .get(`https://api.themoviedb.org/3/movie/${id}?api_key=7feaca8fabb152ec6a6a5540ef986570&language=en-US`)
            .then(result => {
                return result.data
                // console.log(result)
            })
        return fetch
        
    }

    app.post('/api/favourite/' ,async function (req, res){
        try {
            const userId = req.body.userId
            // const favs = []
            const favs = await db.many('select movie_id from user_movies where usersid = $1', [userId])
            // console.log(favs);

            const movies = favs.map(async movie  => {
                return await getMovieByID(movie.movie_id)
            })

            // console.log(await Promise.all(movies));

            res.json({
                test: await Promise.all(movies)
            })
            
        } catch (error) {
            res.json({
                message : error.message
            })
            
        }
    });

    app.delete('/api/remove/:movieid', async function (req, res) {

		try {
			const movieid  = req.params;
            const getID = await db.oneOrNone('select movie_id from user_movies where movie_id = $1', [movieid.movieid])
            console.log(getID.movie_id);
            const del = getID.movie_id
			db.none('delete from user_movies where movie_id = $1', [del])
            let removed = "Removed from favourites"

			res.json({
                message : removed,
				status: 'success'
			})
		} catch (err) {
			// console.log(err);
			res.json({
				status: 'success',
				error : err.stack
			})
		}
	});

}