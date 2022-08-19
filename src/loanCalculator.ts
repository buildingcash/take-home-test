/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';

function getMode(values: number[]) {
  const countValues: any[] = [];
  let index = 0;

  while (index < values.length) {
    const value = values[index];
    let find = null;
    let findIndex = 0;

    while (findIndex < countValues.length) {
      const potential = countValues[findIndex];

      if (potential.value === value) {
        potential.count = potential.count + 1;
        find = potential;
      }
      findIndex = findIndex + 1;
    }

    if (find === null) {
      countValues.push({
        value: value,
        count: 1,
      });
    }

    index = index + 1;
  }

  let bestScore = {count: 0, value: 0};
  index = 0;
  while (index < countValues.length) {
    const countValue = countValues[index];

    if (countValue.count > bestScore.count) {
      bestScore = countValue;
    }
    index = index + 1;
  }

  return bestScore;
}

function getLoan() {
  const data = JSON.parse(fs.readFileSync(process.argv[2]).toString('utf-8'));

  if (!data.transactions[59]) {
    throw new Error('Requires at least 60 days of data');
  }

  let index = 0;
  let balanceOfDay = data.balance;
  const balances: any = [];

  balances.push(balanceOfDay);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (
      let transactionIndex = 0;
      transactionIndex < data.transactions[index].length;
      transactionIndex++
    ) {
      balanceOfDay = balanceOfDay - data.transactions[index][transactionIndex];
    }

    balances[index + 1] = balanceOfDay;

    index = index + 1;
    if (!data.transactions[index]) {
      break;
    }
    if (index > 364) {
      break;
    }
  }

  index = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const balanceOfDay = balances[index];

    balances[index] = Math.floor(balanceOfDay / 100) * 100;

    index = index + 1;
    if (!balances[index]) {
      break;
    }
  }

  const mode = getMode(balances);

  if (mode.value < 0) {
    return 0;
  }
  if (mode.value > 2000) {
    return 2000;
  }
  return mode.value;
}

function run() {
  let loan = 0;

  try {
    loan = getLoan();
  } catch (error) {
    console.log(error);
    loan = 0;
  }
  console.log('Loan is ' + loan + ' euros');
}

run();
