const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
}

const Suits = [
  './image/diamond.png',  // 方塊
  './image/club.png',    // 梅花
  './image/heart.png',   // 愛心
  './image/spade.png'    // 黑桃
]



const modal = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 250,
  triedTimes: 0
}

const view = {
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong')
      }, { once: true })
    })
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")

  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.innerHTML = null
      card.classList.add('back')
    })
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const suit = Suits[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${suit}" alt="suit of poker card" />
      <p>${number}</p>
    `
  },

  getCardElement(index) {
    const cardColor = (Math.floor(index / 13) % 2 === 0)
    return cardColor ?
      `<div data-index="${index}" class="card back red-card"></div>` :
      `<div data-index="${index}" class="card back"></div>`
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  popWinMessage(score, times) {
    const rootElement = document.querySelector('#cards')
    const winMessage = document.createElement('div')
    winMessage.setAttribute('class', 'win-message')
    winMessage.innerHTML = `
      <p>Complete!</h2>
      <p>Score: ${score}</p>
      <p>You've tried: ${times} times</p>
      <div class="btn-retry">Try Again</div>      
    `
    rootElement.before(winMessage)
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times
      } times`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        modal.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++modal.triedTimes)
        view.flipCards(card)
        modal.revealedCards.push(card)

        if (modal.isRevealedCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(modal.score += 10)
          view.pairCards(...modal.revealedCards)
          modal.revealedCards = []

          if (modal.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.popWinMessage(modal.score, modal.triedTimes)
            const retryButton = document.querySelector('.btn-retry')
            retryButton.addEventListener('click', event => {
              const winMessage = document.querySelector('.win-message')
              winMessage.remove()
              this.resetGame()
            })
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...modal.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
    }
  },

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
    console.log(`CurrentState: "${this.currentState}`)
  },

  resetCards() {
    view.flipCards(...modal.revealedCards)
    modal.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  resetGame() {
    this.currentState = GAME_STATE.FirstCardAwaits
    modal.score = 0
    modal.triedTimes = 0
    modal.revealedCards = []
    view.renderScore(modal.score)
    view.renderTriedTimes(modal.triedTimes)
    this.generateCards()
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        this.dispatchCardAction(card)
      })
    })
  }

}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.resetGame()