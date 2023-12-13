const printTheBill = require('./print-the-bill.js');
const fs = require('fs');
const path = require('path');

function execute(callback){
  // Obtener el nombre del archivo JSON desde la línea de comandos
  const invoicesFileName = process.argv[2];

  const playsFileName = process.argv[3];

  if (!invoicesFileName || !playsFileName) {
    console.error('Por favor, proporciona los nombres de los archivos JSON como argumento de línea de comandos.');
    process.exit(1);
  }

  // Obtener la ruta completa del archivo
  const invoicesFilePath = path.resolve(__dirname, invoicesFileName);
  const playsFilePath = path.resolve(__dirname, playsFileName);

  // Leer el archivo JSON
  fs.readFile(invoicesFilePath, 'utf8', (err, invoicesData) => {
    if (err) {
      console.error(`Error al leer el archivo ${invoicesFileName}: ${err.message}`);
      process.exit(1);
    }
    fs.readFile(playsFilePath, 'utf8', (err, playsData) => {
      if (err) {
        console.error(`Error al leer el archivo ${invoicesFileName}: ${err.message}`);
        process.exit(1);
      }
      try {
        const invoices = JSON.parse(invoicesData);
        const plays = JSON.parse(playsData);
        for(let invoice of invoices){
          console.log(printTheBill(invoice, plays));
        }
        callback();
      } catch (parseError) {
        console.error(`Error al parsear el contenido del archivo JSON: ${parseError.message}`);
        process.exit(1);
      }
    });
  });
}


// Declare the app
var app = {};

// Init function
app.init = execute;

// Self invoking only if required directly
if(require.main === module){
  app.init(function(){});
}


// Export the app
module.exports = app;