const getName = (names,language) => {
    try{
        const name = names.find((name)=>{return name.language.name === language});
        return name ? name.name : names[0].name;
    }
    catch(error){
        console.error(error);
        return names[0].name;
    }
}

const fetchData = async (url,options) => {
    try{
        const response = await fetch(url,options);
        const data = await response.json();
        return [null,data]
    }
    catch(error){
        console.error(error);
        return [error,null];
    }
}


export {
    getName,
    fetchData
};

