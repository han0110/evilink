/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/prefer-default-export
export const shuffle = (array: Array<any>) => {
  array = [...array]
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}
