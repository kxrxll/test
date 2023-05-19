// interface CartItem {
//   articleId: number; // id товара
//   quantity: number; // количество товара в заказе
// }

// interface Cart {
//   userId: number; // id пользователя
//   orderDate: string; // дата заказа в формате ISO 8601 без времени
//   items: CartItem[]; // позиции заказа
//   cityId: number; // id города доставки
//   currency: string; // код валюты заказа
// }

module.exports = function (apiClient, cart) {
  const methodsOfAPIWithConstructor = Object.getOwnPropertyNames(apiClient.__proto__);
  const methodsOfAPI = methodsOfAPIWithConstructor.splice(methodsOfAPIWithConstructor.indexOf('constructor'), 1);

  const apiWithKnownMethods = {
    'fetchDefaultCurrency': '',
    'fetchActualPrices': '',
    'fetchActualLeftovers': '',
    'fetchDeliveryPrice': '',
    'fetchConvertedCurrancy': '',
  }
  
  const isEmptyArray = (response) => {
    if (Array.isArray(response) && response.length == 0) {
      return true;
    }
    return false;
  }

  const isPrices = (arr) => {
    for (const el of arr) {
      if (Object.keys(el).length < 4) {
        return true;
      }
    }
    return false;
  }

  const methodDiscovery = (method, apiClient, cityId, prices, leftovers, deliveryCost, currancy) => {
    const today = new Date();
    const todayISOWithoutTime = today.toISOString().split('T');
    const methodToRun = apiClient[method];
    const runForDefaultCurrency = new methodToRun();
    if (typeof runForDefaultCurrency == 'string'){
      return 'fetchDefaultCurrency';
    }
    const runForActualPricesAndLeftovers = new methodToRun(todayISOWithoutTime);
    if (!isEmptyArray(runForActualPricesAndLeftovers) && Array.isArray(runForActualPricesAndLeftovers)){
      if (isPrices(runForActualPricesAndLeftovers)){
        let fetchPrices = apiClient[apiWithKnownMethods['fetchActualPrices']];
        prices = fetchPrices(cart.orderDate);
      }
      let leftovers = fetchLeftovers(cart.orderDate);
      let fetchDeliveryCost = apiClient[apiWithKnownMethods['fetchDeliveryPrice']];
    }
    const runForDeliveryPrice = new methodToRun(cityId);
    if (typeof runForDeliveryPrice == 'number'){
      return 'fetchDeliveryPrice';
    }
    return 'fetchConvertedCurrancy';
  }

  let prices;
  let leftovers;
  let deliveryCost;
  let currancy;

  for (const method of methodsOfAPI) {
    apiWithKnownMethods[methodDiscovery(method, apiClient, cart.cityId)] = new apiClient[method];
  }

  let fetchPrices = apiClient[apiWithKnownMethods['fetchActualPrices']];
  let prices = fetchPrices(cart.orderDate);
  let fetchLeftovers = apiClient[apiWithKnownMethods['fetchActualLeftovers']];
  let leftovers = fetchLeftovers(cart.orderDate);
  let fetchDeliveryCost = apiClient[apiWithKnownMethods['fetchDeliveryPrice']];
  let deliveryCost = fetchDeliveryCost(cart.cityId);
  let currancy = cart.currency;
  if (!currancy) {
    let fetchCurrancy = apiClient[apiWithKnownMethods['fetchDefaultCurrency']];
    currancy = fetchCurrancy();
  }

  const findPrice = (prices, id) => {
    for (const price of prices) {
      if (price.articleId == id) {
        for (const prop in price) {
          if (typeof price[prop] == 'number') {
              return price[prop];
          }
        }
      }
    }
  }

  const isAvaliableLeftovers = (leftovers, id, quantity) => {
    for (const leftover of leftovers) {
      if (leftover.articleId == id) {
        for (const prop in leftover) {
          if (Array.isArray(leftover[prop])) {
            if(leftover[prop].reduce((a, b) => a + b, 0) <= quantity) {
              return true;
            }
            return false;
          }
        }
      }
    }
  }

  let result = 0;

  for (const item of cart.items) {
    if (isAvaliableLeftovers(leftovers, item.articleId, item.quantity)) {
      result += findPrice(prices, item.articleId) * item.quantity;
    }
  }

  result += deliveryCost;

  return result;
}