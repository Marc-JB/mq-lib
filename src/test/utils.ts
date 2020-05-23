import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import * as mocha from "mocha"

/**
 * A type where it's not clear if T is T or if T is the result type of a Promise
 */
type MaybeAsync<T> = T | Promise<T>

function isPromise<T>(t: MaybeAsync<T>): t is Promise<T> {
    return t instanceof Promise
}

/**
 * Takes any sync or async function.
 * - When sync: Returns a function with the result wrapped into a promise.
 * - When async: Returns the same function.
 * @param fn A function (async or sync)
 */
function wrapInPromise<R, T extends (...args: any) => MaybeAsync<R>>(fn: T): (...args: Parameters<T>) => Promise<R> {
    return async (...args: Parameters<T>): Promise<R> => {
        try {
            // @ts-ignore
            const result: MaybeAsync<R> = fn(...args)
            /** @todo: check if the function call above has any side-effects */
            return await (isPromise(result) ? result : Promise.resolve(result))
        } catch (err) {
            return await Promise.reject(err)
        }
    }
}

chai.use(chaiAsPromised)

interface NonInitialisedSuite {}

type TestOnlySuite = Required<PreTestOnlySuite>

type TestFunction = (instance: Class) => mocha.Test

interface PreTestOnlySuite {
    tests?: Set<TestFunction>
}

type Suite = Required<PreSuite>

interface PreSuite {
    suite?: mocha.Suite
    instance?: Class
}

type ConstructorType<R = {}> = new (...args: any[]) => R

type Class = { [key: string]: (...args: any[]) => void | Promise<void> }

type ClassConstructor = ConstructorType<Class>

type AnySuite = (NonInitialisedSuite | TestOnlySuite | Suite) & ClassConstructor

function getSuite(constructor: Function): AnySuite {
    return constructor as unknown as AnySuite
}

function addTestToSuite(test: TestFunction, suite: AnySuite): void {
    if ("suite" in suite) {
        suite.suite.addTest(test(suite.instance))
        return
    } else if (!("tests" in suite)) {
        (suite as PreTestOnlySuite).tests = (suite as PreTestOnlySuite).tests ?? new Set()
    }

    (suite as TestOnlySuite).tests.add(test)
}

function camelCaseLikeStyleToWords(text: string): string {
    return text.replace(/^[a-z]|[A-Z_]/g, (v, i) => i === 0 ? v.toUpperCase() : v === "_" ? " " : " " + v.toLowerCase())
}

function initSuite(suite: AnySuite, customName: string | null = null): Suite {
    let tests: Set<TestFunction> = new Set()

    if ("suite" in suite) {
        return suite
    } else if ("tests" in suite) {
        tests = suite.tests
        delete suite.tests
    }

    const name = customName ?? camelCaseLikeStyleToWords(suite.name)
    const mochaSuite = mocha.describe(name, () => {})
    const instance = new suite(mochaSuite);

    (suite as PreSuite).suite = mochaSuite;
    (suite as PreSuite).instance = instance

    const s = suite as Suite & ClassConstructor

    for (const test of tests)
        s.suite.addTest(test(s.instance))

    return s
}

function initTest(target: Object, propertyKey: string | symbol, customName: string | null = null): void {
    const key = typeof propertyKey === "string" ? propertyKey : propertyKey.toString()
    const name = customName ?? camelCaseLikeStyleToWords(key)
    addTestToSuite((instance: Class) => new mocha.Test(name, (done: mocha.Done) => {
        wrapInPromise(instance[key])().then(done, done)
    }), getSuite(target.constructor))
}

export const Suite: ClassDecorator = <TFunction extends Function>(constructor: TFunction) => {
    initSuite(getSuite(constructor))
    return constructor
}

export const NamedSuite: (name: string) => ClassDecorator = (name) => {
    return <T extends Function>(constructor: T): T => {
        initSuite(getSuite(constructor), name)
        return constructor
    }
}

export const Test: MethodDecorator = (target, propertyKey, _) => initTest(target, propertyKey)

export const NamedTest: (name: string) => MethodDecorator = (name) => (target, propertyKey): void => initTest(target, propertyKey, name)

export const suite = Suite

export const test = Test

export const expect = chai.expect
