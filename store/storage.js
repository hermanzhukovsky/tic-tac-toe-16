import { shuffle } from './helpers';

/**
 * Переключает режим игры, записывает результат в localStorage
 */
export const toggleGameIsOver = () => {
	let gameIsOver = JSON.parse(localStorage.getItem('gameIsOver'));
	localStorage.setItem('gameIsOver', !gameIsOver);
}

/**
 * Записывает id победителя раунда в localStorage
 * @param {number} id - id победителя раунда
 */
export const updateWinner = id => {
	localStorage.setItem('winner', id);
}

/**
 * Записывает новый символ в определенную клетку
 * Получившийся результат устанавливается в localStorage 
 * @param {string} value - Символ, который нужно установить в определенную клетку 
 * @param {number} index - Индекс клетки, в которую будет добавлен символ
 * @returns 
 */
export const updateSquaresValues = (value, index) => {
	const history = JSON.parse(localStorage.getItem('history'));

	if (history[index]) return;

	history[index] = value;
	localStorage.setItem('history', JSON.stringify(history));

}
/**
 * Обновляет очередь, записывает обновление в localStorage
 */
export const updateTurn = () => {
	const turn = JSON.parse(localStorage.getItem('turn'));
	turn.isFirstPlayerTurn = !turn.isFirstPlayerTurn;
	turn.isSecondPlayerTurn = !turn.isSecondPlayerTurn;
	localStorage.setItem('turn', JSON.stringify(turn));
}
/**
 * Прибавляет счет игроку/боту, в случае его победы. 
 * Записывает получившийся счет в localStorage
 * @param {id} id - id игрока, которому нужно прибавить счет 
 */
export const updateCount = id => {
	const count = JSON.parse(localStorage.getItem('count'));
	switch (id) {
		case 1:
			count.firstPlayer = Number(count.firstPlayer) + 1;
			break;
		case 2:
			count.secondPlayer = Number(count.secondPlayer) + 1;
			break;
	}
	localStorage.setItem('count', JSON.stringify(count));
}
/**
 * Записывает в localStorage массив из индексов, которые нужно подсветить
 * @param {Array} indices - Индексы квадратов, которые нужно подсветить
 */
export const updateHighlightedSquares = indices => {
	localStorage.setItem('highlightedSquaresIndices', JSON.stringify(indices));
}
/**
 * Записывает id игрока в localStorage
 * @param {number} id - id текущего игрока
 */
export const setPlayerId = id => {
	switch (id) {
		case 1:
			localStorage.setItem('firstPlayerId', id);
			break;
		case 2:
			localStorage.setItem('secondPlayerId', id);
			break;
	}
}
/**
 * Инициализирует базовые настройки игры в localStorage
 * @param {string} mode - Режим игры, который выбрал пользователь
 */
export const initOptions = (mode) => {
	localStorage.setItem('gameIsOver', false);
	localStorage.setItem('history', '["", "", "", "", "", "", "", "", ""]');
	localStorage.setItem('mode', mode);
	localStorage.setItem('count', '{ "firstPlayer": "0", "secondPlayer": "0" }');
	localStorage.setItem('winner', '0');
	localStorage.setItem('highlightedSquaresIndices', '[]');
	localStorage.setItem('resetGame', false);
}

/**
 * Распределяет, кто играет за "крестики", а кто за "нолики".
 * Записывает полученные данные в localStorage
 */
export const setSymbols = () => {
	const [firstSymbol, secondSymbol] = shuffle(['X', 'O']);
	localStorage.setItem('symbols', `{ "firstSymbol": "${firstSymbol}", "secondSymbol": "${secondSymbol}"}`);
}

/**
 * Устанавливает, чья очередь ходить в localStorage
 */
export const setTurn = () => {
	const [isFirstPlayerTurn, isSecondPlayerTurn] = shuffle([true, false]);
	localStorage.setItem(
		'turn', 
		`{ "isFirstPlayerTurn": ${isFirstPlayerTurn}, "isSecondPlayerTurn": ${isSecondPlayerTurn}}`
	);
}
/**
 * Сбрасывает настройки игры. Нужно для того, чтобы начать новую игру
 */
export const resetGame = () => {
	const history = JSON.parse(localStorage.getItem('history'));
	history.fill("");
	localStorage.setItem('history', JSON.stringify(history));
	localStorage.setItem('winner', 0);
	localStorage.setItem('highlightedSquaresIndices', '[]');
	localStorage.setItem('gameIsOver', false);
	localStorage.setItem('resetGame', true);
}

/**
 * Полностью очищает localStorage
 */
export const clearStorage = () => {
	localStorage.clear();
}

//! Удаляем id из localStorage 
/**
 * Удалить id из localStorage
 * @param {Number} id 
 */
export const removePlayerId = (id) => {
	switch (id) {
		case 1:
			localStorage.removeItem('firstPlayerId');
			break;
		case 2:
			localStorage.removeItem('secondPlayerId');
			break;
	}
}
