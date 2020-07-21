// DOM Elements
const gameContent = document.querySelector(".content")
const container = document.querySelector("#game-container")
const gameModal = document.getElementById("game-modal")

let span = document.getElementsByClassName("close")[0]
    window.onclick = function(e) {
        if (e.target == gameModal) {
            gameModal.style.display = "none"
        }
    }

// Initial Fetch - returns the game list to us from the localhost
fetch("http://localhost:3000/games")
    .then(r => r.json())
    .then(gameInfo => renderGamesList(gameInfo))

// Renders - render each game one after another
const renderGamesList = (gameInfo) => {
    gameInfo.forEach(renderGame)
}
// This renders the game list

// The following functions render a single game
const renderGame = (game) => {
    const newGameDiv = document.createElement("div")
        newGameDiv.className = "game"
        newGameDiv.dataset.id = `${game.id}`
        newGameDiv.innerHTML = 
        `
            <div id="${game.id}-game-card" class="card" data-id=${game.id}>
                <h4>${game.name}</h4>
                <img src=${game.image_url}>
            </div>
        `
    container.append(newGameDiv)
    // container appending a game in a newly created div

    const gameCard = document.getElementById(`${game.id}-game-card`)
    gameCard.addEventListener("click", event => {
        let newGameId;
        if (event.target.className === "game-card") {
            newGameId = event.target.dataset.id
        } else {
            newGameId = event.target.parentNode.dataset.id
        }

        // Displays the modal on the game card
        gameModal.style.display = "block"
        fetchGame(newGameId)
    })
}

// Fetches each game to display onto the modal
const fetchGame = (newGameId) => {
    return fetch(`http://localhost:3000/games/${newGameId}`)
        .then(r => r.json())
        .then(gameInfo => renderGameModal(gameInfo))
}

// Render the modal
const renderGameModal = (game) => {
    // HTML format for the game contents and formfor modal
    gameContent.innerHTML = `
        <div class="title">
            <h3 class="game-title">${game.name}</h3>
            <button data-action="clicked-excite" class="x-button">Excitement</button>
        </div>
        <div class="image">
            <img src=${game.image_url}>
        </div
        <div class="game-info">
            <h4>Summary:</h4>
            ${game.summary}
            <h5>Reviews:</h5>
            <ul id="${game.id}-reviews-container" class="review-container">
            </ul>
        </div>
        <div class="form-title">
            <h4>Post a review for "${game.name}"</h4>
            <form id="${game.id}-review-form" data-id="${game.id}" class="form">

                <label>Reviewer:</label>
                <input type="text" name="reviewer" placeholder="Please Enter Your Name Here"><br>

                <label>Game Rating:</label>
                <input type="number" name="rating" min="0" max="5" step="1" placeholder="Rating for '${game.name}'"><br>

                <label>Review:</label><br>
                <textarea type="text" name="review" placeholder="Review for '${game.name}' here!"></textarea><br>

                <input type="submit" value="Submit">
            </form><br>
        </div>
    `

    // Review container here
    const allReview = document.getElementById(`${game.id}-reviews-container`)
        if (game.reviews.length > 0) {
            game.reviews.forEach(review => {
                return renderReview(review, allReview)
            })
        } else {
                allReview.innerHTML = `
            <p>Review '${game.name}' today!</p>
            `
        }
        
    //The submit review form is here
    const newBtn = document.querySelector(".x-button")
    newBtn.addEventListener("click", (e) => {
        handleBtnClick(game)
    })


    const formReview = document.getElementById(`${game.id}-review-form`)
        formReview.addEventListener("submit", e => {
            handleFormSubmit(e)
    })
}

// Task: Get the game name to update without having to refresh
const handleBtnClick = (game) => {
    const titleName = document.querySelector(".game-title")

    // const nameGame = document.querySelector()
    // game_name = .target.value
    // console.log("hello")
    console.log(`${game.name}!`)
    fetch(`http://localhost:3000/games/${game.id}`,{
        method: "PATCH",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: `${game.name}!`
        })
    })
        .then(r => r.json())
        .then(titleName.innerHTML = `
        ${titleName.innerHTML}!`)
    // fetchGame(form.dataset.id)
    // if (e.target.dataset.action === "clicked-excite"){
    //     console.log(`${game.name}`)
    // }
}



// Where it renders the review
const renderReview = (review, allReview) => {
    const forReview = document.createElement("li")
    forReview.dataset.id = review.id
    forReview.className = "review"
    forReview.innerHTML = `
    ${review.reviewer}'s Rating: "${review.rating} - ${review.review}" <button data-action="delete-review" class="delete">Remove</button>
    `
    allReview.append(forReview)

    forReview.addEventListener("click", e => {
        if (e.target.dataset.action === "delete-review") {
            fetch(`http://localhost:3000/reviews/${review.id}`, {
                method: "DELETE"
            })
            .then(r => {
                return r.json()
              })
            .then(() => {
                forReview.remove()
            })
        }
    })
}

// This handles everything regarding event for submitting
const handleFormSubmit = (e) => {
    e.preventDefault() // Needed to prevent the submit page from defaulting itself
    const form = e.target
    const allReview = document.getElementById(`${form.dataset.id}-reviews-container`)
    const newReview = {
        game_id: form.dataset.id,
        rating: form.rating.value,
        review: form.review.value,
        reviewer: form.reviewer.value.charAt(0).toUpperCase() + form.reviewer.value.slice(1)
    }
    console.log(newReview)

    fetch(`http://localhost:3000/reviews`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
    })
    .then(r => {
        return r.json()
    })
    .then(reviewData => {
        renderReview(reviewData, allReview)
        fetchGame(form.dataset.id)
    })

    form.reset()
}