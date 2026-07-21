export const MY_GARDEN_WORLD_GAME_ID = 3

const hiddenGameIds = new Set([MY_GARDEN_WORLD_GAME_ID])

export const isGameVisible = (gameId) => !hiddenGameIds.has(Number(gameId))

export const filterVisibleGames = (games) => games.filter((game) => isGameVisible(game.value))

export const filterVisibleGameIds = (gameIds) => gameIds.filter((gameId) => isGameVisible(gameId))
