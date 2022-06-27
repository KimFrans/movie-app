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

            let message
            const { username, password } = req.body
            const checkDup = await db.oneOrNone('select name from users where name = $1', [[username]])

                ((checkDup == null) ? bcrypt.hash(password, saltRounds).then(async function (hash) { await db.none('insert into users (name, password) values ($1,$2)', [username, hash, 0]) }) : message = "User already exists")

            res.json({
                message: message
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
                token

            });

        } catch (error) {
            res.json({
                message: error.message
            })

        }
    })


    app.get('https://api.themoviedb.org/3/search/movie?api_key=7feaca8fabb152ec6a6a5540ef986570&query:movie_name', async function (req, res) {

        const movieName = req.params

    })

    app.post('/api/playlist', verifyToken, async function (req, res) {

        const {username } = req.body

        const userInfo = await db.oneOrNone('select id from users where name = $1', [username])
        // const movieId = await db.oneOrNone('select movie_id from user_movies where movie_id =$1', [userInfo])
        const movieId = await db.oneOrNone('insert into user_movies where movie_id = $1', [userInfo])
        // const allMovies = await db.oneOrNone('select movie_name from user_movies where id = $1', [movieId])
        


    })

}