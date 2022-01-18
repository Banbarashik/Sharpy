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
// let curLang;
let order = 'random';

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
      new Card('What engine does the game utilize?', 'Unreal Engine 3'),
    ],
    Russian: [
      new Card('Кто главный антагонист?', 'Девочка с усами'),
      new Card('В каком году игра была выпущена?', '2017'),
      new Card(
        'Какое максимальное число значков может носить игрок одновременно?',
        '3'
      ),
      new Card('На каком движке создан "A Hat in Time"?', 'Unreal Engine 3'),
    ],
  },
};

const decks = [skyrimDeck, hatInTimeDeck];

const updateIndices = () =>
  document
    .querySelectorAll('.card--btns')
    .forEach((btn, i) => (btn.dataset.cardI = i));

const disableFirstAndLastBtns = function () {
  document.querySelectorAll('.card--btns').forEach((btnsBlock, _, arr) => {
    const cardI = +btnsBlock.dataset.cardI;
    let btnUp = btnsBlock.firstElementChild;
    let btnDown = btnsBlock.lastElementChild;

    btnUp.disabled =
      cardI === 0 ? true : cardI === arr.length - 1 ? false : false;
    btnDown.disabled =
      cardI === 0 ? false : cardI === arr.length - 1 ? true : false;
  });
};

const makeCardsMovableByBtns = function () {
  const cardBtnsUp = document.querySelectorAll('.card--btn-up');
  const cardBtnsDown = document.querySelectorAll('.card--btn-down');

  const moveArrElem = function (arr, fromIndex, toIndex) {
    const [elem] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, elem);
  };

  const setEventListenersToUpDownBtns = function (btns) {
    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        const btnsBlock = e.currentTarget.parentNode;
        const cardBlock = btnsBlock.parentNode;

        let cardI = +btnsBlock.dataset.cardI;
        const isBtnUp = btn.classList.contains('card--btn-up');

        moveArrElem(
          curDeck.cards[curDeck.curLang],
          cardI,
          `${isBtnUp ? --cardI : ++cardI}`
        );

        if (isBtnUp)
          cardBlock.previousSibling.insertAdjacentElement(
            'beforebegin',
            cardBlock
          );
        else cardBlock.nextSibling.insertAdjacentElement('afterend', cardBlock);

        updateIndices();
        disableFirstAndLastBtns();
      });
    });
  };

  setEventListenersToUpDownBtns(cardBtnsUp);
  setEventListenersToUpDownBtns(cardBtnsDown);

  updateIndices();
  disableFirstAndLastBtns();
};

const cardsDnD = function (ul) {
  let draggableEl;
  let indexBefore;
  let indexAfter;
  let cardsListArr;

  const getCurrentList = () => (cardsListArr = [...ul.children]);
  getCurrentList();

  const reorderArray = function (indexBefore, indexAfter) {
    const [movedCard] = curDeck.cards[curDeck.curLang].splice(indexBefore, 1);
    curDeck.cards[curDeck.curLang].splice(indexAfter, 0, movedCard);
  };

  cardsListArr.forEach(li => {
    li.addEventListener('dragstart', e => {
      draggableEl = e.currentTarget;

      e.dataTransfer.setData('text/plain', null);

      getCurrentList();
      indexBefore = cardsListArr.indexOf(draggableEl);
    });

    li.addEventListener('dragover', e => {
      e.preventDefault();

      const li = e.currentTarget;

      const bounding = e.currentTarget.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;

      if (li !== draggableEl) {
        li.style.borderTopLeftRadius = '1.3rem';
        li.style.borderBottomLeftRadius = '1.3rem';
        if (e.clientY - offset < 0 && li !== draggableEl.nextSibling) {
          li.style.borderTop = '0.2rem solid rgba(0, 0, 0, 0.8)';
          li.style.borderBottom = '';
        } else if (
          e.clientY - offset > 0 &&
          li !== draggableEl.previousSibling
        ) {
          li.style.borderBottom = '0.2rem solid rgba(0, 0, 0, 0.8)';
          li.style.borderTop = '';
        }
      }
    });

    li.addEventListener('dragleave', e => {
      const li = e.currentTarget;

      li.style.borderTop = '';
      li.style.borderBottom = '';
    });

    li.addEventListener('drop', e => {
      e.preventDefault();

      const li = e.currentTarget;

      getCurrentList();
      indexAfter = cardsListArr.indexOf(li);

      if (li.style.borderBottom !== '')
        li.parentNode.insertBefore(draggableEl, li.nextSibling);
      else if (li.style.borderTop !== '')
        li.parentNode.insertBefore(draggableEl, li);
      else {
        return;
      }

      if (
        indexAfter - indexBefore !== 1 &&
        indexAfter > indexBefore &&
        li.style.borderTop !== ''
      ) {
        indexAfter--;
      } else if (indexAfter < indexBefore && li.style.borderBottom !== '') {
        indexAfter++;
      }

      li.style.borderTop = '';
      li.style.borderBottom = '';

      reorderArray(indexBefore, indexAfter);

      updateIndices();
      disableFirstAndLastBtns();
    });
  });
};

const displayListOfCards = function () {
  const existingList = document.querySelector('.cards-list-container');
  if (existingList) existingList.remove();

  const listOfCardsContainer = document.createElement('ul');
  listOfCardsContainer.classList.add('cards-list-container');

  appContainer.appendChild(listOfCardsContainer);

  curDeck.cards[curDeck.curLang].forEach(card =>
    listOfCardsContainer.insertAdjacentHTML(
      'beforeend',
      `<li class="card--sides-block" draggable="true">
        <div class="card--fside-separate">
          <p class="card--fside-q">${card.q}</p>
        </div>
        <div class="card--bside-separate">
          <p class="card--bside-a">${card.a}</p>
        </div>
        <div class="card--btns">
          <button class="card--btn-up">
            <svg xmlns="http://www.w3.org/2000/svg"
            class="ionicon" viewBox="0 0 512 512">
            <title>Chevron Up</title>
            <path fill="none" stroke="currentColor"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-width="48" d="M112 328l144-144 144 144"/>
            </svg>
          </button>
          <button class="card--btn-down">
            <svg xmlns="http://www.w3.org/2000/svg"
            class="ionicon" viewBox="0 0 512 512">
            <title>Chevron Down</title>
            <path fill="none" stroke="currentColor"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-width="48" d="M112 184l144 144 144-144"/>
            </svg>
          </button>
        </div>
       </li>`
    )
  );

  cardsDnD(listOfCardsContainer);
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

    if (curDeck.curLang)
      curDeck.cards[curDeck.curLang].forEach(card => (card.shown = false));

    if (document.querySelector('.btn--next-card'))
      appMainArea.removeChild(btnNextCard);

    startMessage.style.display = endMessage.style.display = 'none';
    deckOptions.style.display = 'grid';

    if (document.querySelector('.card--container')) {
      appMainArea.removeChild(document.querySelector('.card--container'));
    }

    fillDeckOptions(deck.languages, deckLangsOptions, 'option');
    fillDeckOptions(deck.modes, deckModesList, 'input');

    const langOpt = document.querySelector('.deck--languages-options');
    curDeck.curLang = curDeck.curLang ? curDeck.curLang : langOpt.value;
    langOpt.value = curDeck.curLang;

    displayListOfCards();
    makeCardsMovableByBtns();
  });
});

// Function creating a card HTML element
const displayCard = function (deck) {
  const deckNotShownYet = deck.filter(card => card.shown === false);

  // END OF A DECK
  if (deckNotShownYet.length === 0) {
    appMainArea.removeChild(document.querySelector('.card--container'));
    appMainArea.removeChild(btnNextCard);

    endMessage.style.display = 'block';

    curDeck.cards[curDeck.curLang].forEach(card => (card.shown = false));
    // curLang = '';

    return;
  }

  const generateCardEl = function (card) {
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
    generateCardEl(randomCard);
  } else if (order === 'original') {
    let i;
    if (i === undefined) i = 0;
    else i++;
    generateCardEl(i);
  }

  const cardContainer = document.querySelector('.card--container');
  cardContainer.addEventListener('click', () =>
    cardContainer.classList.toggle('flip')
  );
};

// START BUTTON
btnStart.addEventListener('click', e => {
  e.preventDefault();

  document.querySelector('.cards-list-container').remove();

  deckOptions.style.display = 'none';

  appMainArea.appendChild(btnNextCard);

  displayCard(curDeck.cards[curDeck.curLang]);
});

btnNextCard.addEventListener('click', () =>
  displayCard(curDeck.cards[curDeck.curLang])
);

document
  .querySelector('.deck--languages-options')
  .addEventListener('input', e => {
    curDeck.curLang = e.target.value;

    displayListOfCards();
    makeCardsMovableByBtns();
  });

document
  .getElementsByName('order')
  .forEach(input =>
    input.addEventListener('input', e => (order = e.target.value))
  );
