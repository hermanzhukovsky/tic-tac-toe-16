/**
 * Перемешивает элементы массива рандомным образом.
 * Возвращает перемешанный массив
 * @param {Array} array - передаваемый массив 
 * @returns {Array} - массив с перемешанными значениями
 * @example
 * 
 * shuffle([1, 2, 3]);
 * Result => [1, 3, 2];
 */
export const shuffle = (array) => {
	let currentIndex = array.length,
		randomIndex,
		tempraryValue;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		tempraryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tempraryValue;
	}
	return array;
}