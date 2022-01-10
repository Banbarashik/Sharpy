'use strict';
// DOM elements
const appMainArea = document.querySelector('.app--main-area');

const card = document.querySelector('.card');

const btnNextCard = document.querySelector('.btn--next-card');

// Creating DOM elements

// Constructor for cards
class Card {
  constructor(q, a, img) {
    this.q = q;
    this.a = a;
    this.img = img;

    this.shown = false;
  }
}

// Array containing all cards
const testDeck = {
  name: 'Skyrim',
  author: 'Wadim',
  languages: ['rus', 'eng'],
  cards: [
    new Card('Who is the best tik-toker?', 'Bonbibonkers'),
    new Card('When the ECMAScript standard was created?', '1997'),
    new Card('Who is the best Twitch streamer?', 'Emiru'),
  ],
};
const decks = [testDeck];

// Function creating a card HTML element
const displayRandomCard = function (deck) {
  const deckNotShownYet = deck.filter(card => card.shown === false);

  if (deckNotShownYet.length === 0) {
    const deckEndedMessage =
      'You finished! Want to try again or choose an another deck?';
  }

  const randomCard = Math.floor(Math.random() * deckNotShownYet.length);
  deckNotShownYet[randomCard].shown = true;

  if (document.querySelector('.card--container')) {
    appMainArea.removeChild(document.querySelector('.card--container'));
  }

  appMainArea.insertAdjacentHTML(
    'afterbegin',
    `<div class="card--container">
      <article class="card">
        <div class="card--fside">
          <p class="card--fside-q">${deckNotShownYet[randomCard].q}</p>
        </div>
        <div class="card--bside">
          <p class="card--bside-a">${deckNotShownYet[randomCard].a}</p>
        </div>
      </article>
     </div>`
  );

  const cardContainer = document.querySelector('.card--container');
  cardContainer.addEventListener('click', () =>
    cardContainer.classList.toggle('flip')
  );
};

btnNextCard.addEventListener('click', displayRandomCard.bind(null, deck));
