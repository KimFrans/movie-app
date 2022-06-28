const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
            const { username, password, nickname } = req.body
            const checkDup = await db.oneOrNone('select name from users where name = $1', [username])
            let success

            if (checkDup == null) {
                bcrypt.hash(password, saltRounds).then(async function (hash) {
                    await db.none('insert into users (name, password, username) values ($1,$2,$3)', [username, hash, nickname, 0])
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

            if (!decrypt) {
                message = "Wrong password or username"
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

            });

        } catch (error) {
            res.json({
                message: error.message
            })

        }
    })


    app.get('https://api.themoviedb.org/3/search/movie?api_key=7feaca8fabb152ec6a6a5540ef986570&query:movie_name', async function (req, res) {

        const movieName = req.params

        res.json({
            data: results
        })

    })

    app.post('/api/playlist:movie', verifyToken, async function (req, res) {

        try {
            
            const { userId } = req.body
            const movie = req.params
            let error
    
            const check = await db.oneOrNone('select movie_name from user_movies where movie_name = $1', [movie.movie])
    
            if(check == null){
                await db.none('insert into user_movies (movie_name, movie_id) values ($1, $2)', [movie.movie, userId])
                error = "added"
                alert('added')
    
            }else{
                error = 'this movie has alredy been added to favourites'
    
            }
    
            res.json({
                messsage : error.error
            })

        } catch (error) {
            res.json({
                message: error.error
            })
            
        }



    })

    app.get('/api/favourite/' ,async function (req, res){
        try {
            const userId = req.body
            const favs = []
            favs = await db.many('select movie_name from user_movies where movie_id = $1', [userId])

            res.json({
                data: favs
            })
            
        } catch (error) {
            res.json({
                message : error.message
            })
            
        }
    })

    app.delete('/api/playlist/', async function (req, res) {

		try {
			const { movieName } = req.query;
			db.many('delete from user_movies where moive_name = $1', [movieName])

			res.json({
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