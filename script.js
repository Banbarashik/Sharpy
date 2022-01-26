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
const deckModesList = document.querySelector('.deck--modes-list');
const deckDeleteCurLangBtn = document.querySelector('.deck--del--cur-lang');
const deckDeleteWholeBtn = document.querySelector('.deck--del--whole');
const btnStart = document.querySelector('input[value="Start"]');
const card = document.querySelector('.card');
const createNewDeckIcon = document.querySelector('.deck--item-create');
const createNewCardWindow = document.querySelector('.card--create');
const addNewLangBtn = document.querySelector('.lang--add-btn');

// Creating DOM elements
const btnNextCard = document.createElement('button');
btnNextCard.classList.add('btn--next-card');
btnNextCard.textContent = 'Next card';

const btnAddNewCard = document.createElement('button');
btnAddNewCard.classList.add('cards--add-new');
btnAddNewCard.textContent = 'Add a new card';

const cardsSearch = document.createElement('input');
cardsSearch.setAttribute('type', 'text');
cardsSearch.setAttribute('placeholder', 'search for a card...');

// State variables
let curDeck;
let order = 'random';

class Deck {
  constructor(name, author, languages) {
    this.name = name;
    this.author = author;
    this.languages = languages;
    this.modes = ['Flashcards', 'Multiple choice'];
    this.cards = {};
    this.curLang = null;
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

const skyrimDeck = new Deck('Skyrim', 'Wadim', ['Russian', 'English']);
skyrimDeck.cards.english = [
  new Card('What is the name of the main character?', 'Dovahkiin'),
  new Card('When the game was released?', '2011'),
  new Card('What is the level cap?', '81'),
];
skyrimDeck.cards.russian = [
  new Card('Как зовут главного героя?', 'Довакин'),
  new Card('В каком году игра была выпущена?', '2011'),
  new Card('Каков максимальный уровень игрока?', '81'),
];

const hatInTimeDeck = new Deck('A Hat in Time', 'Lexa', ['Russian', 'English']);
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

const updateCardsNum = function (operation) {
  const decksIcons = [...decksList.children];
  const curDeckIcon = decksIcons.find(
    deck => deck.dataset.deckName === curDeck.name
  );
  const cardsNum = curDeckIcon.querySelector('.deck--cards-num');
  cardsNum.textContent =
    operation === 'increment'
      ? Number(++cardsNum.textContent)
      : Number(--cardsNum.textContent);
};

const openDeckWindow = function (e, deck) {
  e.preventDefault();

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
  fillDeckOptions(deck.modes, deckModesList, 'input');

  const langOpt = document.querySelector('.deck--languages-options');
  deck.curLang = deck.curLang ? deck.curLang : langOpt.value.toLowerCase();
  langOpt.value = capitalizeFirstLetter(deck.curLang);

  if (deck.languages.length > 0) {
    displayListOfCards();
    makeCardsMovableByBtns();
  } else {
    document.querySelector('.cards-list-container').remove();
  }
};

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

const makeCardsMovableByBtns = function () {
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
    )
  );

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

    deckItemEl.textContent = deck.name.slice(0, 1);

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
        <p>Languages: ${deck.languages.join(', ')}</p>
        <p>Cards: <span class="deck--cards-num">${cardsTotalNumber}</span></p>
       </div>
      `
    );

    deckItemEl.addEventListener('click', e => openDeckWindow(e, deck));
  });
};

initDeck();

// Function creating a card HTML element
const displayCard = function (deck) {
  const deckNotShownYet = deck.filter(card => card.shown === false);

  // END OF A DECK
  if (deckNotShownYet.length === 0) {
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
    curDeck.curLang = e.target.value.toLowerCase();

    displayListOfCards();
    makeCardsMovableByBtns();
  });

document
  .getElementsByName('order')
  .forEach(input =>
    input.addEventListener('input', e => (order = e.target.value))
  );

(function () {
  // DECK
  const deckCreateWindow = document.querySelector('.deck--create');
  const newDeckName = document.getElementById('deck_name');
  const newDeckAuthor = document.getElementById('deck_author');
  const newDeckLang = document.getElementById('deck_lang');
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
    if (document.querySelector('.cards-list-container'))
      document.querySelector('.cards-list-container').remove();

    startMessage.style.display = 'none';
    createNewCardWindow.style.display = 'none';

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

    newDeck = new Deck(newDeckName.value, newDeckAuthor.value, [lang]);
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
});

deckDeleteCurLangBtn.addEventListener('click', e => {
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
  }

  deckLangsOptions.value = capitalizeFirstLetter(curDeck.curLang);

  console.log(curDeck, curDeck.curLang, curDeck.languages);

  if (curDeck.languages.length > 0) {
    displayListOfCards();
    makeCardsMovableByBtns();
  } else {
    document.querySelector('.cards-list-container').remove();
  }
});

(function () {
  btnAddNewCard.addEventListener('click', () => {
    document.querySelector('.cards-list-container').insertAdjacentHTML(
      'beforeend',
      `<li class="card--sides-block card--not-created">
      <div class="card--fside-separate card--side-separate">
        <div class="card-q card--add-q" contenteditable="true" placeholder="Enter front-side text">
        </div>
      </div>
      <div class="card--bside-separate card--side-separate">
        <input type="text" class="card-a card--add-a" />
        <input type="url" class="card--add-img" placeholder="https://imgur.com" />
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

      const q = curCardBlock.querySelector('.card--add-q');
      const a = curCardBlock.querySelector('.card--add-a');
      const img = curCardBlock.querySelector('.card--add-img');

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

      updateCardsNum('increment');
    }
  });
})();

addNewLangBtn.addEventListener('click', e => {
  e.preventDefault();

  const langsSelectList = document.querySelector('.deck--languages-options');
  const langInput = document.getElementById('lang_input');
  const newLang = document.createElement('option');
  newLang.textContent = toNormalCase(langInput.value);

  curDeck.languages.push(newLang.textContent);
  curDeck.cards[newLang.textContent.toLowerCase()] = [];

  langsSelectList.add(newLang);

  langInput.value = '';
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
  const target = e.target.closest('.deck--item:not(.deck--item-create)');

  if (target) {
    const deckInfoBlock = target.querySelector('.deck--info');
    deckInfoBlock.style.display = 'block';

    deckInfoBlock.style.top = e.pageY + 'px';
    deckInfoBlock.style.left = e.pageX + 'px';

    target.onmouseleave = () => (deckInfoBlock.style.display = 'none');
  }
});
