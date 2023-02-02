const searchBtn = document.getElementById('search-btn')
const inputEl = document.getElementById('search-input')
const moviesEl = document.getElementById('movies')
const darkModeEl = document.getElementById('dark-mode')
let mainDataArray = []
let watchlist = []
if (localStorage.getItem('watchlist')) {
    watchlist = JSON.parse(localStorage.getItem('watchlist'))
}

let theme = JSON.parse(sessionStorage.getItem("theme"))
console.log(theme)

document.addEventListener('click', async function (e) {
    if (e.target === searchBtn) {
        loading()
        let fetch = await fetchAPI(inputEl.value)
        if (fetch) {
            mainDataArray = await getMovie(fetch)
            moviesEl.innerHTML = render(mainDataArray)
        } else {
            sthWrong()
        }
    } else if (e.target.dataset.id) {
        console.log(e.target)
        if (!document.getElementById('watchlist')) {
            handleWatchlist(e.target)
        } else {
            deleteWatchlist(e.target)
        }
        setTimeout(() => {
            watchlistRender()
        }, 1500)
    } else if (e.target == darkModeEl) {
        theme = !theme
        sessionStorage.setItem("theme", JSON.stringify(theme));
        changeTheme(theme)
    }
})

function changeTheme(theme) {
    console.log(theme)
    const root = document.querySelector(':root');
    const setVariables = vars => Object.entries(vars).forEach(v => root.style.setProperty(v[0], v[1]));
    let value
    if (theme) {
        value = {
            '--BGC-SEARCHBAR': '#2E2E2F',
            '--TEXT-SEARCHBAR': '#A5A5A5',
            '--BTN-BGC': '#4B4B4B',
            '--BORDER-SEARCHBAR': '#2E2E2F',
            '--BGC': '#121212',
            '--I': '#2E2E2F',
            '--TEXT-COLOR': '#FFFFFF',
            '--PLOT': '#A5A5A5',
            '--BTN-BORDER': '#2E2E2F'

        }
    } else {
        value = {
            '--BGC-SEARCHBAR': '#FFFFFF',
            '--TEXT-SEARCHBAR': '#000000',
            '--BTN-BGC': '#F9FAFB',
            '--BORDER-SEARCHBAR': '#D1D5DB',
            '--BGC': '#FFFFFF',
            '--I': '#DFDDDD',
            '--TEXT-COLOR': '#000000',
            '--PLOT': '#6B7280',
            '--BTN-BORDER': '#D1D5DB'
        }
    }

    setVariables(value);
}

function sthWrong() {
    moviesEl.innerHTML = `<div class="start-exploring">
           <p>We can't find your movie</p>
        </div>`
}

function returnObj(id) {
    return mainDataArray.filter(item => item.imdbID === id)[0]
}

function handleWatchlist(target) {
    id = target.dataset.id
    if (!watchlist.some(watch => watch.imdbID == returnObj(id).imdbID)) {
        watchlist.push(returnObj(id))
        localStorage.setItem('watchlist', JSON.stringify(watchlist))
        target.innerHTML = '<i class="fa-solid fa-check"></i> Added'
    } else {
        deleteWatchlist(target)
    }
}

function rmOrAdd(movie) {
    let button = '<i class="fa-solid fa-circle-plus"></i> Watchlist'
    for (let watch of watchlist) {
        if (movie.imdbID == watch.imdbID) {
            button = '<i class="fa-solid fa-circle-minus"></i> Remove'
        }
    }
    return button
}
async function fetchAPI(input) {
    let res = await fetch(`https://www.omdbapi.com/?s=${input}&apikey=8cb7ac95`)
    let data = await res.json()
    let mainDataArray = data.Search
    return mainDataArray

}
async function getMovie(data) {
    let movieArray = []
    for (movie of data) {
        let res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=8cb7ac95`)
        let data = await res.json()
        movieArray.push(data)
    }
    return movieArray
}

function render(mainDataArray) {
    let html = ''
    for (let movie of mainDataArray) {

        html +=
            `<div class="movie">
            <img src='${movie.Poster}'
                alt="">
            <h3>${movie.Title}</h3>
            <span class="rating">
                <i class="fa-solid fa-star"></i>
                ${movie.imdbRating}
            </span>
            <span class="duration">${movie.Runtime}</span>
            <span class="genre">${movie.Genre}</span>
            <span class='watchlist' data-id=${movie.imdbID}>
                ${rmOrAdd(movie)}
            </span>
            <p class="plot">${movie.Plot}</p>
        </div>`
    }
    return html
}

function emptyWatchlist() {
    if (document.getElementById('watchlist').innerHTML.trim() === '') {
        document.getElementById('watchlist').innerHTML = `<div class="start-exploring watchlist-empty"><p>Your watchlist is looking a little empty...</p>
         <a href="index.html"><i class="fa-solid fa-circle-plus"></i>Let’s add some movies!</a></div>`
    }
}

function watchlistRender() {
    if (document.getElementById('watchlist')) {
        document.getElementById('watchlist').innerHTML = render(watchlist)
        emptyWatchlist()
    } else {
        moviesEl.innerHTML = render(mainDataArray)
    }
}

function renderWatchlist() {
    if (document.getElementById('watchlist')) {
        changeTheme(theme)
        watchlist = JSON.parse(localStorage.getItem('watchlist'))
        if (watchlist.length == 0) {
            emptyWatchlist()
        } else {
            document.getElementById('watchlist').innerHTML = render(watchlist)
        }

    }
}

function deleteWatchlist(target) {
    id = target.dataset.id
    let index = watchlist.indexOf(returnObj(id))
    watchlist.splice(index, 1)
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
    target.innerHTML = '<i class="fa-solid fa-check"></i> Removed'
}

function loading() {
    let loading = !theme ? 'loading-dark' : 'loading-white'
    moviesEl.innerHTML =
        `<div class="start-exploring">
           <img src='${loading}.svg'>
           <p>Loading</p>
        </div>`
}
renderWatchlist()

changeTheme(theme)
