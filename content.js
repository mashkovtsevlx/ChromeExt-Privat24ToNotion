const cardIds = ["URLRL2KE7M4OH81AQSM",]

// Get previous month start and end date in format DD.MM.yyyy
// Add zeroes to the start of the month if it is less than 10
const getPreviousMonthDates = () => {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const lastDayOfPreviousMonth = new Date(year, month, 0).getDate();
  const previousMonth = month === 0 ? 12 : month;
  const previousYear = month === 0 ? year - 1 : year;
  const startDate = `01.${previousMonth < 10 ? `0${previousMonth}` : previousMonth}.${previousYear}`;
  const endDate = `${lastDayOfPreviousMonth}.${previousMonth < 10 ? `0${previousMonth}` : previousMonth}.${previousYear}`;
  return { startDate, endDate };
}

// Get statement for the previous month for each card
const getStatements = async (cards, xref) => {
  const { startDate, endDate } = getPreviousMonthDates();
  const statements = [];
  for (const card of cards) {
    const response = await fetch(`https://next.privat24.ua/api/p24/statements?xref=${xref}&action=export&dateFrom=${startDate}&dateTo=${endDate}&cardId=${card.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    statements.push(data);
  }
  console.log(statements);
  return statements;
}

const main = async (retries = 5) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (retries < 0)
    return;
  console.log(performance.getEntriesByType('resource'));

  const resources = performance.getEntriesByType('resource');
  for (const resource of resources) {
    if (resource.name.includes("xref")) {
      const xref = resource.name.split("xref=")[1].split("&")[0];
      console.log(xref);
      const cards = await getCards(xref);
      console.log(cards);

      const statements = await getStatements(cards.data, xref);
      return;
    }
  }
  return main(retries - 1);
}

const getCards = async (xref) => {
  const response = await fetch(`https://next.privat24.ua/api/p24/cardslist?xref=${xref}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await response.json();
  return data;
}

main();
console.log(getPreviousMonthDates())

//https://next.privat24.ua/api/p24/statements?xref=527d4525d1f38839a282085312f5e486&action=export&dateFrom=29.08.2024&dateTo=31.08.2024&cardId=URLRL2KE7M4OH81AQSM