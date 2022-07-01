import axios from "axios";

export default function MovieApp() {
    // const URL_BASE =  import.meta.env.VITE_SERVER_URL
    return {
        // info_message: '',
        error: false,
        nickname: '',
        login: true,
        loginBtn: '',
        username: '',
        password: '',
        open: false,
        token: '',
        decoded: '',
        reg: false,
        usermessage: '',
        hide: true,
        unauthorised: false,
        heading: true,
        hashPassword: '',
        loginLink: '',
        regLink: '',
        loggedInUser: {},
        logout: false,
        open: false,
        movie_name: '',
        movies: [],
        favourites: [],
        movieString: '',
        playlist: false,
        favesBtn: false,
        search:false,

        init() {
            // first check token in localstorage 
            //  - set open to true
            // - set login to true
            if (localStorage['token'] === undefined) {
                this.open = false;
                this.login = true;
            } else {
                this.open = true;
                this.login = false;
                this.logout = true;
                this.favesBtn = true;
                
                // this.playlist = true
            }

        },


        register() {
            const { username, password } = this;
            if (this.username && this.password != '') {

                axios
                    .post(`http://localhost:2020/api/signup`, { username, password })
                    .then(r => r.data)
                    .then(
                        r => {
                            // this.usermessage = 'Successfully registered',
                            console.log(r);
                            console.log(r.message);
                            this.usermessage = r.message,
                                this.reg = false,
                                this.login = true,
                                console.log(r.message);

                            // console.log('Successfully registered')
                            // console.log(this.username, this.password)

                            setTimeout(() => {
                                this.usermessage = ''
                                // this.unauthorised = false
                            }, 3000);
                        })

                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                this.username = ''
                this.password = ''


                // });
            }
            else {
                this.usermessage = 'Please enter a username!'
                this.unauthorised = true
                setTimeout(() => {
                    this.usermessage = ''
                    // this.unauthorised = true
                }, 3000);
            }

        },

        loginFunction() {
            const { username, password } = this;
            
            axios
                .post(`http://localhost:2020/api/login`, {
                    username, password
                })
                .then(r => r.data)
                .then(r => {
                    console.log(r.message);

                    const { user, token } = r;

                    this.usermessage = r.message
                    this.unauthorised=true

                    if (r.token) {
                        this.open = true;
                        this.login = false;
                        this.playlist=true;
                        this.favesBtn = true;
                        this.search=true;
                        this.logout=true;
                        localStorage.setItem('token', token)
                        localStorage.setItem('user', JSON.stringify(user))
                        console.log(user);

                        this.token = token;
                        // this.loggedInUser = user;
                    }
                    // console.log(r);
                    // this.logout = true
                    setTimeout(() => {
                        this.usermessage = ''
                    }, 3000)
                        let { userId} = this;
                        const userLocal = this.getUser()
                        userId = userLocal.id

                    axios
                        .post('http://localhost:2020/api/favourite', {userId})
                        .then(r=>{
                            console.log(r.data.test);
                            this.favourites = r.data.test
                            // console.log(this.favourites)

                        })
                    
                }).catch(e => console.log(e)) // display error message const { username, password } = this;


        },

        loginScreen() {
            this.login = true
            this.reg = false

        },

        registerScreen() {
            this.login = false
            this.reg = true
        },

        logoutFunction() {
            localStorage.clear();
            this.login = true;
            this.open = false;
            this.playlist = false;
            this.username = ''
            this.password = ''
            this.logout = false
            this.favesBtn = false
            this.search = false
        },

        getUser() {
            return JSON.parse(localStorage.getItem('user'))

        },

        searchMovie() {
            const { movie_name } = this
            console.log(movie_name);
            axios
                .get(`https://api.themoviedb.org/3/search/movie?api_key=7feaca8fabb152ec6a6a5540ef986570&query=${movie_name}`)
                .then(r => {
                    console.log(r.data.results);
                    // console.log(r.data.results.backdrop_path);
                    // console.log(r.data.results.title);
                    this.movies = r.data.results
                })

        },

        addToFavourite(movieID) {

            let { userId } = this;

            const user = this.getUser()
            userId = user.id
            // this.playlist=true

            axios
                .post(`http://localhost:2020/api/playlist/${movieID}`, { userId, token: localStorage.getItem('token') })
                .then(r=>{
                    console.log(r.data.message);
                    this.usermessage = r.data.message

                    setTimeout(() => {
                        this.usermessage = ''
                    }, 3000)
                    
                    axios
                        .post('http://localhost:2020/api/favourite', {userId})
                        .then(r=>{
                            console.log(r.data.test);
                            this.favourites = r.data.test
                            // console.log(this.favourites)

                        })
                
                })
                    

        },

        showFavs() {
            let { userId} = this;

            const user = this.getUser()
            userId = user.id
            this.playlist=true
            // console.log(userId);

                    axios
                        .post('http://localhost:2020/api/favourite', {userId})
                        .then(r=>{
                            console.log(r.data.test);
                            this.favourites = r.data.test
                            // console.log(this.favourites)

                        })
                
        },

        deleteMovie(movieid) {
            let { userId} = this;

            const user = this.getUser()
            userId = user.id

            axios
                .delete(`http://localhost:2020/api/remove/${movieid}/`)
                .then(r=>{
                    console.log(r.data.message);
                    this.usermessage = r.data.message
                    this.unauthorised = true
                    
                    axios
                        .post('http://localhost:2020/api/favourite', {userId})
                        .then(r=>{
                            console.log(r.data.test);
                            this.favourites = r.data.test
                            // console.log(this.favourites)

                        })
                    // this.favourites = r.data
                    setTimeout(() => {
                        this.usermessage = ''
                    }, 3000)
                })

        },


    }
}
