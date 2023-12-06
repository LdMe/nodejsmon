import { getName } from './utils.js';
import { getTypeData } from './typeController.js';
import { fetchData } from './utils.js';
import Pokemon from '../../models/pokemon.js';
import MoveTemplate from '../../models/templates/move.js';

const moveUrl = 'https://pokeapi.co/api/v2/move';
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
        const move = movesToChoose[randomIndex].move;
        const moveData = await getMoveData(move);
        moveData.level_learned_at = movesToChoose[randomIndex].version_group_details[0].level_learned_at;
        move
        if (moveData.power === null) {
           moveData.power = 0;
        }
        chosenMoves.push(moveData);
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
    const existingMove = await MoveTemplate.findOne({name:move.name});
    
    if(existingMove){
        return existingMove;
    }
    const url = `${moveUrl}/${move.name}`;
    const [error,data] = await fetchData(url);
    if(error){
        throw error;
    }
    data.power = data.power || 0;
    const typeData = await getTypeData(data.type);
    
    const newMove = new MoveTemplate(data);
    newMove.type = typeData;
    console.log("newMove",newMove)
    await newMove.save();
    
    return newMove;
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
