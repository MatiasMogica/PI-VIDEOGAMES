const { Router } = require('express');
const axios = require('axios');
const express = require('express')
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const {Videogame, Genders, Plataform} = require('../db');
const { getAllVideogames, getAllVgDetail} = require('./functions')
const { API_KEY } = process.env;

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get('/videogames', async (req, res) => {
    let { name } = req.query 
    let totalVg = await getAllVideogames()
    if (name) {
        let vg = totalVg.filter((v) => {
            v.name.toLowerCase().includes(name.toLowerCase)
        })
        vg.length ? res.status(200).send(vg) : res.status(404).send(`${name} not found`)
    }
    else {
        res.status(200).send(totalVg)
    }
})

router.get('/videogame/:id', async (req, res, next) => {
    let { id } = req.params
    let totalVg = await getAllVgDetail(id)
    res.status(200).send(totalVg)
})

router.post('/videogame', async (req, res, next) => {
    let { name, released, rating, genres, plataforms, img, description } = req.body
    try {
        if(name){
            let allVg = await getAllVideogames()
            let isVg = allVg.find((n) => {
                n.name.toLowerCase() === name.toLowerCase()
            })
            if(!isVg){
                let videogame = await Videogame.create({
                    name,
                    released,
                    rating,
                    genres,
                    plataforms,
                    img,
                    description
                })
                let genresDb = await Genders.findAll({
                    where: {name: genres}
                })
                let plataformsDb = await Plataform.findAll({
                    where: {name: plataforms}
                })
                await videogame.addGenders(genresDb)
                await videogame.addPlataform(plataformsDb)
                res.status(201).send('Videogame created')
            }
            res.status(404).send('Videogame name already exist')
        }
        return res.status(404).send('Videogame name is obligtory')
    } catch (error) {
        next(error)
    }
})

router.get('/genres', async (req, res, next) => {
    let url = `https://api.rawg.io/api/genres?key=${API_KEY}`
    let genreApi = await axios.get(url)
    let genre = genreApi.data.results.map((g) => g.name)
    let id = genreApi.data.results.map((i) => i.id)
  
    genre.forEach((e, i) => {
      Genders.findOrCreate({
        where: { name: e, id: id[i] },
      })
    })
  
    let allGenres = await Genders.findAll({ order: [['name', 'ASC']] })
    res.send(allGenres)
  })

router.get('/plataforms', async (req, res, next) => {
    let url = `https://api.rawg.io/api/platforms/lists/parents?key=${API_KEY}`
    let plataformApi = await axios.get(url)
    let plataform = plataformApi.data.results.map((p) => p.name)
    let id = plataformApi.data.results.map((i) => i.id)

    plataform.forEach((e, i) => {
        Plataform.findOrCreate({
          where: { name: e, id: id[i] },
        })
      })
    
      const allPlatforms = await Plataform.findAll({ order: [['name', 'ASC']] });
      res.send(allPlatforms)
})

module.exports = router;
