const getMaxHp = (pokemon) => {
    if(!pokemon.stats[0].multiplier){
        pokemon.stats[0].multiplier = 1;
    }
    const baseHp = Math.round(pokemon.stats[0].base_stat * pokemon.stats[0].multiplier);

    const hp = Math.floor(0.01 * (2 * parseInt(baseHp) ) * pokemon.level + 10 + pokemon.level);
    return hp;
}
const randomizeStatValues = (stats) => {
    const newStats = [...stats];
    for (let i = 0; i < newStats.length; i++) {
        const randomValue = 0.75 + Math.random() * 0.5;
        newStats[i].multiplier = randomValue;
    }
    return newStats;
}

const copyStatMultipliers = (statsFrom,statsTo) => {
    for (let i = 0; i < statsFrom.length; i++) {
        statsTo[i].multiplier = statsFrom[i].multiplier || 1;
    }
    return statsTo;
}

export {
    getMaxHp,
    randomizeStatValues,
    copyStatMultipliers,
}