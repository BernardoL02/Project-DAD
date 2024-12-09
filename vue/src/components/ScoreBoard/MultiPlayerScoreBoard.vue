<script setup>
import { onMounted, computed } from 'vue'
import { usescoreBoardStore } from '@/stores/scoreBoard'

const scoreBoardStore = usescoreBoardStore()
const loading = computed(() => scoreBoardStore.loading)

onMounted(async () => {

  scoreBoardStore.loading = true;

  await scoreBoardStore.fetchMultiPlayerScoreboard()

  scoreBoardStore.topPlayer1 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[0].Player
  )
  scoreBoardStore.topPlayer2 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[1].Player
  )
  scoreBoardStore.topPlayer3 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[2].Player
  )
  scoreBoardStore.topPlayer4 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[3].Player
  )
  scoreBoardStore.topPlayer5 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[4].Player
  )

  scoreBoardStore.loading = false;
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6 mt-6">
    <div>
      <div>
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <div class="flex items-center justify-center">
            <div class="text-center">
              <p class="text-xl text-gray-700 font-semibold">Multi-Player Global Score Board</p>
              <div class="flex items-center space-x-3 justify-center mt-4">
                <img src="/fireworks.png" alt="Notification Icon" class="w-7 h-7 " />
                <p class="text-base text-gray-600">
                  Congratulations to the Top 5 players
                </p>
                <img src="/fireworks.png" alt="Notification Icon" class="w-7 h-7" />
              </div>

              <p class="mt-4 text-sm text-gray-500">
                Your photographic memory and sharp strategy have placed you
                among the best in the Memory Game. <br> Keep showing the world your unmatched skills!
              </p>
            </div>
          </div>
        </div>

        <div v-if="loading == false" class="bg-white p-6 rounded-lg shadow-md mb-6 pb-12">
          <div class="flex items-end justify-center space-x-12 mb-6">
            <div class="player-container flex flex-col items-center top-[120px] left-8 relative group">
              <img v-if="scoreBoardStore.topPlayer4?.photo_filename" :src="scoreBoardStore.topPlayer4.photo_filename"
                alt="User Profile Picture"
                class="w-16 h-16 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />

              <div
                class="w-64 h-24 border border-gray-200 items-center justify-center absolute left-[-95px] top-[159px] opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ease-in-out">
                <div class="w-full p-4 pl-3 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="flex justify-center items-center mb-[-8px]">
                      <p class="text-md font-bold text-gray-700 truncate pl-2">
                        {{ scoreBoardStore.topPlayer4?.nickname }}
                      </p>
                    </div>

                    <div class="flex space-x-6 text-center items-center pt-2">
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Victories</p>
                        <p class="text-sm text-green-500">{{ scoreBoardStore.scoreboards[3]?.Victories }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Win/Loss</p>
                        <p class="text-sm text-gray-500">{{ scoreBoardStore.scoreboards[3]?.WinRatio }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Losses</p>
                        <p class="text-sm text-red-500">{{ scoreBoardStore.scoreboards[3]?.Losses }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="player-container flex flex-col items-center top-[62px] left-4 relative group">
              <img v-if="scoreBoardStore.topPlayer2?.photo_filename" :src="scoreBoardStore.topPlayer2.photo_filename"
                alt="User Profile Picture"
                class="w-16 h-16 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl cursor-pointer" />

              <div
                class="w-64 h-24 border border-gray-200 items-center justify-center absolute left-[-95px] top-[217px] opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ease-in-out">
                <div class="w-full p-4 pl-3 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="flex justify-center items-center mb-[-8px]">
                      <p class="text-md font-bold text-gray-700 truncate pl-2">
                        {{ scoreBoardStore.topPlayer2?.nickname }}
                      </p>
                    </div>

                    <div class="flex space-x-6 text-center items-center pt-2">
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Victories</p>
                        <p class="text-sm text-green-500">{{ scoreBoardStore.scoreboards[1]?.Victories }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Win/Loss</p>
                        <p class="text-sm text-gray-500">{{ scoreBoardStore.scoreboards[1]?.WinRatio }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Losses</p>
                        <p class="text-sm text-red-500">{{ scoreBoardStore.scoreboards[1]?.Losses }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="player-container flex flex-col items-center top-6 relative group">
              <img v-if="scoreBoardStore.topPlayer1?.photo_filename" :src="scoreBoardStore.topPlayer1.photo_filename"
                alt="User Profile Picture"
                class=" w-16 h-16 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl cursor-pointer" />

              <div
                class="w-64 h-24 border border-gray-200 items-center justify-center absolute left-[-95px] top-[255px] opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ease-in-out">
                <div class="w-full p-4 pl-3 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="flex justify-center items-center mb-[-8px]">
                      <p class="text-md font-bold text-gray-700 truncate pl-2">
                        {{ scoreBoardStore.topPlayer1?.nickname }}
                      </p>
                    </div>

                    <div class="flex space-x-6 text-center items-center pt-2">
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Victories</p>
                        <p class="text-sm text-green-500">{{ scoreBoardStore.scoreboards[0]?.Victories }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Win/Loss</p>
                        <p class="text-sm text-gray-500">{{ scoreBoardStore.scoreboards[0]?.WinRatio }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Losses</p>
                        <p class="text-sm text-red-500">{{ scoreBoardStore.scoreboards[0]?.Losses }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="player-container flex flex-col items-center top-[95px] right-3 relative group">
              <img v-if="scoreBoardStore.topPlayer3?.photo_filename" :src="scoreBoardStore.topPlayer3.photo_filename"
                alt="User Profile Picture"
                class="w-16 h-16 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />

              <div
                class="w-64 h-24 border border-gray-200 items-center justify-center absolute left-[-95px] top-[184px] opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ease-in-out">
                <div class="w-full p-4 pl-3 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="flex justify-center items-center mb-[-8px]">
                      <p class="text-md font-bold text-gray-700 truncate pl-2">
                        {{ scoreBoardStore.topPlayer3?.nickname }}
                      </p>
                    </div>

                    <div class="flex space-x-6 text-center items-center pt-2">
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Victories</p>
                        <p class="text-sm text-green-500">{{ scoreBoardStore.scoreboards[2]?.Victories }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Win/Loss</p>
                        <p class="text-sm text-gray-500">{{ scoreBoardStore.scoreboards[2]?.WinRatio }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Losses</p>
                        <p class="text-sm text-red-500">{{ scoreBoardStore.scoreboards[2]?.Losses }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div class="player-container flex flex-col items-center top-[146px] right-7 relative group">
              <!-- Imagem do jogador -->
              <img v-if="scoreBoardStore.topPlayer5?.photo_filename" :src="scoreBoardStore.topPlayer5.photo_filename"
                alt="User Profile Picture"
                class="w-16 h-16 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />
              <div
                class="w-64 h-24 border border-gray-200 items-center justify-center absolute left-[-95px] top-[133px] opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg z-10 transition-all duration-300 ease-in-out">
                <div class="w-full p-4 pl-3 flex flex-col items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="flex justify-center items-center mb-[-8px]">
                      <p class="text-md font-bold text-gray-700 truncate pl-2">
                        {{ scoreBoardStore.topPlayer5?.nickname }}
                      </p>
                    </div>

                    <div class="flex space-x-6 text-center items-center pt-2">
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Victories</p>
                        <p class="text-sm text-green-500">{{ scoreBoardStore.scoreboards[4]?.Victories }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Win/Loss</p>
                        <p class="text-sm text-gray-500">{{ scoreBoardStore.scoreboards[4]?.WinRatio }}</p>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-700">Losses</p>
                        <p class="text-sm text-red-500">{{ scoreBoardStore.scoreboards[4]?.Losses }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <img src="/podium3.png" alt="Podium" class="mx-auto w-[500px] h-auto pb-2" />
        </div>
        <div v-else>
          <div v-if="loading" class="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-container {
  position: relative;
  animation: slide-in 0.8s ease-in-out;
}

@keyframes slide-in {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.top-12 {
  top: 3rem;
}

.top-4 {
  top: 1rem;
}

.top-20 {
  top: 5rem;
}
</style>

<!---
<div
                class="absolute top-full mt-2 w-full bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out rounded-lg shadow-lg flex justify-center items-center z-10">
                <div class="mt-3 grid grid-cols-1 px-4">
                  <div>
                    <p class="text-sm text-gray-700">
                      {{ scoreBoardStore.topPlayer3.nickname }}
                    </p>
                    <p class="text-sm text-gray-700">
                      Victories - {{ scoreBoardStore.scoreboards[2].Victories }}
                    </p>
                    <p class="text-sm text-gray-700">
                      Losses - {{ scoreBoardStore.scoreboards[2].Losses }}
                    </p>
                    <p class="text-sm text-gray-700">
                      Win/Loss Ratio - {{ scoreBoardStore.scoreboards[2].WinRatio }}
                    </p>
                  </div>
                </div>
              </div>
-->