const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs/promises');

const app = express();
const PORT = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', async (req, res) => {
  try {
    // Realizar la solicitud inicial para obtener enlaces desde la página principal
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Obtener enlaces del contenedor mw-pages
    const links = [];
    $('#mw-pages a').each((index, element) => {
      const link = $(element).attr('href');
      links.push(link);
    });

    // Recorrer los enlaces y obtener datos
    const data = [];
    for (const link of links) {
      const linkData = await scrapeLinkData(link);
      data.push(linkData);
    }

    // Guardar los datos en un archivo JSON
    await fs.writeFile('output.json', JSON.stringify(data, null, 2));

    res.send('Datos guardados en output.json');
  } catch (error) {
    console.error('Error al obtener la página:', error);
    res.status(500).send('Error interno del servidor');
  }
});

async function scrapeLinkData(link) {
  try {
    // Realizar una solicitud para cada enlace
    const response = await axios.get(`https://es.wikipedia.org${link}`);
    const html = response.data;
    const $ = cheerio.load(html);

    // Obtener datos desde la página vinculada
    const h1 = $('h1').text();
    const images = [];
    $('img').each((index, element) => {
      const src = $(element).attr('src');
      images.push(src);
    });
    const paragraphs = [];
    $('p').each((index, element) => {
      const paragraphText = $(element).text();
      const imgSrc = $(element).find('img').attr('src');
      paragraphs.push({ text: paragraphText, img: imgSrc });
    });

    return { h1, images, paragraphs };
  } catch (error) {
    console.error(`Error al obtener datos desde ${link}:`, error);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
