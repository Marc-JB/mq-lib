async function sleep(s: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

export async function tryFunction<T>(func: () => Promise<T>, maxNumOfTries = 10): Promise<T> {
    let error
    for (let i = 0; i < maxNumOfTries; i++) {
        await sleep(i)
        try {
            return await func()
        } catch (err) {
            error = err
        }
    }
    throw error
}
