const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

/*app.get('/', (req, res) => {
  axios.get(url)
  .then((response) => {

  })
})*/

app.get('/', async (req, res) => {
  try{
      const response = await axios.get(url)

      if (response.status === 200) {
        const html = response.data
        const $ = cheerio.load(html)

        const links = []
        const rapers = []
        const imgs = []

        //links
        const $links = $('#mw-pages a')
        $links.each((index, element) => {
          const link = $(element).attr('href')
          links.push(link)
        })
        
        //Iteramos por todos los links
        for (const link of links) {
          const linksResponse = await axios.get(`http://es.wikipedia.org/${link}`)
          if (linksResponse.status === 200) {
            const html = linksResponse.data
            const $ = cheerio.load(html)

            $('img').each((index, element) => {
              const img = $(element).attr('src')
              imgs.push(img)
            })

            const title = $('h1').text()
            const content = $('p').text()
            rapers.push({
                title, 
                imgs, 
                content
            })
          } 
        }
        //Muetsra en el ruta todos los rapers del array
        res.json(rapers)
      }
    } catch (error) {
      console.log('Error al obtener datos', error)
    }
  })


app.listen(PORT, () => {
    console.log(`Express esta escuchando en el puerto http://localhost:${PORT}`)
});