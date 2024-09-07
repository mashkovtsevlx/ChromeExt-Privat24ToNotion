const cardIds = ["URLRL2KE7M4OH81AQSM",]

const getMonthStartEndDates = (nMonthsBefore = 0) => {
  console.log(nMonthsBefore);
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Get current month minus nMonthsBefore
  const previousMonth = month - nMonthsBefore + 1;
  const previousYear = year;
  if (previousMonth < 0) {
    previousMonth = 12 + previousMonth;
    previousYear = year - 1;
  }
  const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
  const startDate = `01.${previousMonth < 10 ? `0${previousMonth}` : previousMonth}.${previousYear}`;
  const endDate = `${lastDayOfPreviousMonth}.${previousMonth < 10 ? `0${previousMonth}` : previousMonth}.${previousYear}`;
  console.log(startDate, endDate);
  return { startDate, endDate };
}

// Get statement for the previous month for each card
const getStatements = async (cards, xref, startDate, endDate) => {
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

const sendStatements = async (statements) => {
  await fetch('https://867epboou8.execute-api.us-east-1.amazonaws.com/prod/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({statements}),
    mode: 'no-cors'
  });
}

const main = async (startDate, endDate, retries = 5) => {
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

      const statements = await getStatements(cards.data, xref, startDate, endDate);
      await sendStatements(statements);
      return;
    }
  }
  return main(startDate, endDate, retries - 1);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetchData') {
    if (message.nMonthsBefore) {
      const { startDate, endDate } = getMonthStartEndDates(message.nMonthsBefore);
      sendResponse({ message: "✅ Fetching data" });
      main(startDate, endDate);
    } else {
      const { startDate, endDate } = getMonthStartEndDates(1);
      sendResponse({ message: "✅ Fetching data" });
      main(startDate, endDate);
    }
  }
});