// var fs = require('fs');
// var dataPlays = fs.readFileSync('plays.json', 'utf8');
// var plays = JSON.parse(dataPlays);
// var dataInvoices = fs.readFileSync('invoices.json', 'utf8');
// var invoices = JSON.parse(dataInvoices);

module.exports = statement = function(invoice, plays)  {
   const statementData = {};
   statementData.customer = invoice.customer;
   statementData.performances = invoice.performances.map(enrichPerformance);
   statementData.totalVolumeCredits = totalVolumeCredits(statementData.performances);
   statementData.totalAmount = totalAmount(statementData.performances);

   return renderPlainText(statementData, plays);

   function enrichPerformance(aPerformance){
      const result = Object.assign({}, aPerformance);
      result.play = playFor(result);
      result.amount = amountFor(result);
      result.volumeCredits = volumeCreditsFor(result);
      return result;
   }

   function playFor(aPerformance) {
      return plays[aPerformance.playID];
   }

   function amountFor(aPerformance) {
      let result = 0;
   
      switch (aPerformance.play.type) {
         case "tragedy":
            result = 40000;
            if (aPerformance.audience > 30) {
               result += 1000 * (aPerformance.audience - 30);
            }
            break;
         case "comedy":
            result = 30000;
            if (aPerformance.audience > 20) {
               result += 10000 + 500 * (aPerformance.audience - 20);
            }
            result += 300 * aPerformance.audience;
            break;
         default:
            throw new Error(`unknown type: ${aPerformance.play.type}`);
      }

      return result;
   }

   function volumeCreditsFor(aPerformance) {
      let result = 0;
      result += Math.max(aPerformance.audience - 30, 0);
      // add extra credit for every ten comedy attendees
      if ("comedy" === aPerformance.play.type) result += Math.floor(aPerformance.audience / 5);
      return result;
   }

   function totalAmount(somePerformances) {
      return somePerformances.reduce((result, aPerformance) => result + aPerformance.amount, 0);
    }

   function totalVolumeCredits(somePerformances) {
      return somePerformances.reduce((result, aPerformance) => result + aPerformance.volumeCredits, 0);
   }

}

function renderPlainText(data)  {

   function usd(aNumber) {
      return new Intl.NumberFormat("en-US",
      {
         style: "currency", currency: "USD",
         minimumFractionDigits: 2
      }).format(aNumber / 100);
   }

   let result = `Statement for ${data.customer}\n`;
   
   for (let aPerformance of data.performances) {
      // print line for this order
      result += `  ${aPerformance.play.name}: ${usd(aPerformance.amount)} (${aPerformance.audience} seats)\n`;
   }
   result += `Amount owed is ${usd(data.totalAmount)}\n`;
   result += `You earned ${data.totalVolumeCredits} credits\n`;
   return result;
}