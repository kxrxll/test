module.exports = function layout(blocks) {
  const checkRowFullfilment = (row) => {
    for (const item of row) {
      if (!item) {
        return false;
      }
    }
    return true;
  }

  const getEmptyEdges = (form, id) => {
    const formReversed = form.reverse();
    let straightCounter = 0;
    let reversedCounter = 0;
    while (!checkRowFullfilment(formReversed[straightCounter])){
      straightCounter++;
    }
    const formReversedTwice = form.reverse();
    while (!checkRowFullfilment(formReversedTwice[reversedCounter])){
      reversedCounter++;
    }
    return {
      "blockId": id,
      "straight": straightCounter,
      "reversed": reversedCounter
    }
  }

  const checkEdgesOfBlocks = (first, second) => {
    if (first.blockId == second.blockId) {
      return false;
    }
    if (first.reversed == second.straight && first.reversed != 0) {
      return {
        "first": first.blockId,
        "second": second.blockId,
        "isRotated": false
      }
    }
    if (first.reversed == second.reversed && first.reversed != 0) {
      return {
        "first": first.blockId,
        "second": second.blockId,
        "isRotated": true
      }
    }
    return false;
  }

  const findPairsOfBlocks = (blockEdges) => {
    const pairs = [];
    for (const edge of blockEdges) {
      for (const pair of blockEdges) {
        pairs.push(checkEdgesOfBlocks(edge, pair))
      }
    }
    return pairs;
  }

  const emptyEdges = [];
  for (const block of blocks) {
    emptyEdges.push(getEmptyEdges(block.form, block.id));
  }
  const possibilePairs = findPairsOfBlocks(emptyEdges).filter(Boolean);
  const result = [];
  const firstBlock = blocks[0];
  let position = 1;
  result.push({
    "blockId": firstBlock.id,
    "position": position,
    "isRotated": !checkRowFullfilment(firstBlock.form[firstBlock.form.length-1])
  })
  position++;
  const secondBlock = possibilePairs.find(element => element.first == firstBlock.id);
  result.push({
    "blockId": secondBlock.second,
    "position": position,
    "isRotated": secondBlock.isRotated
  })
  position++;
  if (position <= blocks.length) {
    const thirdBlock = possibilePairs.find(element => element.first == secondBlock.blockId);
  result.push({
    "blockId": thirdBlock.second,
    "position": position,
    "isRotated": thirdBlock.isRotated
  })
  } 
  // Не дожал:
  // * Полную проверку совпадению краев на отсутствие пробелов
  // * Определение первого элемента в результате
  // * И адекватный цикл в конце тк был блокирован пунктом 2
  return result;
}