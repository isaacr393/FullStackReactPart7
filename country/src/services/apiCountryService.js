import axios from "axios"

const baseUrl = 'https://restcountries.com/v2/name/'

const getCountryByFullName = async ( fullName ) => {
    if( !fullName ) 
    return 
    let res = await axios.get( `${baseUrl + fullName}?fullText=true`)
    return res.data
}

export default {
    getCountryByFullName
}