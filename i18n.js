module.exports = function (input) {
  const {stringTokens, variables, translations, locale} = input;

  const toDate = (arr, locale) => {
    return new Intl.DateTimeFormat(locale).format(arr[1]);
  }

  const toNumber = (arr, locale) => {
    if (arr[2]){
      return new Intl.NumberFormat(locale, { style: 'currency', currency: arr[2] }).format(arr[1]);
    }
    return new Intl.NumberFormat(locale, { maximumSignificantDigits: 2 }).format(arr[1]);
  }

  const toPlural = (arr, locale, variables, translations) => {
    const variable = findVariable(arr[2].substring(1), variables)
    const toLocaleString = new Intl.PluralRules(locale).select(variable);
    const translation = findTranslation(arr[1], translations, locale);
    return (toLocaleString + translation);
  }

  const toListFormat = (arr, locale, variables) => {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    const result = [];
    for (const item of arr) {
      if (item.match(/\b#\d+\b/g)) {
        const variable = item.substring(1);
        result += findVariable(variable, variables);
      }
      result.push(item);
    }
    return formatter.format(result);
  }

  const toRelativeTime = (arr, locale) => {
    const formatter = new Intl.RelativeTimeFormat(locale, { style: 'short' });
    return formatter.format(arr[1], arr[2]);
  }

  const findVariable = (variable, variables) => {
    return variables[variable];
  }

  const findTranslation = (item, translations, locale) => {
    return translations[locale][item][localeString];
  }

  let finalString;

  for (const token of stringTokens) {
    if (typeof token == 'string' && token.match(/\b#\d+\b/g)) {
      const variable = token.substring(1);
      finalString += findVariable(variable, variables);
    }
    if (Array.isArray(token)) {
      if (token[0] == "@date") {
        finalString += toDate(token, locale);
      }
      if (token[0] == "@number") {
        finalString += toNumber(token, locale);
      }
      if (token[0] == "@plural") {
        finalString += toPlural(token, locale, variables, translations);
      }
      if (token[0] == "@list") {
        finalString += toListFormat(token, locale, variables);
      }
      if (token[0] == "@relativeTime") {
        finalString += toRelativeTime(token, locale);
      }
    }
    finalString += token;
  }
  return finalString;
}
