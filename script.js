'use strict';
// DOM elements
const appMainArea = document.querySelector('.app--main-area');
const startMessage = document.querySelector('.app--start-message');
const decksList = document.querySelector('.list-of-decks');
const deckOptions = document.querySelector('.deck--options');
const deckLangsOptions = document.querySelector('.deck--languages-options');
const deckModesList = document.querySelector('.deck--modes-list');
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
const skyrimDeck = {
  name: 'Skyrim',
  author: 'Wadim',
  languages: ['Russian', 'English'],
  modes: ['Default', 'Four variants'],
  cards: [
    new Card('Who is the name of the main character?', 'Dovahkiin'),
    new Card('When the game was released?', '2011'),
    new Card('Who is the level cap?', '81'),
  ],
};

const hatInTimeDeck = {
  name: 'A Hat in Time',
  author: 'Lexa',
  languages: ['Russian', 'English', 'Romaji'],
  modes: ['Default', 'Four variants', 'Test mode'],
  cards: [
    new Card('Who is the main antagonist?', 'Mustache girl'),
    new Card('When the game was released?', '2017'),
    new Card(
      'What is the maximum number of badges the player can use at the same time?',
      '3'
    ),
  ],
};
const decks = [skyrimDeck, hatInTimeDeck];

decks.forEach(deck => {
  const deckItemEl = document.createElement('li');
  deckItemEl.classList.add('deck--item');
  decksList.appendChild(deckItemEl);

  deckItemEl.textContent = deck.name.slice(0, 1);

  const fillDeckOptions = function (prop, list, elem) {
    list.innerHTML = '';

    prop.forEach(propValue => {
      const item = document.createElement(elem);

      if (elem === 'input') {
        const id = propValue.replace(' ', '_');

        item.setAttribute('type', 'radio');
        item.setAttribute('name', 'mode');
        item.setAttribute('id', id);
        if (propValue === 'Default') item.setAttribute('checked', '');

        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = propValue;

        const li = document.createElement('li');
        li.appendChild(item);
        li.appendChild(label);

        list.appendChild(li);
      } else {
        item.textContent = propValue;
        list.appendChild(item);
      }
    });
  };

  deckItemEl.addEventListener('click', () => {
    startMessage.style.display = 'none';
    deckOptions.style.display = 'flex';

    fillDeckOptions(deck.languages, deckLangsOptions, 'option');
    fillDeckOptions(deck.modes, deckModesList, 'input');
  });
});

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
