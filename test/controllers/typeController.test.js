import connection from "../../src/config/db";
import { getTypeData } from "../../src/controllers/pokemon/typeController";

describe("Types controller tests", () => {
    beforeAll(async() => {
        await connection.promise;
    });
    
    test("should get type data", async() => {
        const type = {type:{name:'normal'}};
        const result = await getTypeData(type);
        expect(result.name).toBe('normal');
        expect(result.color).toBe('#A8A878');
    });
});

