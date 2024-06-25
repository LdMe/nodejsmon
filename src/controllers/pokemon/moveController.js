import { getName } from './utils.js';
import { getTypeData,getReducedTypeData } from './typeController.js';
import { fetchData } from './utils.js';
import Pokemon from '../../models/pokemon.js';
import MoveTemplate from '../../models/templates/move.js';
import { get } from 'mongoose';

const moveUrl = 'https://pokeapi.co/api/v2/move';
const filterMovesByLevel = (moves, level) => {
    const filteredMoves = moves.filter((move) => {
        if (move.level !== null) {
            return move.level <= level && move.method === 'level-up';
        }
        return move.version_group_details[0].level_learned_at <= level && move.version_group_details[0].move_learn_method.name === 'level-up';
    });
    return filteredMoves;
}
const sortMovesByPower = (moves,descendant=true) => {
    const newMoves = [...moves];
    newMoves.sort((a,b)=>{
        if(descendant){
            return b.power - a.power;
        }
        return a.power - b.power;
    });
    return newMoves;
}
    
const getNRandomUniqueMoves = async (moves, n) => {
    const movesToChoose = [...moves];
    const chosenMoves = [];
    /* try to get n moves with their data, prioritizing moves with  power */
    while (chosenMoves.length < n && movesToChoose.length > 0) {
        const randomIndex = Math.floor(Math.random() * movesToChoose.length);
        const move = movesToChoose[randomIndex];
        const moveData = await getMoveData(move);
        if(!moveData){
            movesToChoose.splice(randomIndex, 1);
            continue;
        }
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

const getGoodMovesForLevel = async (moves,level,numMoves=4) => {
    const movesToChoose = filterMovesByLevel(moves, level);
    const sortedMoves = sortMovesByPower(movesToChoose);
    let newMoves = [];
    while (sortedMoves.length > 0 && newMoves.length < numMoves) {
        const move = sortedMoves.pop();
        const moveData = await getMoveData(move);
        if(!moveData) continue;
        if (moveData.power >= level) {
            
            newMoves.push(getReducedMoveData(moveData));
        }
    }
    return newMoves;
}

const changeBadMoveForGoodMove = async (oldActiveMoves,moves,level) => {
    const activeMoves = [...oldActiveMoves];
    
    const goodMoves = await getGoodMovesForLevel(moves, level,4);
    if (goodMoves.length === 0) {
        return activeMoves;
    }
    const newGoodMoves = goodMoves.filter((move) => activeMoves.findIndex((activeMove) => activeMove.name === move.name) === -1);
    if (newGoodMoves.length === 0) {
        return activeMoves;
    }
    for(const move of newGoodMoves){
        const sortedMoves = sortMovesByPower(activeMoves,false);
        const badMove = sortedMoves[0];
        const index = activeMoves.findIndex((activeMove)=>{return activeMove.name === badMove.name});
        if(index !== -1){
            activeMoves[index] = move;
            sortedMoves.shift();
        }
    }
    
    return activeMoves;
}

const getMoveData = async(move,reduced=false) =>{
    try {
        if(!move){
            return null;
        }
        const existingMove = await MoveTemplate.findOne({name:move.name});
        if(existingMove){
            if(reduced){
                return getReducedMoveData(existingMove);
            }
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
        await newMove.save();
        
        return newMove;
    } catch (error) {
        console.error(error);
        return null;
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
const getReducedMoveDataFromDb = async (name) => {
    try {
        const move = await MoveTemplate.findOne({name});
        return getReducedMoveData(move);
    } catch (error) {
        console.error(error);
        return null;
    }
}
const getMoveIdFromName = async (name) => {
    try {
        const move = await MoveTemplate.findOne({name});
        return move._id;
    } catch (error) {
        console.error(error);
        return null;
    }
}
const getReducedMoveData = (move) => {
    return {
        _id: move._id,
        name: move.name,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp,
        type: getReducedTypeData(move.type),
        damage_class: move.damage_class,
        names: move.names,
    }
}

export {
    filterMovesByLevel,
    getNRandomUniqueMoves,
    getNRandomUniqueMovesForLevel,
    getMoveData,
    addMove,
    getReducedMoveData,
    getReducedMoveDataFromDb,
    changeBadMoveForGoodMove,
    getMoveIdFromName
}
