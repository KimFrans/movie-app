import axios from "axios";

export default function MovieApp() {
    const URL_BASE =  import.meta.env.VITE_SERVER_URL
    return {
        // info_message: '',
        error: false,
        nickname:'',
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
        logout:true,
        open:false,
        movie_name:'',
        movies:[],
        favourites:[],
        movieString:'',
        playlist:false,
        favesBtn:false,

        init(){
            // first check token in localstorage 
            //  - set open to true
            // - set login to true
            if(localStorage['token'] === undefined) {
                this.open = false;
                this.login = true;
            } else {
                this.open = true;
                this.login = false;
            }

        },
        

        register() {
            const { username, password, nickname } = this;
            if (this.username && this.password != '') {

                axios
                    .post(`${URL_BASE}/api/signup`, { username, password, nickname })
                    .then(r => r.data)
                    .then(
                        r => {
                            // this.usermessage = 'Successfully registered',
                            console.log(r);
                            console.log(r.message);
                            this.usermessage = r.message,
                                this.reg = false,
                                this.login = true,
                                console.log(r.success);

                            // console.log('Successfully registered')
                            // console.log(this.username, this.password)

                        })
                setTimeout(() => {
                    this.usermessage = ''
                    // this.unauthorised = false
                }, 3000);

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
                .post(`${URL_BASE}/api/login`, {
                    username, password
                })
                .then(r => r.data)
                .then(r => {

                    const { user, token } = r;
                    
                    this.usermessage = r.message

                    if (r.token) {
                        this.open = true;
                        this.login = false;
                        this.favesBtn = true;
                        localStorage.setItem('token', token)
                        localStorage.setItem('user', JSON.stringify(user))
                        console.log(user);

                        this.token = token;
                        this.loggedInUser = user;
                    }
                    // console.log(r);
                    // this.logout = true
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

        logoutFunction(){
            localStorage.clear();
            this.login = true;
            this.open = false;
            this.username = ''
            this.password = ''
        },

        getUser() {
            return JSON.parse(localStorage.getItem('user'))
    
        },

        searchMovie(){
            const {movie_name} = this
            console.log(movie_name);
            axios  
                .get(`https://api.themoviedb.org/3/search/movie?api_key=7feaca8fabb152ec6a6a5540ef986570&query=${movie_name}`)
                .then(r=>
                    {
                        console.log(r.data.results);
                        // console.log(r.data.results.backdrop_path);
                        // console.log(r.data.results.title);
                        this.movies = r.data.results
                    })
            
        },

        addToFavourite(movieName){

            let { userId} = this;

            const user = this.getUser()
            userId = user.id

            axios
                .post(`${URL_BASE}/api/playlist${movieName}`, { userId , token: localStorage.getItem('token') })
                .then(result => {
                    // console.log(result.data);
                    console.log(result);
                    // this.usermessage =result.error
                    // this.favourites = result.data.userMovies

                })

        },

        showFavs(){
            let { userId} = this;

            const user = this.getUser()
            userId = user.id
            // console.log(userId);

            axios
                .get(`${URL_BASE}/api/favourite/`, {userId, token: localStorage.getItem('token')})
                .then(r =>
                    {
                        // console.log(r.data.favs);
                        // this.favourites = r.data
                        console.log(r.data);
                    })

        },

        deleteMovie(movie){
            axios
                .delete(`http://localhost:2020/api/playlist${movie}/`)
                .then(
                    axios
                    .get('http://localhost:2020/api/favourite/playlist', {userId, token: localStorage.getItem('token')})
                    .then(r =>
                        {
                            // console.log(r.data.favs);
                            // this.favourites = r.data
                            console.log(r);
                        })
                )


        },

        
    }
}
