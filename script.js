/* eslint-disable no-alert */
// `*`*`*`*`*`*`*`*`*sound effects! they seem to not play well with the test, so make sure to comment out line 3 through 21 when testing********
const buySound = new Audio('./images/buy.mp3');
buySound.volume = 0.2;
const song = new Audio('./images/song.mp3');
song.autoplay = true;
song.loop = true;
song.volume = 0.2;
const muteBtn = document.getElementById("mute");

muteBtn.addEventListener("click", function() {
  if (!song.paused) {
    song.pause();
    buySound.volume = 0;
    muteBtn.innerText = "🔈";
  } else {
    song.play();
    buySound.volume = 0.2;
    muteBtn.innerText = "🔇";
  }
});


/**************
 *   SLICE 1
 **************/
// the next line is what I used during testing so that I could refresh my scores
// localStorage.clear();

// `*`*`*`*`*`*`*`*`*The same is true of the next lines (31-40). The tests dont like localStorage not being defined and we get reference errors. kindly comment them out for the tests!
const savedData = localStorage.getItem('gameData');
if (savedData) {
  window.data = JSON.parse(savedData);
  let totalCPS = 0;
  window.data.producers.forEach(producer => {
    totalCPS += producer.cps * producer.qty;
  });
  window.data.totalCPS = totalCPS;
  updateCPSView(window.data.totalCPS);
}

function saveGameData() {
  localStorage.setItem('gameData', JSON.stringify(window.data));
}

setInterval(saveGameData, 10000);
function updateCoffeeView(coffeeQty) {
  const coffeeCounter = document.getElementById("coffee_counter");
  coffeeCounter.innerText = ": " + coffeeQty;
}

// here we are incrementing by one every time a click is made. Then we update and render
function clickCoffee(data) {
data.coffee++
updateCoffeeView(data.coffee)
renderProducers(data)
saveGameData()
}

/**************
 *   SLICE 2
 **************/
// This is where we have the function that will turn the producer to true when our coffee count is half of the cost.
function unlockProducers(producers, coffeeCount) {
 producers.forEach(producer => {
  if (coffeeCount >= (producer.price/2)) {
    producer.unlocked = true
  }
 })
}
// We take the producers and make a completely new array using filter which will show it as unlocked.
function getUnlockedProducers(data) {
const unlockedProducers = data.producers.filter(producer => producer.unlocked === true)
return unlockedProducers;
}

// This is just where we are making a display name from the current id of each object in the data array
function makeDisplayNameFromId(id) {
return id
  .split("_")
  .map(word => `${word[0].toUpperCase ()}${word.slice(1)}`)
  .join(" ");
}

// I did tweak this next part a bit just to make the font more readable, adding spaces by the colon. I also wanted the buy button at the bottom of the div
// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    </div>
    <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>PPS: ${producer.cps}</div>
    <div id="costColor">Cost: ${currentCost}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
    </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}
function deleteAllChildNodes(parent) {
Array.from(parent.childNodes)
  .forEach(childNode => parent.removeChild(childNode))
}

// rendering the producers to the page. we are using the unlockedproducers, the actual container, and deleting the childNodes, then appending
function renderProducers(data) {
unlockProducers(data.producers, data.coffee);
const unlockedProducers = getUnlockedProducers(data);
const producersContainer = document.getElementById("producer_container")
deleteAllChildNodes(producersContainer)
unlockedProducers.forEach(producer => {
  const producerDiv = makeProducerDiv(producer)
  producersContainer.append(producerDiv)
})
}

/**************
 *   SLICE 3
 **************/
// this finds the producer by its id
function getProducerById(data, producerId) {
return data.producers.find(producer =>
  producer.id === producerId)
}
// this determines if we can afford the producer or not we check our pizza against the price of the producers
function canAffordProducer(data, producerId) {
const producer = getProducerById(data, producerId)
return data.coffee >= producer.price
}

// updating the pizza per second, we grab the element by id from the html doc, and we change its text to that of the current cps
function updateCPSView(cps) {
const cpsIndicator = document.getElementById("cps")
cpsIndicator.innerText = cps + " :"   ;

}

// updating the price. we multiply it by 1.25, so that it gets increasingly more expensive. need to make sure to reound down as well
function updatePrice(oldPrice) {
return Math.floor(oldPrice * 1.25)
}

// this is the function that we use to buy, if succesful it will add to our producer qty, reduce from our current pizza count, add to the total PPS
function attemptToBuyProducer(data, producerId) {
const canAfford = canAffordProducer(data, producerId)
if(canAfford) {
  const producer = getProducerById(data, producerId)
  producer.qty++
  data.coffee -= producer.price
  producer.price = updatePrice(producer.price)
  data.totalCPS += producer.cps
  return canAfford
}
return canAfford;
}

// we are looking at the event.target and in the id for buy, if we cant afford we are alerting that its not enough. else we do our update (also soundfx)
function buyButtonClick(event, data) {
  if (event.target.id && event.target.id.includes("buy_")) {
    const producerId = event.target.id.slice(4)
    const canAfford = attemptToBuyProducer(data, producerId)
    if(!canAfford) window.alert("Not enough Pizza!")
    else {
      renderProducers(data)
      updateCoffeeView(data.coffee)
      updateCPSView(data.totalCPS)
      buySound.currentTime = 0;
      buySound.play();
    }
  }
}

// we are using seconds to update the PPS and make sure that we render it to the page
function tick(data) {
data.coffee += data.totalCPS
updateCoffeeView(data.coffee)
renderProducers(data)
}



/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)
  const data = window.data;

  // Added a rotation to the pizza each time it is clicked
  let isPlaying = false;
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));
  let angle = 0;
bigCoffee.addEventListener("click", function() {
    angle += 2;
    bigCoffee.style.transform = "rotate(" + angle + "deg)";
    if (!isPlaying) {
      song.play();
      muteBtn.innerText = "🔇";
      isPlaying = true;
    }
});

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
}


// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}

