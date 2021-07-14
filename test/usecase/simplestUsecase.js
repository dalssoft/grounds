const { entity, field } = require('@herbsjs/gotu')
const assert = require('assert')

const { usecase } = require('../../src/usecase')
const { step } = require('../../src/step')
const { Ok, Err } = require('../../src/results')

describe('A use case', () => {

    describe('the simplest use case', () => {

        const givenTheSimplestUseCase = () => {
            const uc = usecase('A use case', {
                'A step': step(() => { return Ok() }),
                'A second step': step({
                    'step 1': step(() => { return Ok() }),
                    'step 2': step(() => { return Ok() }),
                })
            })
            return uc
        }

        it('should initiate', () => {
            //given
            const uc = givenTheSimplestUseCase()
            //then
            assert.ok(uc.description == 'A use case')
        })

        context('returning Ok', () => {

            it('should run', async () => {
                //given
                const uc = givenTheSimplestUseCase()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isOk)
            })

            it('should audit', async () => {
                //given
                const uc = givenTheSimplestUseCase()
                //when
                await uc.run()
                //then

                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case',
                    description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                    return: { Ok: {} },
                    steps: [
                        { type: 'step', description: 'A step', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[0].elapsedTime },
                        {
                            type: 'step', description: 'A second step', return: { Ok: {} }, elapsedTime: uc._auditTrail.steps[1].elapsedTime, steps: [
                                { type: 'step', description: 'step 1', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[1].steps[0].elapsedTime },
                                { type: 'step', description: 'step 2', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[1].steps[1].elapsedTime }
                            ]
                        }]
                })
            })

            it('should doc', () => {
                //given
                const uc = givenTheSimplestUseCase()
                //when
                const ret = uc.doc()
                //then
                assert.deepStrictEqual(ret, {
                    type: "use case",
                    description: "A use case",
                    steps: [
                        { type: "step", description: "A step", steps: null },
                        {
                            type: "step",
                            description: 'A second step',
                            steps: [
                                { type: "step", description: 'step 1', steps: null },
                                { type: "step", description: 'step 2', steps: null }
                            ]
                        }
                    ]
                })
            })
        })

        context('returning Err', () => {

            const givenTheSimplestUseCaseWithError = () => {
                const uc = usecase('A use case', {
                    'A misstep': step(() => { return Err() })
                })
                return uc
            }

            it('should run', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithError()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isErr)
            })
        })

        context('returning buchu common error', () => {

            const givenTheSimplestUseCaseWithError = () => {
                const uc = usecase('A use case', {
                    'A misstep': step(() => { return Err.notFound(Err.notFound({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),) })
                })
                return uc
            }

            it('should run', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithError()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isErr)
                assert.notDeepStrictEqual(ret.err, {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'NOT_FOUND',
                    message: 'message'
                  })
            })
        })

        it('should not run more than once', async () => {
            //given
            const uc = givenTheSimplestUseCase()
            const ret1 = await uc.run()

            //when
            const ret2 = await uc.run()

            //then
            assert.ok(ret1.isOk)
            assert.ok(ret2.isErr)
        })
    })

    describe('the simplest use case with context', () => {

        const givenTheSimplestUseCaseWithContext = () => {
            const uc = usecase('A use case', {
                'Change context': step({
                    'step c1': step((ctx) => { ctx.step1 = 1; return Ok() }),
                    'step c2': step((ctx) => { ctx.step2 = "2"; return Ok() }),
                }),
                'Change return': step({
                    'step r1': step((ctx) => { ctx.ret.step1 = "ret1"; return Ok() }),
                    'step r2': step((ctx) => { ctx.ret.step2 = "ret2"; return Ok() }),
                })
            })
            return uc
        }

        it('should initiate', () => {
            //given
            const uc = givenTheSimplestUseCaseWithContext()
            //then
            assert.deepStrictEqual(uc.description, 'A use case')
        })

        context('returning Ok', () => {

            it('should run', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithContext()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isOk)
                assert.deepStrictEqual(ret.value, { step1: 'ret1', step2: 'ret2' })
            })

            it('should audit', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithContext()
                //when
                await uc.run()
                //then
                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case', description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                    return: { Ok: { step1: 'ret1', step2: 'ret2' } },
                    steps: [
                        {
                            type: 'step', description: 'Change context', return: { Ok: {} }, elapsedTime: uc._auditTrail.steps[0].elapsedTime, steps: [
                                { type: 'step', description: 'step c1', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[0].steps[0].elapsedTime },
                                { type: 'step', description: 'step c2', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[0].steps[1].elapsedTime }
                            ]
                        },
                        {
                            type: 'step', description: 'Change return', return: { Ok: { step1: 'ret1', step2: 'ret2' } }, elapsedTime: uc._auditTrail.steps[1].elapsedTime, steps: [
                                { type: 'step', description: 'step r1', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[1].steps[0].elapsedTime },
                                { type: 'step', description: 'step r2', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[1].steps[1].elapsedTime }
                            ]
                        }]
                })
            })
        })
    })


    describe('the simplest use case with context returning multiple Oks or Errs', () => {

        context('returning Ok', () => {

            const givenAnUseCaseWithOkReturn = () => {
                const uc = usecase('A use case', {
                    'Change return': step({
                        'step r1': step((ctx) => { ctx.ret = Ok('uc ret'); return Ok('step1 ret') }),
                    })
                })
                return uc
            }

            it('should run', async () => {
                //given
                const uc = givenAnUseCaseWithOkReturn()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isOk)
                assert.deepStrictEqual(ret.value, 'uc ret')
            })

            it('should audit', async () => {
                //given
                const uc = givenAnUseCaseWithOkReturn()
                //when
                await uc.run()
                //then
                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case',
                    description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                    return: { Ok: 'uc ret' },
                    steps: [
                        {
                            type: 'step', description: 'Change return', return: { Ok: 'uc ret' }, elapsedTime: uc._auditTrail.steps[0].elapsedTime, steps: [
                                { type: 'step', description: 'step r1', return: { Ok: 'step1 ret' }, elapsedTime: uc._auditTrail.steps[0].steps[0].elapsedTime },
                            ]
                        }]
                })
            })
        })

        context('returning Err', () => {

            const givenAnUseCaseWithErrReturn = () => {
                const uc = usecase('A use case', {
                    'Change return': step({
                        'step r1': step((ctx) => { ctx.ret = Err('uc ret'); return Err('step1 ret') }),
                    })
                })
                return uc
            }

            it('should run', async () => {
                //given
                const uc = givenAnUseCaseWithErrReturn()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isErr)
                assert.deepStrictEqual(ret.err, 'step1 ret')
            })

            it('should audit', async () => {
                //given
                const uc = givenAnUseCaseWithErrReturn()
                //when
                await uc.run()
                //then
                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case',
                    description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                    return: { Error: 'step1 ret' },
                    steps: [
                        {
                            type: 'step', description: 'Change return', return: { Error: 'step1 ret' }, elapsedTime: uc._auditTrail.steps[0].elapsedTime, steps: [
                                { type: 'step', description: 'step r1', return: { Error: 'step1 ret' }, elapsedTime: uc._auditTrail.steps[0].steps[0].elapsedTime },
                            ]
                        }]
                })
            })
        })
    })

    describe('the simplest use case with request', () => {

        const givenTheSimplestUseCaseWithRequest = () => {
            const uc = usecase('A use case', {
                request: {
                    param1: String,
                    param2: Number
                },
                'A step': step((ctx) => {
                    ctx.ret.response3 = ctx.req.param2 + 1
                    return Ok()
                })
            })
            return uc
        }

        it('should run', async () => {
            //given
            const uc = givenTheSimplestUseCaseWithRequest()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isOk)
            assert.deepStrictEqual(ret.value, { response3: 3 })
        })

        it('should audit', async () => {
            //given
            const uc = givenTheSimplestUseCaseWithRequest()
            //when
            await uc.run({ param1: "a", param2: 2 })
            //then
            assert.deepStrictEqual(uc.auditTrail, {
                type: 'use case',
                description: 'A use case',
                transactionId: uc._mainStep._auditTrail.transactionId,
                elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                return: { Ok: { response3: 3 } },
                steps: [
                    { type: 'step', description: 'A step', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[0].elapsedTime }]
            })
        })

        it('should doc', () => {
            //given
            const uc = givenTheSimplestUseCaseWithRequest()
            //when
            const ret = uc.doc()
            //then
            assert.deepStrictEqual(ret, {
                request: {
                    param1: String,
                    param2: Number
                },
                type: "use case",
                description: "A use case",
                steps: [
                    { type: "step", description: "A step", steps: null }
                ]
            })
        })

        it('should not run with invalid request value', async () => {
            //given
            const uc = givenTheSimplestUseCaseWithRequest()
            //when
            const ret = await uc.run({ param1: 10, param2: "x" })
            //then
            assert.ok(ret.isErr)
            assert.deepStrictEqual(ret.err, {
                request: [
                    { param1: [{ wrongType: 'String' }] },
                    { param2: [{ wrongType: 'Number' }] }
                ]
            })

        })

        it('should not run with invalid request schema', async () => {

            const givenTheSimplestUseCaseWithInvalidRequest = () => {
                const uc = usecase('A use case', {
                    request: {
                        param1: "String",
                        param2: "Number"
                    },
                    'A step': step(() => { return Ok() })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithInvalidRequest()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isErr)
            assert.deepStrictEqual(ret.err, {
                request: [
                    { param1: [{ invalidType: 'String' }] },
                    { param2: [{ invalidType: 'Number' }] }
                ]
            })
        })

        it('should not run without request schema', async () => {

            const givenTheSimplestUseCaseWithNoRequest = () => {
                const uc = usecase('A use case', {
                    'A step': step(() => { return Ok() })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithNoRequest()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isErr)
            assert.deepStrictEqual(ret.err, { request: [{ notDefined: true }] })
        })
    })

    describe('the simplest use case with response', () => {

        const givenTheSimplestUseCaseWithSimpleResponse = () => {
            const uc = usecase('A use case', {
                request: {
                    param1: String,
                    param2: Number
                },
                response: { resp: Number },
                'A step': step((ctx) => {
                    return (ctx.ret.resp = ctx.req.param2 + 1)
                })
            })
            return uc
        }

        it('should run', async () => {
            //given
            const uc = givenTheSimplestUseCaseWithSimpleResponse()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isOk)
            assert.deepStrictEqual(ret.value, { resp: 3 })
        })

        it('should doc', () => {
            //given
            const uc = givenTheSimplestUseCaseWithSimpleResponse()
            //when
            const ret = uc.doc()
            //then
            assert.deepStrictEqual(ret, {
                request: {
                    param1: String,
                    param2: Number
                },
                response: { resp: Number },
                type: "use case",
                description: "A use case",
                steps: [
                    { type: "step", description: "A step", steps: null }
                ]
            })
        })

        it('should run with entity response', async () => {

            const anEntity = entity('anEntiy', {
                stringField: field(String),
                numberField: field(Number)
            })

            const givenTheSimplestUseCaseWithEntityResponse = () => {
                const uc = usecase('A use case', {
                    request: {
                        stringField: String,
                        numberField: Number
                    },
                    response: anEntity,
                    'A step': step((ctx) => {
                        const entity = anEntity.fromJSON(ctx.req)
                        ctx.ret = Ok(entity)
                        return Ok()
                    })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithEntityResponse()
            const input = {
                stringField: 'a',
                numberField: 102,
            }
            //when
            const ret = await uc.run(input)

            //then
            assert.strictEqual(ret.ok.__proto__, anEntity.prototype)
        })

        it('should run with simple array response', async () => {

            const givenTheSimplestUseCaseWithArrayRequest = () => {
                const uc = usecase('A use case', {
                    request: {},
                    response: {
                        numberArray: [Number]
                    },
                    'A step': step((ctx) => {
                        ctx.ret = [1]
                        return Ok()
                    })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithArrayRequest()
            const input = {}
            //when
            const ret = await uc.run(input)
            //then
            assert.deepStrictEqual(ret.ok, [1])
        })

        it('should run with complex array response', async () => {

            const givenTheSimplestUseCaseWithArrayRequest = () => {
                const uc = usecase('A use case', {
                    request: {
                        numberArray: [Number],
                        stringArray: [String],
                        dateArray: [Date],
                        booleanArray: [Boolean],
                        objectArray: [Object],
                    },
                    response: {
                        numberArray: [Number],
                        stringArray: [String],
                        dateArray: [Date],
                        booleanArray: [Boolean],
                        objectArray: [Object],
                    },
                    'A step': step((ctx) => {
                        ctx.ret = ctx.req
                        return Ok()
                    })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithArrayRequest()
            const input = {
                numberArray: [1, 2, 3],
                stringArray: ['a', 'b', 'c'],
                dateArray: [new Date(2020, 0, 1), new Date(2020, 0, 2)],
                booleanArray: [true, false, true, false],
                objectArray: [{ rep: [] }, { rep: [] }],
            }
            //when
            const ret = await uc.run(input)
            //then
            assert.deepStrictEqual(ret.ok, {
                numberArray: [1, 2, 3],
                stringArray: ['a', 'b', 'c'],
                dateArray: [new Date(2020, 0, 1), new Date(2020, 0, 2)],
                booleanArray: [true, false, true, false],
                objectArray: [{ rep: [] }, { rep: [] }],
            })
        })


        it('should run with partial valid response schema', async () => {

            const givenTheSimplestUseCaseWithPartialResponse = () => {
                const uc = usecase('A use case', {
                    request: {
                        param1: String,
                        param2: Number
                    },
                    response: {
                        resp1: String,
                        resp2: Number
                    },
                    'A step': step((ctx) => {
                        ctx.ret = Ok({ resp1: 'a' })
                        return Ok()
                    })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithPartialResponse()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isOk)
            assert.deepStrictEqual(ret.ok, {
                resp1: 'a'
            })
        })

        it('should run without response schema', async () => {

            const givenTheSimplestUseCaseWithNoResponse = () => {
                const uc = usecase('A use case', {
                    'A step': step(() => { return Ok() })
                })
                return uc
            }

            //given
            const uc = givenTheSimplestUseCaseWithNoResponse()
            //when
            const ret = await uc.run({ param1: "a", param2: 2 })
            //then
            assert.ok(ret.isErr)
            assert.deepStrictEqual(ret.err, { request: [{ notDefined: true }] })
        })
    })


    describe('the simplest use case with setup function', () => {

        const givenTheSimplestUseCaseWithSetupFunction = () => {
            const uc = usecase('A use case', {
                setup: (ctx) => ctx.ret.step1 = 1,
                'Change return': step(() => Ok())
            })
            return uc
        }

        it('should initiate', () => {
            //given
            const uc = givenTheSimplestUseCaseWithSetupFunction()
            //then
            assert.deepStrictEqual(uc.description, 'A use case')
        })

        it('should run with default value', async () => {
            //given
            const uc = givenTheSimplestUseCaseWithSetupFunction()
            //when
            const ret = await uc.run()
            //then
            assert.ok(ret.isOk)
            assert.deepStrictEqual(ret.value, { step1: 1 })
        })
    })

    describe('the simplest use case with authorization', () => {

        const givenTheSimplestUseCaseWithAuthorization = () => {
            const uc = usecase('A use case', {
                authorize: (user) => { return user.isAdmin ? Ok() : Err() },
                'Step 1': step(() => { return Ok() })
            })
            return uc
        }

        context('with access', () => {

            it('should initiate', () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //then
                assert.deepStrictEqual(uc.description, 'A use case')
            })

            it('should run', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //when
                await uc.authorize({ user: "John", id: '923b8b9a', isAdmin: true })
                const ret = await uc.run()
                //then
                assert.ok(ret.isOk)
            })

            it('should audit', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //when
                await uc.authorize({ user: "John", id: '923b8b9a', isAdmin: true })
                await uc.run()
                //then
                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case',
                    description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    elapsedTime: uc._mainStep._auditTrail.elapsedTime,
                    return: { Ok: {} },
                    authorized: true,
                    user: {
                        user: 'John',
                        id: '923b8b9a',
                        isAdmin: true
                    },
                    steps: [{ type: 'step', description: 'Step 1', return: { Ok: '' }, elapsedTime: uc._auditTrail.steps[0].elapsedTime }]
                })
            })
        })

        context('with without access', () => {

            it('should initiate', () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //then
                assert.deepStrictEqual(uc.description, 'A use case')
            })

            it('should not run', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //when
                await uc.authorize({ user: "Bob", id: '923b8b9a', isAdmin: false })
                const ret = await uc.run()
                //then
                assert.ok(ret.isErr)
            })

            it('should not run if [authotize] is defined but not called', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //when
                const ret = await uc.run()
                //then
                assert.ok(ret.isErr)
            })

            it('should audit', async () => {
                //given
                const uc = givenTheSimplestUseCaseWithAuthorization()
                //when
                await uc.authorize({ user: "Bob", id: '923b8b9a', isAdmin: false })
                await uc.run()
                //then
                assert.deepStrictEqual(uc.auditTrail, {
                    type: 'use case',
                    description: 'A use case',
                    transactionId: uc._mainStep._auditTrail.transactionId,
                    authorized: false,
                    user: {
                        user: 'Bob',
                        id: '923b8b9a',
                        isAdmin: false
                    }
                })
            })
        })
    })
})
