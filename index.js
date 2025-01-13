const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const PORT = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', async (req, res) => {
    try {
      // 1. Acceder a la página inicial
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
  
      // 2. Recoger los enlaces de la categoría dentro de #mw-pages
      const links = [];
      $('#mw-pages a').each((index, element) => {
        const link = 'https://es.wikipedia.org' + $(element).attr('href');
        links.push(link);
      });
  
      console.log(`Encontrados ${links.length} enlaces a páginas de músicos.`);
  
      // 3. Recorrer cada enlace y recoger datos
      const results = [];
      for (let link of links) {
        try {
          const { data: pageData } = await axios.get(link);
          const $$ = cheerio.load(pageData);
  
          // Obtener título (h1)
          const title = $$('h1').text().trim();
  
          // Obtener todas las imágenes ('img')
          const images = [];
          $$('img').each((index, element) => {
            images.push($(element).attr('src'));
          });
  
          // Obtener todos los textos ('p')
          const texts = [];
          $$('p').each((index, element) => {
            texts.push($(element).text().trim());
          });
  
          // Guardar datos en el array de resultados
          results.push({ title, images, texts });
  
          console.log(`Datos recopilados de la página: ${title}`);
        } catch (error) {
          console.error(`Error accediendo a la página ${link}:`, error.message);
        }
      }
  
      // 4. Responder con los datos recopilados
      res.json(results);
    } catch (error) {
      console.error('Error accediendo a la página principal:', error.message);
      res.status(500).send('Error en el servidor');
    }
  });

app.listen(PORT, () => {
    console.log(`Express esta escuchando en el puerto http://localhost:${PORT}`)
});