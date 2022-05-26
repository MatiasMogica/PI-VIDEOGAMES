const { Router } = require('express');
const axios = require('axios');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const {Videogame, Genders} = require('../db');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


const getApiVideo = async () => {
    try {
        const pag1 = await axios.get('https://api.rawg.io/api/games')
        const pag2 = await axios.get(pag1.data.next)
        const res = pag1.data.results.concat(pag2.data.results)
        const games = await Promise.all(res.map(async(obj) =>{
            let g = await axios.get(obj)
            return {
                  name: g.data.name,
                  ID: g.data.id,
                  description: '',// ver como hacer con link de id
                  releaseDate: g.data.released,
                  rating: g.data.rating,
                  plataforms: g.data.plataforms.map(p => p.plataform.name) }
                  
        }))
        return games    
    } catch (error) {
        return error
    }
}

const getDbVideo = async () => {
    const info = Videogame.findAll({
        includes:{
            model: Genders,
            attributes: ['name'],
            through: {
                attributes:[]
            }
        }
    })
}

const getAllVideo = async () => {
    let info1 = await getApiVideo()
    let info2 = await getDbVideo()
    let allInfo = info1.assign(info2)
    return allInfo    
}

router.get('/videogames', async(req, res, next) => {
    try {
        let vidGames = await getAllVideo()
        res.json(vidGames)
    } catch (error) {
        next(error)
    }

})

router.post('/videogame', async(req, res, next) => {
    try {
        await Videogame.create(req.body)
        res.send({msg: 'videogame created'})
    } catch (error) {
        next(error)
    }
})

router.get('/genres', async(req, res, next) => {
    try {
        const gens = await axios.get('https://api.rawg.io/api/genres')
        const info = gens.data.results
        const genr = info.map(obj => {
            return {
                ID: obj.data.id,
                name: obj.data.name
            }
        })
        await genr.forEach(g => {
            Genders.findOrCreate({
                where: {
                    name: g.name
                }
            })
        })
        const allGenr = await Genders.findAll()
        res.json(allGenr)
    } catch (error) {
        next(error)
    }
})



module.exports = router;
