import { suite, test, expect } from "@peregrine/test-with-decorators"
import { tryFunction } from "../main/asyncUtils"

@suite
export class AsyncUtilsTests {
    @test
    public async testRetryFunction(): Promise<void> {
        // Arrange
        let numberOfTimesFunctionRan = 0
        const retries = 4

        // Act
        const result = await tryFunction(async () => {
            numberOfTimesFunctionRan++
            return numberOfTimesFunctionRan < retries ? Promise.reject(false) : Promise.resolve(true)
        }, retries, 100)

        // Assert
        expect(result).to.be.true
        expect(numberOfTimesFunctionRan).to.equal(retries)
    }
}
