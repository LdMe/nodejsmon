import { getName } from './utils.js';
import { getTypeData } from './typeController.js';
import { fetchData } from './utils.js';
import Pokemon from '../../models/pokemon.js';


const filterMovesByLevel = (moves, level) => {
    const filteredMoves = moves.filter((move) => {
        return move.version_group_details[0].level_learned_at <= level && move.version_group_details[0].move_learn_method.name === 'level-up';
    });
    return filteredMoves;
}

const getNRandomUniqueMoves = async (moves, n) => {
    const movesToChoose = [...moves];
    const chosenMoves = [];
    /* try to get n moves with their data, prioritizing moves with  power */
    while (chosenMoves.length < n && movesToChoose.length > 0) {
        const randomIndex = Math.floor(Math.random() * movesToChoose.length);
        const move = movesToChoose[randomIndex];
        const moveData = await getMoveData(move);
        if (moveData.power !== null) {
            chosenMoves.push(moveData);
        }
        movesToChoose.splice(randomIndex, 1);
    }
    return chosenMoves;
}
const getNRandomUniqueMovesForLevel = async (moves, level, n) => {
    const movesToChoose = filterMovesByLevel(moves, level);
    const chosenMoves = await getNRandomUniqueMoves(movesToChoose, n);
    return chosenMoves;
}
    


const getMoveData = async(move) =>{
    const url = move.move.url;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    const typeData = await getTypeData(data.type);
    data.type = typeData;
    return {
        name:data.name,
        nameEs: getName(data.names,"es"),
        power:data.power || 0,
        accuracy:data.accuracy,
        type:data.type,
        url:move.url,
        level_learned_at:move.version_group_details[0].level_learned_at,
    }
}

const addMove = async(pokemon,move)=>{
    
    if(pokemon.activeMoves.find((activeMove)=>{return activeMove.name === move.name})){
        return pokemon;
    }
    const moveData = await getMoveData(move);
    const newPokemon =  await Pokemon.findById(pokemon._id);
    newPokemon.activeMoves.push(moveData);
    if(newPokemon.activeMoves.length > 4){
        let originalOrder = pokemon.activeMoves.map((move)=>{return move.name});
        originalOrder = new Set(originalOrder);
        originalOrder = [...originalOrder];
        const activeMovesSet =new Set([...newPokemon.activeMoves]);
        const activeMoves = [...activeMovesSet];
        activeMoves.sort((a,b)=>{return b.power - a.power});
        while(activeMoves.length > 4){
            activeMoves.pop();
        }
        const newActiveMoves = [];
        for(const move of originalOrder){
            const moveData = activeMoves.find((activeMove)=>{return activeMove.name === move});
            if(moveData){
                newActiveMoves.push(moveData);
            }
        }
        /* meter los que no estan en el orden original */
        for(const move of activeMoves){
            if(!newActiveMoves.includes(move)){
                newActiveMoves.push(move);
            }
        }

        /* order as original */
        newPokemon.activeMoves = newActiveMoves;
        
        
    }

    await newPokemon.save();
    return newPokemon;
}
  

export {
    filterMovesByLevel,
    getNRandomUniqueMoves,
    getNRandomUniqueMovesForLevel,
    getMoveData,
    addMove,
}
