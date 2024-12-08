import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReplayStore = defineStore('replay', () => {
  const showModal = ref(false)
  const selectedReplay = ref({ board: [], actions: [] })
  const showFlipped = ref([])
  const flippedCards = ref([])
  const progress = ref(0)
  const currentTime = ref(0)
  const replayInterval = ref(null)
  const maxTime = ref(0)
  const isCheckingMatch = ref(false)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentActionIndex = ref(0)
  const isReplayFinished = ref(false)
  const currentDifficulty = ref('Normal')
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const initializeFlippedCards = (board) => {
    showFlipped.value = board.map((row) => row.map(() => false))
    flippedCards.value = []
  }

  const handleReplay = (replayData, difficulty) => {
    if (replayData && replayData.board && replayData.actions) {
      selectedReplay.value = replayData
      currentDifficulty.value = difficulty
      initializeFlippedCards(replayData.board)
      maxTime.value = Math.max(...replayData.actions.map((action) => action.time))
      currentTime.value = 0
      currentActionIndex.value = 0
      showModal.value = true
      startReplay()
    }
  }

  const startReplay = async () => {
    initializeFlippedCards(selectedReplay.value.board)
    currentActionIndex.value = 0
    maxTime.value = Math.max(...selectedReplay.value.actions.map((action) => action.time))
    currentTime.value = 0
    progress.value = 0
    isPlaying.value = true
    isPaused.value = false

    await delay(1000)
    processActionQueue()
  }

  const processActionQueue = async () => {
    isReplayFinished.value = false

    while (currentTime.value < maxTime.value && isPlaying.value && !isPaused.value) {
      const nextAction = selectedReplay.value.actions[currentActionIndex.value]
      const nextActionTime = nextAction ? nextAction.time : maxTime.value
      const timeStep = 50

      while (currentTime.value < nextActionTime && isPlaying.value && !isPaused.value) {
        await delay(timeStep)
        currentTime.value = Math.min(currentTime.value + timeStep, nextActionTime)
        progress.value = (currentTime.value / maxTime.value) * 100
      }

      if (isPaused.value) return

      if (nextAction && currentTime.value >= nextAction.time) {
        flipCard(nextAction.position)
        currentActionIndex.value++
        await waitForMatchCheck()
      }
    }

    if (!isPaused.value) {
      isPlaying.value = false
      isReplayFinished.value = true
    }
  }

  const waitForMatchCheck = async () => {
    while (isCheckingMatch.value) {
      await delay(100)
    }
  }

  const flipCard = ([row, col], skipCheck = false) => {
    if (showFlipped.value[row][col]) return

    showFlipped.value[row][col] = true
    flippedCards.value.push({ row, col })

    const requiredFlips = currentDifficulty.value === 'Hard' ? 3 : 2

    if (!skipCheck && flippedCards.value.length === requiredFlips) {
      checkMatch()
    }
  }

  const checkMatch = () => {
    isCheckingMatch.value = true
    const flippedValues = flippedCards.value.map(
      ({ row, col }) => selectedReplay.value.board[row][col]
    )
    const allMatch = flippedValues.every((card) => card === flippedValues[0])

    if (allMatch) {
      flippedCards.value.forEach(({ row, col }) => {
        showFlipped.value[row][col] = 'matched'
      })
      flippedCards.value = []
    } else {
      setTimeout(() => {
        flippedCards.value.forEach(({ row, col }) => {
          showFlipped.value[row][col] = false
        })
        flippedCards.value = []
      }, 800)
    }
    isCheckingMatch.value = false
  }

  const pauseReplay = () => {
    isPaused.value = true
    isPlaying.value = false
  }

  const updateProgress = () => {
    isPlaying.value = false
    isPaused.value = true
    isReplayFinished.value = false
    clearInterval(replayInterval.value)

    currentTime.value = Math.max(0, Math.min(currentTime.value, maxTime.value))
    progress.value = (currentTime.value / maxTime.value) * 100

    initializeFlippedCards(selectedReplay.value.board)
    flippedCards.value = []
    currentActionIndex.value = 0

    for (let i = 0; i < selectedReplay.value.actions.length; i++) {
      const action = selectedReplay.value.actions[i]

      if (action.time > currentTime.value) break

      flipCard(action.position, true)

      currentActionIndex.value = i + 1

      const requiredFlips = currentDifficulty.value === 'Hard' ? 3 : 2
      if (flippedCards.value.length === requiredFlips) {
        checkMatchImmediately()
      }
    }

    isPaused.value = true
    isPlaying.value = false
  }

  const checkMatchImmediately = () => {
    const requiredFlips = currentDifficulty.value === 'Hard' ? 3 : 2

    if (flippedCards.value.length < requiredFlips) return

    const flippedValues = flippedCards.value.map(
      ({ row, col }) => selectedReplay.value.board[row][col]
    )

    const allMatch = flippedValues.every((card) => card === flippedValues[0])

    if (allMatch) {
      flippedCards.value.forEach(({ row, col }) => {
        showFlipped.value[row][col] = 'matched'
      })
      flippedCards.value = []
    } else {
      flippedCards.value.forEach(({ row, col }) => {
        showFlipped.value[row][col] = false
      })
      flippedCards.value = []
    }
  }

  const togglePlayPause = () => {
    if (isReplayFinished.value) {
      restartReplay()
    } else {
      if (isPaused.value) {
        isPaused.value = false
        isPlaying.value = true
        processActionQueue()
      } else {
        isPaused.value = true
        isPlaying.value = false
      }
    }
  }

  const restartReplay = () => {
    isPlaying.value = false
    isPaused.value = false
    isReplayFinished.value = false
    currentTime.value = 0
    currentActionIndex.value = 0
    flippedCards.value = []
    showFlipped.value = selectedReplay.value.board.map((row) => row.map(() => false))

    startReplay()
  }

  return {
    showModal,
    selectedReplay,
    showFlipped,
    flippedCards,
    progress,
    currentTime,
    replayInterval,
    maxTime,
    isCheckingMatch,
    isPlaying,
    isPaused,
    currentActionIndex,
    isReplayFinished,
    currentDifficulty,
    handleReplay,
    startReplay,
    flipCard,
    initializeFlippedCards,
    pauseReplay,
    updateProgress,
    togglePlayPause,
    restartReplay
  }
})
