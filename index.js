let playerCards = [];
let dealerCards = [];
let playerSum = 0;
let dealerSum = 0;
let chips = 100;
let currentBet = 10;
let isRoundActive = false;
let isPlayerTurn = false;
let message = "Place your bet and deal.";

let messageEl = document.getElementById("message-el");
let playerCardsEl = document.getElementById("player-cards-el");
let dealerCardsEl = document.getElementById("dealer-cards-el");
let playerSumEl = document.getElementById("player-sum-el");
let dealerSumEl = document.getElementById("dealer-sum-el");
let chipsEl = document.getElementById("chips-el");
let betEl = document.getElementById("bet-el");
let dealBtn = document.getElementById("deal-btn");
let hitBtn = document.getElementById("hit-btn");
let standBtn = document.getElementById("stand-btn");
let restartBtn = document.getElementById("restart-btn");

let suits = [
    { symbol: "\u2665", color: "red" },
    { symbol: "\u2666", color: "red" },
    { symbol: "\u2663", color: "black" },
    { symbol: "\u2660", color: "black" }
];

function getRandomCard() {
    let randomNumber = Math.floor(Math.random() * 13) + 1;
    let suit = suits[Math.floor(Math.random() * suits.length)];
    let face = randomNumber;
    let value = randomNumber;

    if (randomNumber === 1) {
        face = "A";
        value = 11;
    } else if (randomNumber > 10) {
        value = 10;

        if (randomNumber === 11) {
            face = "J";
        } else if (randomNumber === 12) {
            face = "Q";
        } else {
            face = "K";
        }
    }

    return {
        face: face,
        suit: suit.symbol,
        color: suit.color,
        value: value
    };
}

function getHandValue(cards) {
    let total = 0;
    let aces = 0;

    for (let i = 0; i < cards.length; i++) {
        total += cards[i].value;

        if (cards[i].face === "A") {
            aces += 1;
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

function startGame() {
    let chosenBet = Number(betEl.value);

    if (chips <= 0) {
        message = "You are out of chips. Restart to play again.";
        renderGame();
        return;
    }

    if (!Number.isInteger(chosenBet) || chosenBet < 1) {
        message = "Enter a bet of at least 1 chip.";
        renderGame();
        return;
    }

    if (chosenBet > chips) {
        message = "You cannot bet more chips than you have.";
        renderGame();
        return;
    }

    currentBet = chosenBet;
    isRoundActive = true;
    isPlayerTurn = true;
    playerCards = [getRandomCard(), getRandomCard()];
    dealerCards = [getRandomCard(), getRandomCard()];
    updateSums();

    if (playerSum === 21) {
        stand();
        return;
    }

    message = "Do you want to pick another card?";
    renderGame();
}

function newCard() {
    if (!isRoundActive || !isPlayerTurn) {
        return;
    }

    playerCards.push(getRandomCard());
    updateSums();

    if (playerSum > 21) {
        endRound("lose", "Game over. You went over 21.");
        return;
    }

    if (playerSum === 21) {
        stand();
        return;
    }

    message = "Do you want to pick another card?";
    renderGame();
}

function stand() {
    if (!isRoundActive) {
        return;
    }

    isPlayerTurn = false;

    while (dealerSum < 17) {
        dealerCards.push(getRandomCard());
        updateSums();
    }

    if (hasNaturalBlackjack(playerCards) && !hasNaturalBlackjack(dealerCards)) {
        endRound("win", "You've got a Blackjack!");
    } else if (hasNaturalBlackjack(dealerCards) && !hasNaturalBlackjack(playerCards)) {
        endRound("lose", "Dealer has Blackjack. Dealer wins.");
    } else if (dealerSum > 21) {
        endRound("win", "Dealer went over 21. You win!");
    } else if (playerSum > dealerSum) {
        endRound("win", "You win!");
    } else if (playerSum < dealerSum) {
        endRound("lose", "Dealer wins.");
    } else {
        endRound("draw", "It's a draw.");
    }
}

function endRound(result, roundMessage) {
    isRoundActive = false;
    isPlayerTurn = false;
    message = roundMessage;

    if (result === "win") {
        chips += currentBet;
    } else if (result === "lose") {
        chips -= currentBet;
    }

    if (chips <= 0) {
        chips = 0;
        message += " You are out of chips.";
    }

    renderGame();
}

function restartGame() {
    playerCards = [];
    dealerCards = [];
    playerSum = 0;
    dealerSum = 0;
    chips = 100;
    currentBet = 10;
    isRoundActive = false;
    isPlayerTurn = false;
    message = "Place your bet and deal.";
    betEl.value = 10;
    renderGame();
}

function updateSums() {
    playerSum = getHandValue(playerCards);
    dealerSum = getHandValue(dealerCards);
}

function hasNaturalBlackjack(cards) {
    return cards.length === 2 && getHandValue(cards) === 21;
}

function renderGame() {
    let hasStarted = playerCards.length > 0 || dealerCards.length > 0 || chips < 100;

    renderCards(playerCardsEl, playerCards, false);
    renderCards(dealerCardsEl, dealerCards, isPlayerTurn);

    playerSumEl.textContent = "Player Sum: " + playerSum;
    dealerSumEl.textContent = isPlayerTurn ? "Dealer Sum: ?" : "Dealer Sum: " + dealerSum;
    chipsEl.textContent = "Chips: " + chips;
    betEl.max = chips;
    messageEl.textContent = message;

    dealBtn.classList.toggle("hidden-ui", isRoundActive || chips <= 0);
    hitBtn.classList.toggle("hidden-ui", !isPlayerTurn);
    standBtn.classList.toggle("hidden-ui", !isPlayerTurn);
    restartBtn.classList.toggle("hidden-ui", isRoundActive || !hasStarted);
    betEl.disabled = isRoundActive || chips <= 0;
}

function renderCards(container, cards, hideFirstCard) {
    container.innerHTML = "";

    for (let i = 0; i < cards.length; i++) {
        if (hideFirstCard && i === 0) {
            container.append(createHiddenCard());
        } else {
            container.append(createCardElement(cards[i]));
        }
    }
}

function createCardElement(card) {
    let cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.classList.add(card.color);
    cardEl.dataset.suit = card.suit;

    let faceEl = document.createElement("div");
    faceEl.classList.add("card-face");
    faceEl.textContent = card.face;

    let suitEl = document.createElement("div");
    suitEl.classList.add("card-suit");
    suitEl.textContent = card.suit;

    cardEl.append(faceEl);
    cardEl.append(suitEl);
    return cardEl;
}

function createHiddenCard() {
    let cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.classList.add("hidden");

    let faceEl = document.createElement("div");
    faceEl.classList.add("card-face");
    faceEl.textContent = "?";

    cardEl.append(faceEl);
    return cardEl;
}

renderGame();
