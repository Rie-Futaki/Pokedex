const $container = document.querySelector(".container")
const $dialog = document.getElementById("dialog")
const $infoBox = document.getElementById("infobox")
const $close = document.getElementById("close")
const $more = document.getElementById("more")
const $catch = document.getElementById("catch")
const $listDialog = document.getElementById("list")
const $listContainer = document.querySelector(".list-container")
const $listOpen = document.getElementById("caught-list")
const $listClose = document.getElementById("list-close")
const $message = document.querySelector(".noPokemon")

const pokedex = []
const caughtList = []

function parseUrl (url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1)
  }
  
// Get first 20 Pokémon:

function displayPokemon(pokemonList){
    pokedex.push(...pokemonList)
    $container.innerHTML = pokedex.reduce((html, pokemon) => html +
`<div class = "pokebox" data-id = "${parseUrl(pokemon.url)}">
    <figure class = "sprite">
        <img src = https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(pokemon.url)}.png>
        <figcaption>${pokemon.name}</figcaption>
    </figure>
</div>
`,'')
}

async function fetchPokemon (){
    const response = await fetch ("https://pokeapi.co/api/v2/pokemon/")
    const pokemon = await response.json()
    displayPokemon(pokemon.results)
    checkStatus()
}

fetchPokemon()

// Checks for any caught Pokémon already in local storage:

function checkStatus (){

    // Get all Pokémon stored in local storage:
    const items = {...localStorage}

    for (const key in items){
        const item = items[key]
        if (caughtList.find(pokemon => pokemon === item) === undefined){
            caughtList.push(item)
        }
    }

    // Add "caught" status to any Pokémon in local storage:

    const pokebox = $container.children

    for (let i = 0; i < pokebox.length; i ++){
        const pokeID = pokebox[i].getAttribute("data-id")

        const pokeData = JSON.parse(localStorage.getItem(`caught${pokeID}`))

        if (pokeData != null){
            pokebox[i].classList.add("caught")
        }
    }}

// Get more Pokémon:

$more.addEventListener('click', async function(){
    const response = await fetch (`https://pokeapi.co/api/v2//pokemon/?offset=${pokedex.length}`)
    const pokemon = await response.json()
    displayPokemon(pokemon.results)
    checkStatus()
})

// Setting up the dialog:

async function displayInfo (pokemonID){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`)
    const pokeinfo = await response.json()
    const types = []

    if (pokeinfo.types.length > 1){
        for (let i = 0; i < 2; i++){
            types.push(pokeinfo.types[i].type.name)
        }
    }
    else{
        types.push(pokeinfo.types[0].type.name)
    }

    const moves = pokeinfo.moves.toSpliced(5, pokeinfo.moves.length - 1)

    $infoBox.setAttribute("pokeID", `${pokeinfo.id}`)
    $infoBox.innerHTML =
    `
            <figure class = "officialArt">
                <figcaption>${pokeinfo.name}</figcaption>
                <img src = https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeinfo.id}.png>
            </figure>
            <div class = "pokeinfo">
                <ul class = "typeinfo">
                    <h2>Types</h2>
                    ${types.reduce((html, item) => html + `
                        <li class = "type">${item}</li>`, '')}
                </ul>
                <ul class = "moveinfo">
                    <h2>Moves</h2>
                    ${moves.reduce((html, item) => html + `
                        <li class = "move">${item.move.name}</li>`, '')}
            </div>
    `
}

$container.addEventListener('click', function(e){
    const pokemon = e.target.closest('.pokebox')
    displayInfo(pokemon.getAttribute("data-id"))
    if (pokemon.classList.contains("caught")){
        $catch.classList.remove("catch")
        $catch.classList.add("release")
        $catch.textContent = "Release"
    }
    else{
        $catch.classList.remove("release")
        $catch.classList.add("catch")
        $catch.textContent = "Catch!"
    }
    $dialog.showModal()
})

$close.addEventListener('click', function(){
    if (caughtList.length === 0){
        $message.classList.remove("hidden")
    }
    $dialog.close()
})

// The catch/release button:

async function singlePokemon (info) {
    const response = await fetch (`https://pokeapi.co/api/v2/pokemon?limit=${info}&offset=${info-1}`)
    const pokemon = await response.json()
    const pokeJSON = pokemon.results[0]
    const pokestring = JSON.stringify(pokeJSON)
    localStorage.setItem(`caught${info}`, pokestring)
    
    if (caughtList.indexOf(pokestring) === -1){
        caughtList.push(pokestring)
    }
}

$catch.addEventListener('click', function(e){
    if ($catch.classList.contains("release")){

        const toRelease = $dialog.children
        const releaseID = toRelease[0].getAttribute("pokeid")
    
        const releaseString = $listContainer.innerHTML.substring($listContainer.innerHTML.indexOf(`<div class="pokebox" pokeid="${releaseID}"`), $listContainer.innerHTML.indexOf('</div>', $listContainer.innerHTML.indexOf(`<div class="pokebox" pokeid="${releaseID}"`))+7)
        const test1 = $listContainer.innerHTML.slice(0, $listContainer.innerHTML.indexOf(releaseString))
        const test2 = $listContainer.innerHTML.slice($listContainer.innerHTML.indexOf(releaseString)+releaseString.length)
    
        $listContainer.innerHTML = test1 + test2

        const info = $catch.previousElementSibling.getAttribute("pokeid")
        const $pokebox = document.querySelector(`.pokebox:nth-child(${info})`)
        if ($pokebox != null){
            $pokebox.classList.remove("caught")
        }
        const pokeData = JSON.parse(localStorage.getItem(`caught${info}`))
        caughtList.splice(caughtList.indexOf(`{"name":"${pokeData.name}","url":"${pokeData.url}"}`), 1)
        localStorage.removeItem(`caught${info}`)
        $catch.classList.remove("release")
        $catch.classList.add("catch")
        $catch.textContent = "Catch!"
    }
    else{
        const info = $catch.previousElementSibling.getAttribute("pokeid")
        const $pokebox = document.querySelector(`.pokebox:nth-child(${info})`)
        $pokebox.classList.add("caught")
        singlePokemon(info)
        $catch.classList.remove("catch")
        $catch.classList.add("release")
        $catch.textContent = "Release"
    }
})

// Update the "caught" list and list display:
function updateList(){
    const objectArray = []
    for (let i = 0; i < caughtList.length; i++){
        const pokeData = JSON.parse((caughtList[i]))
        objectArray.push(pokeData)
    }

    //parseURL to get ID and sort by ID

    objectArray.sort(function (a,b){
        const firstID = parseUrl(a.url)
        const nextID = parseUrl(b.url)
        return firstID - nextID
    })
    if (objectArray.length != 0){
        $message.classList.add("hidden")
        $listContainer.innerHTML = objectArray.reduce((html, pokemon) => html +
        `<div class = "pokebox" pokeid = "${parseUrl(pokemon.url)}">
                <figure class = "sprite">
                    <img src = https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(pokemon.url)}.png>
                <figcaption>${pokemon.name}</figcaption>
                </figure>
            </div>
        `,'')
    }
    else{$message.classList.remove("hidden")
    }
}

//Viewing current list of caught Pokémon:

$listOpen.addEventListener('click', function(){
   updateList()
    $listDialog.showModal()
})

$listClose.addEventListener('click', function(){
    $listDialog.close()
})

$listContainer.addEventListener('click', function(e){
    const pokemon = e.target.closest('.pokebox')
    displayInfo(pokemon.getAttribute("pokeid"))
    $catch.classList.remove("catch")
    $catch.classList.add("release")
    $catch.textContent = "Release"
    checkStatus()
    $dialog.showModal()
})

$close.addEventListener('click', function(){
    updateList()
    $dialog.close()
})