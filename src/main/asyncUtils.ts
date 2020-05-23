async function sleep(timeInMilliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds))
}

export async function tryFunction<T>(func: () => Promise<T>, maxNumOfTries = 10, sleepFactor = 1000): Promise<T> {
    let error
    for (let i = 0; i < maxNumOfTries; i++) {
        await sleep(i * sleepFactor)
        try {
            return await func()
        } catch (err) {
            error = err
        }
    }
    throw error
}
