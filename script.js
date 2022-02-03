'use strict';
// DOM elements
const appContainer = document.querySelector('.app--container');
const appMainArea = document.querySelector('.app--main-area');
const appSidebar = document.querySelector('.app--sidebar');
const startMessage = document.querySelector('.app--start-message');
const endMessage = document.querySelector('.app--end-message');
const decksList = document.querySelector('.list-of-decks');
const deckOptions = document.querySelector('.deck--options');
const deckLangsOptions = document.querySelector('.deck--languages-options');
const orderInputs = document.querySelectorAll('input[name="order"]');
const orderLabels = document.querySelectorAll('input[name="order"] + label');
const btnDeleteCurLang = document.querySelector('.deck--del--cur-lang');
const deckDeleteWholeBtn = document.querySelector('.deck--del--whole');
const decksSearch = document.querySelector('.decks--search');
const btnStart = document.querySelector('input[value="Start"]');
const card = document.querySelector('.card');
const createNewDeckIcon = document.querySelector('.deck--item-create');
const createNewCardWindow = document.querySelector('.card--create');
const addNewLangBtn = document.querySelector('.lang--add-btn');

const langInput = document.getElementById('lang_input');
langInput.addEventListener('keydown', e => {
  if (e.key >= 0 || e.key <= 0) e.preventDefault();
});

const numToShowInput = document.getElementById('cards_num_input');

// Creating DOM elements
const btnNextCard = document.createElement('button');
btnNextCard.classList.add('btn--next-card');
btnNextCard.textContent = 'Next card';

const btnAddNewCard = document.createElement('button');
btnAddNewCard.classList.add('cards--add-new');
btnAddNewCard.textContent = '+';

const cardsSearch = document.createElement('input');
cardsSearch.setAttribute('type', 'text');
cardsSearch.setAttribute('placeholder', 'Search for a card');
cardsSearch.classList.add('cards--search');

const cardsNumBlock = document.createElement('p');
cardsNumBlock.classList.add('card--state-nums');
cardsNumBlock.insertAdjacentHTML(
  'beforeend',
  `<span class="card--curNum">1</span>/<span class="cards--totalNum"></span>`
);

const wrongNumMessage = document.createElement('p');
wrongNumMessage.classList.add('wrong-num-message');
wrongNumMessage.textContent =
  'Number of cards should be greater than 0 and less than the total number of cards in the deck';

const langIsEmptyMessage = document.createElement('p');
langIsEmptyMessage.classList.add('lang-is-empty-message');
langIsEmptyMessage.textContent = "The language field can't be empty";

// State variables
let curDeck;
let numToShow;
let numOfCardsShown = 1;

class Deck {
  constructor(name, author, languages, color) {
    this.name = name;
    this.author = author;
    this.languages = languages;
    this.modes = ['Flashcards', 'Multiple choice'];
    this.cards = {};
    this.curLang = '';
    this.order = 'random';

    this.iconColor = color;
  }
}

class Card {
  constructor(q, a, img) {
    this.q = q;
    this.a = a;
    this.img = img;

    this.shown = false;
  }
}

const skyrimDeck = new Deck(
  'Skyrim',
  'Wadim',
  ['Russian', 'English'],
  '#999999'
);
skyrimDeck.cards.english = [
  new Card('What is the name of the main character?', 'Dovahkiin'),
  new Card('When the game was released?', '2011'),
  new Card('What is the level cap?', '81'),
];
skyrimDeck.cards.russian = [
  new Card('Как зовут главного героя?', 'Довакин', 'http://tny.im/r9x'),
  new Card('В каком году игра была выпущена?', '2011'),
  new Card('Каков максимальный уровень игрока?', '81'),
];

const hatInTimeDeck = new Deck(
  'A Hat in Time',
  'Lexa',
  ['Russian', 'English'],
  '#999999'
);
hatInTimeDeck.cards.english = [
  new Card('Who is the main antagonist?', 'Mustache girl'),
  new Card('When the game was released?', '2017'),
  new Card(
    'What is the maximum number of badges the player can use at the same time?',
    '3'
  ),
  new Card('What engine does the game utilize?', 'Unreal Engine 3'),
];
hatInTimeDeck.cards.russian = [
  new Card('Кто главный антагонист?', 'Девочка с усами'),
  new Card('В каком году игра была выпущена?', '2017'),
  new Card(
    'Какое максимальное число значков может носить игрок одновременно?',
    '3'
  ),
  new Card('На каком движке создан "A Hat in Time"?', 'Unreal Engine 3'),
];

const decks = [skyrimDeck, hatInTimeDeck];

function invertToBlackOrWhite(hex) {
  hex = hex.slice(1);

  const r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toNormalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const getLI = function (target) {
  while (
    target.nodeName.toLowerCase() != 'li' &&
    target.nodeName.toLowerCase() != 'body'
  ) {
    target = target.parentNode;
  }
  if (target.nodeName.toLowerCase() == 'body') {
    return false;
  } else {
    return target;
  }
};

const disableBtnStartIfNoCards = deck =>
  (btnStart.disabled = deck.cards[deck.curLang].length === 0 ? true : false);

const returnDecksIcon = () =>
  [...decksList.children].find(deck => deck.dataset.deckName === curDeck.name);

const updateCardsLangs = function () {
  const cardsLangs = returnDecksIcon().querySelector('.deck--cards-langs');
  cardsLangs.textContent = curDeck.languages.join(', ');
};

const updateCardsNum = function (operation) {
  const cardsNum = returnDecksIcon().querySelector('.deck--cards-num');

  if (operation === 'increment' || operation === 'decrement') {
    cardsNum.textContent =
      operation === 'increment'
        ? Number(++cardsNum.textContent)
        : Number(--cardsNum.textContent);
  } else if (operation === 'subtraction') {
    cardsNum.textContent =
      +cardsNum.textContent - curDeck.cards[curDeck.curLang].length;
  }
};

const openDeckWindow = function (e, deck) {
  e.preventDefault();

  appMainArea.classList.remove('closed');
  appMainArea.classList.add('opened');

  curDeck = deck;

  if (deck.curLang && deck.languages.length > 1)
    deck.cards[deck.curLang].forEach(card => (card.shown = false));

  if (document.querySelector('.btn--next-card'))
    appMainArea.removeChild(btnNextCard);

  if (document.querySelector('.card--container')) {
    appMainArea.removeChild(document.querySelector('.card--container'));
  }

  createNewCardWindow.style.display = 'none';
  document.querySelector('.deck--create').style.display = 'none';

  startMessage.style.display = endMessage.style.display = 'none';
  deckOptions.style.display = 'grid';

  fillDeckOptions(deck.languages, deckLangsOptions, 'option');

  const langOpt = document.querySelector('.deck--languages-options');
  deck.curLang = deck.curLang ? deck.curLang : langOpt.value.toLowerCase();
  langOpt.value = capitalizeFirstLetter(deck.curLang);

  orderInputs.forEach(input => {
    const label = input.nextElementSibling;

    if (deck.order === input.value) {
      input.setAttribute('checked', '');
      label.classList.add('checked');
    } else {
      input.removeAttribute('checked');
      label.classList.remove('checked');
    }
  });

  if (deck.languages.length > 0) {
    displayListOfCards();
    makeCardsBtnsActive();
    btnStart.disabled = false;
  } else {
    btnStart.disabled = true;
    cardsSearch.remove();
    btnAddNewCard.remove();
    document.querySelector('.cards-list-container').remove();
  }

  langIsEmptyMessage.remove();
  wrongNumMessage.remove();
  langInput.value = '';
  numToShowInput.value = '';
};

// CREATE DECK'S OPTIONS
const fillDeckOptions = function (prop, list, elem) {
  list.innerHTML = '';

  prop.forEach(propValue => {
    const item = document.createElement(elem);
    item.textContent = propValue;
    list.appendChild(item);
  });
};

const updateIndices = () => {
  [...document.querySelectorAll('.card--btns')]
    .filter(
      btnBlock =>
        !btnBlock.parentElement.classList.contains('card--not-created')
    )
    .forEach((btn, i) => (btn.dataset.cardI = i));
};

const disableFirstAndLastBtns = function () {
  document.querySelectorAll('.card--btns').forEach((btnsBlock, i, arr) => {
    const btnUp = btnsBlock.firstElementChild;
    const btnDown = btnUp.nextElementSibling;
    const cardIsNotCreated =
      btnsBlock.parentElement.classList.contains('card--not-created');

    if (!cardIsNotCreated) {
      btnUp.disabled = i === 0 ? true : i === arr.length - 1 ? false : false;
      btnDown.disabled = i === 0 ? false : i === arr.length - 1 ? true : false;
    }

    if (document.querySelector('.cards-list-container').children.length === 1)
      btnUp.disabled = btnDown.disabled = true;
  });
};

const makeCardsBtnsActive = function () {
  const currentList = document.querySelector('.cards-list-container');

  const moveArrElem = function (arr, fromIndex, toIndex) {
    const [elem] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, elem);
  };

  const delArrElem = (arr, i) => arr.splice(i, 1);

  currentList.addEventListener('click', e => {
    const getButton = function (target) {
      while (
        target.nodeName.toLowerCase() != 'button' &&
        target.nodeName.toLowerCase() != 'body'
      ) {
        target = target.parentNode;
      }
      if (target.nodeName.toLowerCase() == 'body') {
        return false;
      } else {
        return target;
      }
    };

    if (
      (e.target.closest('.card--btn-up') &&
        e.target.closest('.card--btn-up').disabled === false) ||
      (e.target.closest('.card--btn-down') &&
        e.target.closest('.card--btn-down').disabled === false) ||
      e.target.closest('.card--btn-del')
    ) {
      const btnsBlock = getButton(e.target).parentNode;
      const cardBlock = btnsBlock.parentNode;

      let cardI = +btnsBlock.dataset.cardI;
      const isBtnUp = getButton(e.target).classList.contains('card--btn-up');
      const isBtnDown = getButton(e.target).classList.contains(
        'card--btn-down'
      );

      let isPreviousCardNotCreated;
      if (cardBlock.previousElementSibling) {
        isPreviousCardNotCreated =
          cardBlock.previousElementSibling.classList.contains(
            'card--not-created'
          );
      }

      let isNextCardNotCreated = false;
      if (cardBlock.nextElementSibling) {
        isNextCardNotCreated =
          cardBlock.nextElementSibling.classList.contains('card--not-created');
      }

      if (
        (isBtnUp || isBtnDown) &&
        !(isPreviousCardNotCreated && isNextCardNotCreated) &&
        !(isBtnDown && isNextCardNotCreated) &&
        !(isBtnUp && isPreviousCardNotCreated)
      ) {
        moveArrElem(
          curDeck.cards[curDeck.curLang],
          cardI,
          `${isBtnUp ? --cardI : ++cardI}`
        );
      } else if (!isBtnUp && !isBtnDown)
        delArrElem(curDeck.cards[curDeck.curLang], cardI);

      if (isBtnUp)
        cardBlock.previousSibling.insertAdjacentElement(
          'beforebegin',
          cardBlock
        );
      else if (isBtnDown)
        cardBlock.nextSibling.insertAdjacentElement('afterend', cardBlock);
      else {
        cardBlock.remove();
        updateCardsNum('decrement');
        disableBtnStartIfNoCards(curDeck);
      }

      updateIndices();
      disableFirstAndLastBtns();
    }
  });

  updateIndices();
  disableFirstAndLastBtns();
};

const cardsDnD = function () {
  let draggableEl;
  let indexBefore;
  let indexAfter;
  let cardsListArr;
  const currentList = document.querySelector('.cards-list-container');

  const getCurrentList = function () {
    cardsListArr = [...currentList.children].filter(
      cardBlock => !cardBlock.classList.contains('card--not-created')
    );
  };
  getCurrentList();

  const reorderArray = function (indexBefore, indexAfter) {
    const [movedCard] = curDeck.cards[curDeck.curLang].splice(indexBefore, 1);
    curDeck.cards[curDeck.curLang].splice(indexAfter, 0, movedCard);
  };

  currentList.addEventListener('dragstart', e => {
    const target = e.target.closest('.card--sides-block');

    if (target) {
      draggableEl = getLI(e.target);

      e.dataTransfer.setData('text/plain', null);

      getCurrentList();
      indexBefore = cardsListArr.indexOf(draggableEl);
    }
  });

  currentList.addEventListener('dragover', e => {
    e.preventDefault();

    const target = e.target.closest('.card--sides-block');

    if (target) {
      const li = getLI(e.target);

      const bounding = e.target.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;

      if (li !== draggableEl && !li.classList.contains('card--not-created')) {
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
    }
  });

  currentList.addEventListener('dragleave', e => {
    const target = e.target.closest('.card--sides-block');

    if (target) {
      const li = getLI(e.target);

      li.style.borderTop = '';
      li.style.borderBottom = '';
    }
  });

  currentList.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.card--sides-block');

    if (target) {
      const li = getLI(e.target);

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
    }
  });
};

const displayListOfCards = function () {
  const existingBlockWrapper = document.querySelector('.cards-block-wrapper');
  if (existingBlockWrapper) existingBlockWrapper.remove();

  const cardsBlockWrapper = document.createElement('div');
  cardsBlockWrapper.classList.add('cards-block-wrapper');

  const listOfCardsContainer = document.createElement('ul');
  listOfCardsContainer.classList.add('cards-list-container');

  cardsBlockWrapper.appendChild(listOfCardsContainer);
  appContainer.appendChild(cardsBlockWrapper);

  cardsBlockWrapper.prepend(cardsSearch);
  cardsBlockWrapper.appendChild(btnAddNewCard);

  if (Object.keys(curDeck.cards).length > 0) {
    curDeck.cards[curDeck.curLang].forEach(card => {
      listOfCardsContainer.insertAdjacentHTML(
        'beforeend',
        `<li class="card--sides-block" draggable="true">
        <div class="card--fside-separate">
          <p class="card--fside-q">${card.q}</p>
        </div>
        <div class="card--bside-separate">
          <p class="card--bside-a">${card.a}</p>
          ${
            card.img
              ? `<img class="card--img" src="${card.img}" draggable="false">`
              : ''
          }
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
          <button class="card--btn-del">
            <svg xmlns="http://www.w3.org/2000/svg"
            class="ionicon" viewBox="0 0 512 512">
            <title>Close</title><path fill="none"
            stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="48"
            d="M368 368L144 144M368 144L144 368"/>
            </svg>
          </button>
        </div>
       </li>`
      );
    });
  }

  cardsDnD();
};

const initDeck = function () {
  while (!decksList.lastElementChild.classList.contains('deck--item-create')) {
    decksList.removeChild(decksList.lastElementChild);
  }

  decks.forEach(deck => {
    const deckItemEl = document.createElement('li');
    deckItemEl.classList.add('deck--item');
    decksList.appendChild(deckItemEl);

    deckItemEl.textContent = deck.name.slice(0, 1).toUpperCase();
    deckItemEl.style.backgroundColor = deck.iconColor;
    deckItemEl.style.color = invertToBlackOrWhite(deck.iconColor);

    deckItemEl.dataset.deckName = deck.name;

    let cardsTotalNumber = 0;
    for (const lang of Object.values(deck.cards)) {
      cardsTotalNumber += lang.length;
    }

    deckItemEl.insertAdjacentHTML(
      'beforeend',
      `<div class="deck--info">
        <p>Name: ${deck.name}</p>
        <p>Author: ${deck.author}</p>
        <p>Languages: <span class="deck--cards-langs">${deck.languages.join(
          ', '
        )}</span></p>
        <p>Cards: <span class="deck--cards-num">${cardsTotalNumber}</span></p>
       </div>
      `
    );

    deckItemEl.addEventListener('click', e => openDeckWindow(e, deck));
  });
};

initDeck();

// Function creating a card HTML element
const displayCard = function (cards) {
  const cardsNotShownYet = cards.filter(card => card.shown === false);

  // END OF A DECK
  if (cardsNotShownYet.length === 0) {
    appMainArea.removeChild(document.querySelector('.card--container'));
    appMainArea.removeChild(btnNextCard);

    endMessage.style.display = 'block';

    curDeck.cards[curDeck.curLang].forEach(card => (card.shown = false));

    return;
  }

  const generateCardEl = function (card) {
    appMainArea.insertAdjacentHTML(
      'afterbegin',
      `<div class="card--container">
          <article class="card">
            <div class="card--fside">
              <p class="card--fside-q">${cardsNotShownYet[card].q}</p>
            </div>
            <div class="card--bside">
              <p class="card--bside-a">${cardsNotShownYet[card].a}</p>
              ${
                cardsNotShownYet[card].img
                  ? `<img class="card--img" src="${cardsNotShownYet[card].img}">`
                  : ''
              }
            </div>
          </article>
       </div>`
    );

    cardsNotShownYet[card].shown = true;
  };

  if (document.querySelector('.card--container')) {
    appMainArea.removeChild(document.querySelector('.card--container'));
  }

  if (curDeck.order === 'random') {
    const randomCard = Math.floor(Math.random() * cardsNotShownYet.length);
    generateCardEl(randomCard);
  } else if (curDeck.order === 'original') {
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

  const numOptionsBlock = document.querySelector('.deck--option--cards-num');
  const numToShowValue = +numToShowInput.value;

  if (
    numToShowValue > 0 &&
    numToShowValue <= curDeck.cards[curDeck.curLang].length
  ) {
    document.querySelector('.cards-list-container').remove();

    deckOptions.style.display = 'none';

    numToShow = numToShowValue;

    appMainArea.appendChild(btnNextCard);
    appMainArea.appendChild(cardsNumBlock);
    document.querySelector('.cards--totalNum').textContent = numToShow;

    displayCard(curDeck.cards[curDeck.curLang]);

    numToShowInput.value = '';
    wrongNumMessage.remove();
    cardsSearch.remove();
    btnAddNewCard.remove();
  } else numOptionsBlock.appendChild(wrongNumMessage);
});

btnNextCard.addEventListener('click', () => {
  numOfCardsShown++;
  if (numOfCardsShown > numToShow) {
    appMainArea.removeChild(document.querySelector('.card--container'));
    appMainArea.removeChild(btnNextCard);
    endMessage.style.display = 'block';
    numOfCardsShown = 1;

    document.querySelector('.card--curNum').textContent = 1;
  } else {
    document.querySelector('.card--curNum').textContent = Number(
      ++document.querySelector('.card--curNum').textContent
    );
    displayCard(curDeck.cards[curDeck.curLang]);
  }
});

document
  .querySelector('.deck--languages-options')
  .addEventListener('input', e => {
    curDeck.curLang = e.target.value.toLowerCase();

    displayListOfCards();
    makeCardsBtnsActive();
    disableBtnStartIfNoCards(curDeck);
  });

orderInputs.forEach(input => {
  const label = input.nextElementSibling;
  input.addEventListener('click', () => {
    curDeck.order = input.value;

    orderInputs.forEach(input => input.removeAttribute('checked'));
    input.setAttribute('checked', '');

    orderLabels.forEach(label => label.classList.remove('checked'));
    label.classList.add('checked');
  });
});

(function () {
  // DECK
  const deckCreateWindow = document.querySelector('.deck--create');
  const newDeckName = document.getElementById('deck_name');
  const newDeckAuthor = document.getElementById('deck_author');
  const newDeckLang = document.getElementById('deck_lang');
  const newDeckColor = document.getElementById('deck_icon_color');
  const errMessage = document.querySelector('.deck--err-message');
  const createNewDeckBtn = document.querySelector('.deck--create-btn');

  // CARD
  const cardCreateWindow = document.querySelector('.card--create');
  const q = document.querySelector('.card--create-q');
  const a = document.querySelector('.card--create-a');
  const img = document.querySelector('.card--create-img');
  const addCardBtn = document.querySelector('.deck--add-card-btn');

  const viewCreatedDeck = document.querySelector('.card--view-created-deck');

  let newDeck;
  let lang;

  createNewDeckIcon.addEventListener('click', () => {
    deckOptions.style.display = 'none';
    const existingBlockWrapper = document.querySelector('.cards-block-wrapper');
    if (existingBlockWrapper) existingBlockWrapper.remove();

    startMessage.style.display = 'none';
    createNewCardWindow.style.display = 'none';
    appMainArea.classList.remove('closed');
    appMainArea.classList.add('opened');

    deckCreateWindow.style.display = 'flex';

    newDeckName.focus();
  });

  createNewDeckBtn.addEventListener('click', e => {
    e.preventDefault();

    if (
      newDeckName.value === '' ||
      newDeckAuthor.value === '' ||
      newDeckLang.value === ''
    ) {
      errMessage.style.display = 'block';
      return false;
    }

    lang = newDeckLang.value;

    newDeck = new Deck(
      newDeckName.value,
      newDeckAuthor.value,
      [lang],
      newDeckColor.value
    );
    newDeck.curLang = lang.toLowerCase();
    newDeck.cards[lang.toLowerCase()] = [];

    decks.push(newDeck);

    deckCreateWindow.style.display = 'none';
    cardCreateWindow.style.display = 'flex';

    initDeck();

    q.focus();

    newDeckName.value = newDeckAuthor.value = newDeckLang.value = '';
  });

  addCardBtn.addEventListener('click', e => {
    e.preventDefault();

    newDeck.cards[lang.toLowerCase()].push(
      new Card(q.textContent, a.value, img.value)
    );

    q.textContent = a.value = img.value = '';

    curDeck = decks[decks.length - 1];

    updateCardsNum('increment');
  });

  viewCreatedDeck.addEventListener('click', e => {
    openDeckWindow(e, newDeck);
    cardCreateWindow.style.display = 'none';
  });
})();

deckDeleteWholeBtn.addEventListener('click', e => {
  e.preventDefault();

  const deckForDeletionIndex = decks.findIndex(
    deck => deck.name === curDeck.name
  );

  decksList.children[deckForDeletionIndex + 1].remove();

  decks.splice(deckForDeletionIndex, 1);

  deckOptions.style.display = 'none';
  document.querySelector('.cards-list-container').remove();

  appMainArea.classList.remove('opened');
  appMainArea.classList.add('closed');
  startMessage.style.display = 'block';
  cardsSearch.remove();
  btnAddNewCard.remove();
});

btnDeleteCurLang.addEventListener('click', e => {
  e.preventDefault();

  const langForDeletionIndex = curDeck.languages.findIndex(
    lang => lang === capitalizeFirstLetter(curDeck.curLang)
  );

  curDeck.languages.splice(langForDeletionIndex, 1);
  delete curDeck.cards[curDeck.curLang];

  [...deckLangsOptions.children].forEach(lang => {
    if (lang.value === capitalizeFirstLetter(curDeck.curLang)) lang.remove();
  });

  if (curDeck.languages.length > 0) {
    curDeck.curLang = curDeck.languages[0].toLowerCase();
  } else {
    curDeck.curLang = '';
  }

  deckLangsOptions.value = capitalizeFirstLetter(curDeck.curLang);

  displayListOfCards();
  makeCardsBtnsActive();
  updateCardsLangs();
  updateCardsNum('subtraction');

  if (curDeck.languages.length === 0) {
    cardsSearch.remove();
    btnAddNewCard.remove();

    btnStart.disabled = true;
  }
});

(function () {
  btnAddNewCard.addEventListener('click', () => {
    document.querySelector('.cards-list-container').insertAdjacentHTML(
      'beforeend',
      `<li class="card--sides-block card--not-created">
      <div class="card--fside-separate card--side-separate">
        <div class="card-q card--input-q" contenteditable="true" placeholder="Enter front-side text">
        </div>
      </div>
      <div class="card--bside-separate card--side-separate">
        <input type="text" class="card-a card--input-a" />
        <input type="url" class="card--input-img" placeholder="https://imgur.com" />
      </div>
      <div class="card--btns">
        <button class="card--btn-check">
          <svg xmlns="http://www.w3.org/2000/svg"
          class="ionicon" viewBox="0 0 512 512">
          <title>Checkmark</title><path fill="none"
          stroke="currentColor" stroke-linecap="round"
          stroke-linejoin="round" stroke-width="48"
          d="M416 128L192 384l-96-96"/></svg>
        </button>
      </div>
     </li>`
    );
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.card--btn-check')) {
      const curCardBlock = e.target.closest('.card--sides-block');

      const q = curCardBlock.querySelector('.card--input-q');
      const a = curCardBlock.querySelector('.card--input-a');
      const img = curCardBlock.querySelector('.card--input-img');

      curCardBlock.classList.remove('card--not-created');
      curCardBlock.setAttribute('draggable', 'true');

      curCardBlock.innerHTML = '';
      curCardBlock.insertAdjacentHTML(
        'afterbegin',
        `<div class="card--fside-separate">
          <p class="card--fside-q">${q.textContent}</p>
        </div>
        <div class="card--bside-separate">
          <p class="card--bside-a">${a.value}</p>
          ${
            img.value
              ? `<img class="card--img" src="${img.value}" draggable="false">`
              : ''
          }
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
          <button class="card--btn-del">
            <svg xmlns="http://www.w3.org/2000/svg"
            class="ionicon" viewBox="0 0 512 512">
            <title>Close</title><path fill="none"
            stroke="currentColor" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="48"
            d="M368 368L144 144M368 144L144 368"/>
            </svg>
          </button>
        </div>`
      );

      const btnsBlock = curCardBlock.querySelector('.card--btns');

      updateIndices();

      curDeck.cards[curDeck.curLang].splice(
        +btnsBlock.dataset.cardI,
        0,
        new Card(q.textContent, a.value, img.value)
      );

      disableFirstAndLastBtns();
      btnStart.disabled = false;

      updateCardsNum('increment');
    }
  });
})();

addNewLangBtn.addEventListener('click', e => {
  e.preventDefault();

  const langBlock = document.querySelector('.deck--language');

  if (langInput.value !== '') {
    if (curDeck.languages.length === 0) {
      const cardsListWrapper = document.querySelector('.cards-block-wrapper');

      cardsListWrapper.prepend(cardsSearch);
      cardsListWrapper.appendChild(btnAddNewCard);
    }

    const langsSelectList = document.querySelector('.deck--languages-options');

    const newLang = document.createElement('option');
    newLang.textContent = toNormalCase(langInput.value);

    curDeck.languages.push(newLang.textContent);
    curDeck.cards[newLang.textContent.toLowerCase()] = [];

    langsSelectList.add(newLang);

    langInput.value = '';

    // set the newly created lang as a curLang
    curDeck.curLang = newLang.textContent.toLowerCase();

    displayListOfCards();
    makeCardsBtnsActive();
    deckLangsOptions.value = toNormalCase(curDeck.curLang);
    updateCardsLangs();

    btnStart.disabled = true;

    langIsEmptyMessage.remove();
  } else langBlock.appendChild(langIsEmptyMessage);
});

decksSearch.addEventListener('keyup', () => {
  const decks = document.querySelectorAll('.deck--item');
  const input = decksSearch.value.toLowerCase();

  decks.forEach((deck, i) => {
    if (i === 0) return;
    if (deck.dataset.deckName.toLowerCase().includes(input)) {
      deck.style.display = 'flex';
    } else deck.style.display = 'none';
  });
});

cardsSearch.addEventListener('keyup', () => {
  const cards = document.querySelectorAll('.card--sides-block');
  const input = cardsSearch.value.toLowerCase();

  cards.forEach(card => {
    const fsideText = card
      .querySelector('.card--fside-separate')
      .textContent.trim()
      .toLowerCase();
    const bsideText = card
      .querySelector('.card--bside-separate')
      .textContent.trim()
      .toLowerCase();

    if (fsideText.includes(input) || bsideText.includes(input)) {
      card.style.display = 'flex';
    } else card.style.display = 'none';
  });
});

appSidebar.addEventListener('mousemove', e => {
  const target = e.target.closest('.deck--item');

  if (target) {
    const deckInfoBlock = target.querySelector('.deck--info');
    deckInfoBlock.style.display = 'block';

    deckInfoBlock.style.top = e.pageY + 'px';
    deckInfoBlock.style.left = e.pageX + 'px';

    target.onmouseleave = () => (deckInfoBlock.style.display = 'none');
  }
});
