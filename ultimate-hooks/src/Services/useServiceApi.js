import axios from 'axios'
import { useState, useEffect} from 'react'

export const useResource = ( url ) => {

    let baseUrl = url
    
    const [resource, setResource] = useState([])

    useEffect( async () => {
        let data = await getAll()
        setResource(data)
    }, [])

    const getAll = async () => {
        const response = await axios.get(baseUrl)
        return response.data
    }

    const create = async newObject => {
        const response = await axios.post(baseUrl, newObject)

        //console.log(baseUrl, newObject)
        setResource([...resource, response.data])
        return response.data
    }

    const update = async (id, newObject) => {
        const response = await axios.put(`${ baseUrl } /${id}`, newObject)
        return response.data
    }

    const service = {
        update,
        create
    }

    return [
        resource,
        service
    ]
}