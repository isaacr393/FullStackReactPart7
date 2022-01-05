import { useState } from "react";

const useInputHook = ( type ) => {
    const [value, setValue] = useState('')

    const onChange = ( e ) => {
        e.preventDefault()
        setValue(e.target.value)    
    }

    return {
        type,
        value,
        onChange
    }
}

export default useInputHook