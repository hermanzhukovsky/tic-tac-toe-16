import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import * as storage from './storage';

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		gameIsOver: false,
		bot: {
			symbol: null,
			id: null,
			isHisTurn: false,
			isWinner: false
		},
		player: {
			symbol: null,
			id: null,
			isHisTurn: false,
			isWinner: false
		},
		count: {
			firstPlayer: 0,
			secondPlayer: 0
		},
		turn: {
			isFirstPlayerTurn: false,
			isSecondPlayerTurn: false
		},
		squares: [
			{ id: 1, value: "", isHighlighted: false }, 
			{ id: 2, value: "", isHighlighted: false },
			{ id: 3, value: "", isHighlighted: false },
			{ id: 4, value: "", isHighlighted: false },
			{ id: 5, value: "", isHighlighted: false },
			{ id: 6, value: "", isHighlighted: false },
			{ id: 7, value: "", isHighlighted: false },
			{ id: 8, value: "", isHighlighted: false },
			{ id: 9, value: "", isHighlighted: false },
		],
		lines: [
			[0, 4, 8],
			[2, 4, 6],
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8]
		],
		mode: '',
	},
	actions: {
		/**
		 * Запускает предыдущую игру, на основе того режима,
		 * который был прерван в прошлой игре
		 */
		loadGame({ state, commit, dispatch }) {
			const mode = localStorage.getItem('mode');
			if (!mode) return;
			
			switch (mode) {
				case 'single-player':
					if (state.mode) return;
					commit('initSinglePlayerOptions');
					if (state.bot.isHisTurn) {
						dispatch('botHandler');
					}
					commit('setSquaresValues');
					commit('setMode', mode);
					return;
				case 'multiplayer':
					if (state.mode) return;
					commit('initMultiplayerOptions');
					commit('setSquaresValues');
					commit('setMode', mode);
					return;
			}
		},
		/** 
		 * Входная точка, устанавливает глобальные настройки приложения
		 * @param {String} mode - Режим игры, который выбрал пользователь
		 */
		initGame({ commit, state, dispatch }, mode) {
			if (localStorage.getItem('mode') === 'multiplayer' && mode === 'single-player') {
				localStorage.setItem('resetOtherGames', true);
				storage.clearStorage();
			}
			if (localStorage.getItem('mode') === 'single-player' && mode === 'multiplayer') {
				storage.clearStorage();
			}
		
			commit('setMode', mode);
			if (!localStorage.getItem('mode')) {
				storage.initOptions(mode);
				storage.setSymbols();
				storage.setTurn();
				commit ('setTurn');
			}

			if (mode === 'multiplayer') {
				
				commit('initMultiplayerOptions');
			}

			if (mode === 'single-player') {
				commit('initSinglePlayerOptions');
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
				}
			}

			commit('setSquaresValues');
			commit ('setTurn');
		},
	
		/**
		 * Обрабатывает клик по ячейки
		 * @param {Number} index - Индекс ячейки, по которой произошел клик
		 */
		onSquareClick({ state, commit, dispatch, getters }, index) {
			if (state.mode && localStorage.getItem('mode') && localStorage.getItem('mode') !== state.mode) {
				return;
			}

			if (state.gameIsOver) {
				storage.resetGame();
				commit('setSquaresValues');
				commit('resetHighlightedSquares');
				commit('setGameIsOver')
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
					commit('setSquaresValues');
				}
				return;
			}
			if (getters.emptySquaresCount === 0) {
				dispatch('calculateWinner', 'player');
				storage.resetGame();
				commit('setSquaresValues');

				if (state.mode === 'single-player') {
					storage.updateTurn();
					commit('toggleTurn');
					commit ('setTurn');
				}
				
				if (state.bot.isHisTurn) {
					dispatch('botHandler');
					commit('setSquaresValues');
				}
				return;
			}
			if (!state.player.isHisTurn) return;
			if (state.squares[index].value !== "") return;

			storage.updateSquaresValues(state.player.symbol, index);
			commit('setSquaresValues');

			storage.updateTurn();
			commit('toggleTurn');
			commit ('setTurn');
			dispatch('calculateWinner', 'player');
			
			if (state.mode !== 'multiplayer' && state.bot.isHisTurn && !state.gameIsOver) {
				dispatch('botHandler');
				commit('setSquaresValues');
				dispatch('calculateWinner', 'bot');
				
			}
			
		
		}, 
		/**
		 * Определяет победителя игры
		 * @param {String} playerOrBot - В зависимости от значения "player" или "bot"
		 * рассчитывает, кто выиграл игру
		 */
		calculateWinner({ state, commit }, playerOrBot) {
			for (let index = 0; index < state.lines.length; index++) {
				const line = state.lines[index];
				const symbol = state[playerOrBot].symbol;
				const [firstIndex, secondIndex, thirdIndex] = line;
				
				const firstSquare = state.squares[firstIndex];
				const secondSqure = state.squares[secondIndex];
				const thirdSquare = state.squares[thirdIndex];
			
				if (firstSquare.value === symbol && secondSqure.value === symbol && thirdSquare.value === symbol) {	
						
					storage.updateWinner(state[playerOrBot].id);
					commit('setWinner');
					
					storage.toggleGameIsOver();
					commit('setGameIsOver');

					commit('setCount'); 
					storage.updateCount(state[playerOrBot].id);
					commit('setCount');

					storage.updateHighlightedSquares([firstIndex, secondIndex, thirdIndex]);
					commit('setHighlightedSquares');
					break;
				}
			}
		},
		/**
		 * Отвечает за ход бота, анализирует ходы игрока
		 */
		botHandler({ state, commit, getters }) {
			if (!state.bot.isHisTurn && state.gameIsOver) return;
			const history = JSON.parse(localStorage.getItem('history'));
			// const randomIndex = history.indexOf("");

			// if (randomIndex !== -1) {
			// 	// const randomIndex = Math.floor(Math.random() * emptySquares.length);
			// 	history[randomIndex] = state.bot.symbol; 
			// 	localStorage.setItem('history', JSON.stringify(history));
			// }
			// // else {
			// // 	state.gameIsOver = true;
			// // }
			let index = history.indexOf(state.player.symbol);
			const indices = [];
			let target;
			while (index !== -1) {
				indices.push(index);
				index = history.indexOf(state.player.symbol, index + 1);
			}
			const intersec = [];
			for (let index = 0; index < state.lines.length; index++) {
				const line = state.lines[index];
				const temp = indices.filter(el => line.includes(el));
				if (temp.length === 2) {
					target = line.filter(el => temp.indexOf(el) === -1);
					break;
				}
			}
			debugger;
			if (target) {
				history[target] = state.bot.symbol;
			} else {
				const emptySquares = history.filter(el => el === "");
				const randomIndex = Math.floor(Math.random() * emptySquares.length);
				history[randomIndex] = state.bot.symbol; 
			}
			localStorage.setItem('history', JSON.stringify(history));

			storage.updateTurn();
			commit('toggleTurn');
			commit ('setTurn');
		},
	},
	mutations: {
		/**
		 * Меняет режим игры
		 * @param {String} mode - Режим, который нужно изменить
		 */
		setMode(state, mode) {
			state.mode = mode;
		},
		/**
		 * Устанавливает текущие значение состояния игры из localStorage
		 */
		setGameIsOver(state) {
			const gameIsOver = JSON.parse(localStorage.getItem('gameIsOver'));
			state.gameIsOver = gameIsOver;
		},
		/**
		 * Сбрасывает подсветку линии
		 */
		resetHighlightedSquares(state) {
			for (let index = 0; index < state.squares.length; index++) {
				const item = state.squares[index]
				if (item.isHighlighted) {
					item.isHighlighted = false;
				}
			}
		},
		/**
		 * Устанавливает победителя, беря его id из localStorage 
		 */
		setWinner(state) {
			const winner = JSON.parse(localStorage.getItem('winner'));
			if (state.player.id === winner) {
				state.player.isWinner = true;
			}
		},
		/**
		 * Сбрасывает ход игрока
		 */
		resetPlayerTurn(state) {
			if (state.mode === 'single-player') {
				state.player.isHisTurn = false;
			}

		/**
		 * Устанавливает актуальные значения клеток из localStorage
		 */
		},
		setSquaresValues(state) {
			const history = JSON.parse(localStorage.getItem('history'));
			state.squares.forEach((square, index) => {
				square.value = history[index];
			});
		},
		/**
		 * Переключает очередь, чтобы установить значение клетки мог тот игрок,
		 * у которого ключ isHisTurn со значение true
		 */
		toggleTurn(state) {
			state.player.isHisTurn = !state.player.isHisTurn;
			if (state.mode === 'single-player') {
				state.bot.isHisTurn = !state.bot.isHisTurn
			} 
		},
		/**
		 * Устанавливает, кто сейчас будет ходить
		 */
		setTurn(state) {
			const turn = JSON.parse(localStorage.getItem('turn'));
			state.turn.isFirstPlayerTurn = turn.isFirstPlayerTurn;
			state.turn.isSecondPlayerTurn = turn.isSecondPlayerTurn;
		},
		/**
		 * Обновляет состояние текущего счета игроков/бота, беря значения
		 * из localStorage
		 */
		setCount(state) {
			const count = JSON.parse(localStorage.getItem('count'));
			state.count.firstPlayer = Number(count.firstPlayer);
			state.count.secondPlayer = Number(count.secondPlayer);
		},


		/**
		 * Устанавливает подсветку линии, берет индексы клеток,
		 * которые нужно подсветить из localStorage
		 */
		setHighlightedSquares(state) {
			const highlightedSquaresIndices = JSON.parse(localStorage.getItem('highlightedSquaresIndices'));
			if (highlightedSquaresIndices.length > 0) {
				highlightedSquaresIndices.forEach(item => {
					state.squares[item].isHighlighted = true;
				});
			}
		},
		/**
		 * Инициализирует настройки бота и игрока, если режим находится в 'single-player'
		 */
		initSinglePlayerOptions(state) {
			const { firstSymbol, secondSymbol } = JSON.parse(localStorage.getItem('symbols'));
			const { isFirstPlayerTurn, isSecondPlayerTurn } = JSON.parse(localStorage.getItem('turn'));
			state.player.id = 1;
			state.player.symbol = firstSymbol;
			state.player.isHisTurn = isFirstPlayerTurn;

			state.bot.id = 2;
			state.bot.symbol = secondSymbol;
			state.bot.isHisTurn = isSecondPlayerTurn;
		},
		/**
		 * Инициализирует настройки игрока, если режим находится в 'multiplayer'
		 */
		initMultiplayerOptions(state) {
			const { firstSymbol, secondSymbol } = JSON.parse(localStorage.getItem('symbols'));
			const { isFirstPlayerTurn, isSecondPlayerTurn } = JSON.parse(localStorage.getItem('turn'));
			if (!localStorage.getItem('firstPlayerId')) {
				storage.setPlayerId(1);
				state.player.id = 1;
				state.player.symbol = firstSymbol;
				state.player.isHisTurn = isFirstPlayerTurn || false;
			} else if (!localStorage.getItem('secondPlayerId')) {
				storage.setPlayerId(2);
				state.player.id = 2;
				state.player.symbol = secondSymbol;
				state.player.isHisTurn = isSecondPlayerTurn || false;
			} else if (localStorage.getItem('firstPlayerId') && localStorage.getItem('secondPlayerId')) {
				storage.setPlayerId(2);
				state.player.id = 2;
				state.player.symbol = secondSymbol;
				state.player.isHisTurn = isSecondPlayerTurn || false;
			}
		},

	},
	getters: {
		playerId(state) {
			return state.player.id;
		},
		squares(state) {
			return state.squares;
		},
		emptySquaresCount(state) {
			return state.squares.filter(square => square.value === "").length;
		},
		firstPlayerCount(state) {
			return state.count.firstPlayer;
		},
		secondPlayerCount(state) {
			return state.count.secondPlayer;
		},
		mode(state) {
			return state.mode;
		},
		isFirstPlayerTurn(state) {
			return state.turn.isFirstPlayerTurn;
		},
		isSecondPlayerTurn(state) {
			return state.turn.isSecondPlayerTurn;
		},
	// 	gameIsOver(state) {
	// 		return state.gameIsOver;
	// 	},

	// 	playerCount(state) {
	// 		return state.singlePlayer.playerCount;
	// 	},


	// 	playerId(state) {
	// 		return state.multiplayer.player.id;
	// 	},
	// 	emptySquaresCount(state) {
	// 		return state.squares.filter(square => square.value === "").length;
	// 	}
	},
});
