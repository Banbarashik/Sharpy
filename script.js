'use strict';
// DOM elements
const appContainer = document.querySelector('.app--container');
const appMainArea = document.querySelector('.app--main-area');
const startMessage = document.querySelector('.app--start-message');
const endMessage = document.querySelector('.app--end-message');
const decksList = document.querySelector('.list-of-decks');
const deckOptions = document.querySelector('.deck--options');
const deckLangsOptions = document.querySelector('.deck--languages-options');
const deckModesList = document.querySelector('.deck--modes-list');
const btnStart = document.querySelector('input[value="Start"]');
const card = document.querySelector('.card');

// Creating DOM elements
const btnNextCard = document.createElement('button');
btnNextCard.classList.add('btn--next-card');
btnNextCard.textContent = 'Next card';

// State variables
let curDeck;
let curLang;
let order = 'original';

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
  modes: ['Flashcards', 'Multiple choice'],
  cards: {
    English: [
      new Card('What is the name of the main character?', 'Dovahkiin'),
      new Card('When the game was released?', '2011'),
      new Card('What is the level cap?', '81'),
    ],
    Russian: [
      new Card('Как зовут главного героя?', 'Довакин'),
      new Card('В каком году игра была выпущена?', '2011'),
      new Card('Каков максимальный уровень игрока?', '81'),
    ],
  },
};

const hatInTimeDeck = {
  name: 'A Hat in Time',
  author: 'Lexa',
  languages: ['Russian', 'English', 'Romaji'],
  modes: ['Flashcards', 'Multiple choice', 'Test mode'],
  cards: {
    English: [
      new Card('Who is the main antagonist?', 'Mustache girl'),
      new Card('When the game was released?', '2017'),
      new Card(
        'What is the maximum number of badges the player can use at the same time?',
        '3'
      ),
    ],
    Russian: [
      new Card('Кто главный антагонист?', 'Девочка с усами'),
      new Card('В каком году игра была выпущена?', '2017'),
      new Card(
        'Какое максимальное число значков может носить игрок одновременно?',
        '3'
      ),
    ],
  },
};
const decks = [skyrimDeck, hatInTimeDeck];

const displayListOfCards = function () {
  const existingList = document.querySelector('.cards-list-container');
  if (existingList) existingList.remove();

  const listOfCardsContainer = document.createElement('ul');
  listOfCardsContainer.classList.add('cards-list-container');

  appContainer.appendChild(listOfCardsContainer);

  curDeck.cards[curLang].forEach(card => {
    const cardSidesBlock = `<li class="card--sides-block">
      <div class="card--fside-separate">
        <p class="card--fside-q">${card.q}</p>
      </div>
      <div class="card--bside-separate">
        <p class="card--bside-a">${card.a}</p>
      </div>
    </li>`;

    listOfCardsContainer.insertAdjacentHTML('beforeend', cardSidesBlock);
  });
};

decks.forEach(deck => {
  const deckItemEl = document.createElement('li');
  deckItemEl.classList.add('deck--item');
  decksList.appendChild(deckItemEl);

  deckItemEl.textContent = deck.name.slice(0, 1);

  // CREATE DECK'S OPTIONS
  const fillDeckOptions = function (prop, list, elem) {
    list.innerHTML = '';

    prop.forEach(propValue => {
      const item = document.createElement(elem);

      if (elem === 'input') {
        const id = propValue.replace(' ', '_');

        list.insertAdjacentHTML(
          'beforeend',
          `<li>
            <input type="radio" name="mode" id="${id}" ${
            propValue === 'Flashcards' ? 'checked' : ''
          }>
            <label for="${id}">${propValue}</label>
           </li>`
        );
      } else {
        item.textContent = propValue;
        list.appendChild(item);
      }
    });
  };

  // A DECK LIST ITEM
  deckItemEl.addEventListener('click', () => {
    curDeck = deck;

    if (curLang) curDeck.cards[curLang].forEach(card => (card.shown = false));

    if (document.querySelector('.btn--next-card'))
      appMainArea.removeChild(btnNextCard);

    startMessage.style.display = endMessage.style.display = 'none';
    deckOptions.style.display = 'grid';

    if (document.querySelector('.card--container')) {
      appMainArea.removeChild(document.querySelector('.card--container'));
    }

    fillDeckOptions(deck.languages, deckLangsOptions, 'option');
    fillDeckOptions(deck.modes, deckModesList, 'input');

    curLang = document.querySelector('.deck--languages-options').value;

    displayListOfCards();
  });
});

// Function creating a card HTML element
const displayRandomCard = function (deck) {
  const deckNotShownYet = deck.filter(card => card.shown === false);

  // END OF A DECK
  if (deckNotShownYet.length === 0) {
    appMainArea.removeChild(document.querySelector('.card--container'));
    appMainArea.removeChild(btnNextCard);

    endMessage.style.display = 'block';

    curDeck.cards[curLang].forEach(card => (card.shown = false));
    curLang = '';

    return;
  }

  const generateBlock = function (card) {
    appMainArea.insertAdjacentHTML(
      'afterbegin',
      `<div class="card--container">
          <article class="card">
            <div class="card--fside">
              <p class="card--fside-q">${deckNotShownYet[card].q}</p>
            </div>
            <div class="card--bside">
              <p class="card--bside-a">${deckNotShownYet[card].a}</p>
            </div>
          </article>
         </div>`
    );

    deckNotShownYet[card].shown = true;
  };

  if (document.querySelector('.card--container')) {
    appMainArea.removeChild(document.querySelector('.card--container'));
  }

  if (order === 'random') {
    const randomCard = Math.floor(Math.random() * deckNotShownYet.length);
    generateBlock(randomCard);
  } else if (order === 'original') {
    let i;
    if (i === undefined) i = 0;
    else i++;
    generateBlock(i);
  }

  const cardContainer = document.querySelector('.card--container');
  cardContainer.addEventListener('click', () =>
    cardContainer.classList.toggle('flip')
  );
};

// START BUTTON
btnStart.addEventListener('click', e => {
  e.preventDefault();

  deckOptions.style.display = 'none';
  appMainArea.appendChild(btnNextCard);

  displayRandomCard(curDeck.cards[curLang]);
});

btnNextCard.addEventListener('click', () => {
  displayRandomCard(curDeck.cards[curLang]);
});

document
  .querySelector('.deck--languages-options')
  .addEventListener('input', e => {
    curLang = e.target.value;

    displayListOfCards();
  });