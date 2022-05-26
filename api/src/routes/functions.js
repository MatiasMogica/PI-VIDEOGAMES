const axios = require('axios');
const { Videogame, Genders, Plataform } = require('../db');
const { API_KEY } = process.env;

const url = `https://api.rawg.io/api/games?key=${API_KEY}`;

const getApiInfo = async () => {
    let apiUrl1 = [],
        apiUrl2 = [],
        apiUrl3 = [],
        apiUrl4 = [],
        apiUrl5 = []


Promise.all(
    (apiUrl1 = await axios.get(url)),
    (apiUrl2 = await axios.get(`${url}&page2`)),
    (apiUrl3 = await axios.get(`${url}&page3`)),
    (apiUrl4 = await axios.get(`${url}&page4`)),
    (apiUrl5 = await axios.get(`${url}&page5`))
)

let allApiInfo = [
    ...apiUrl1.data.results,
    ...apiUrl2.data.results,
    ...apiUrl3.data.results,
    ...apiUrl4.data.results,
    ...apiUrl5.data.results
]

const apiInfo = allApiInfo.map((i) => {
    return {
        id: i.id,
        name: i.name,
        released: i.released,
        rating: i.rating,
        plataforms: i.parent_platforms.map((e) => e.platform.name),
        img: i.background_image
    }
})
return apiInfo 
}

const getVgDescription = async (id) => {
    try {
        const vgDescription = await axios.get(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`)
        const info =  await vgDescription.data;
        const vgDetail = {
            id: info.id,
            name: info.name,
            released: info.released,
            rating: info.rating,
            plataforms: info.parent_platforms.map((e) => e.platform.name),
            img: info.background_image,
            description: info.description
        }
        return vgDetail
    } catch (error) {
        return error
    }
}

const getDbInfo = async () => {
    return await Videogame.findAll({
        include: [
          {
            model: Genders,
            attributes: ["name"],
            through: {
              attributes: [],
            },
          },
          {
            model: Plataform,
            attributes: ["name"],
            through: {
              attributes: [],
            },
          },
        ],
      });
}

const getAllVgDetail = async (id) => {
    try {
        const apiDetail = await getVgDescription(id);
        const dbInfo =  await getDbInfo();
        const totalInfo = apiDetail.concat(dbInfo)
        return totalInfo    
    } catch (error) {
        return error
    }
}

const getAllVideogames = async () => {
    try {
        const apiInfo = await getApiInfo();
        const dbInfo = await getDbInfo();
        const totalInfo = apiInfo.concat(dbInfo)
        return totalInfo
    } catch (error) {
        return error
    }
}

module.exports = {
    getApiInfo,
    getVgDescription,
    getDbInfo,
    getAllVgDetail,
    getAllVideogames
}