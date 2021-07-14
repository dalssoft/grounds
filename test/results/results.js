const assert = require('assert')
const { Err } = require('../../src/results')

describe('Err',  () => {
    it('should to return a notFound Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.notFound({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'NOT_FOUND',
                    message: 'Not Found'
                  }
            },
            {
                ret: Err.notFound({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'NOT_FOUND',
                    message: 'message'
                  }
            },
            {
                ret: Err.notFound(),
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: 'Not Found'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isNotFoundError, true)
        }
        
    })

    it('should to return a alreadyExists Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.alreadyExists({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'ALREADY_EXISTS',
                    message: 'Already exists'
                  }
            },
            {
                ret: Err.alreadyExists({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'ALREADY_EXISTS',
                    message: 'message'
                  }
            },
            {
                ret: Err.alreadyExists(),
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'ALREADY_EXISTS',
                    message: 'Already exists'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isAlreadyExistsError, true)
        }
        
    })

    it('should to return a invalidEntity Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.invalidEntity({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ENTITY',
                    message: 'Invalid entity'
                  }
            },
            {
                ret: Err.invalidEntity({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ENTITY',
                    message: 'message'
                  }
            },
            {
                ret: Err.invalidEntity(),
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'INVALID_ENTITY',
                    message: 'Invalid entity'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isInvalidEntityError, true)
        }
        
    })

    it('should to return a invalidArguments Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.invalidArguments({payload: { entity: 'user' }, args: { foo: 'bar'}, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user', invalidArgs: { foo: 'bar'} },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ARGUMENTS',
                    message: 'Invalid arguments'
                  }
            },
            {
                ret: Err.invalidArguments({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user', invalidArgs: undefined },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ARGUMENTS',
                    message: 'message'
                  }
            },
            {
                ret: Err.invalidArguments(),
                expect: {
                    payload: { invalidArgs: undefined },
                    cause: undefined,
                    code: 'INVALID_ARGUMENTS',
                    message: 'Invalid arguments'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isInvalidArgumentsError, true)
        }
        
    })

    it('should to return a permissionDenied Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.permissionDenied({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'PERMISSION_DENIED',
                    message: 'Permission denied'
                  }
            },
            {
                ret: Err.permissionDenied({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'PERMISSION_DENIED',
                    message: 'message'
                  }
            },
            {
                ret: Err.permissionDenied(),
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'PERMISSION_DENIED',
                    message: 'Permission denied'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isPermissionDeniedError, true)
        }
        
    })

    it('should to return a unknown Err',  () => {
        // given
        const scenarios = [
            {
                ret: Err.unknown({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'UNKNOWN',
                    message: 'Unknown Error'
                  }
            },
            {
                ret: Err.unknown({ message: 'message', payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'UNKNOWN',
                    message: 'message'
                  }
            },
            {
                ret: Err.unknown(),
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'UNKNOWN',
                    message: 'Unknown Error'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret.isUnknownError, true)
        }
        
    })

    it('should to return a custom Err',  () => {
        // given
        const result = Err.buildCustomErr('CUSTOM_ERR', 'message', { entity: 'user' }, {foo: 'bar'}, 'Custom')

        // then
        assert.deepStrictEqual(result.err, {
            payload: { entity: 'user' },
            cause: {foo: 'bar'},
            code: 'CUSTOM_ERR',
            message: 'message'
        })
        assert.deepStrictEqual(result.isCustomError, true)
        
    })

    it('should run the same error many time without bug',  () => {
        const scenarios = [
            {
                ret: Err.alreadyExists({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                type: 'isAlreadyExistsError',
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'ALREADY_EXISTS',
                    message: 'Already exists'
                  }
            },
            {
                ret: Err.invalidEntity({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                type: 'isInvalidEntityError',
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ENTITY',
                    message: 'Invalid entity'
                  }
            },
            {
                ret: Err.invalidArguments({payload: { entity: 'user' }, args: { foo: 'bar'}, cause: {foo: 'bar'} }),
                type: 'isInvalidArgumentsError',
                expect: {
                    payload: { entity: 'user', invalidArgs: { foo: 'bar'} },
                    cause: {foo: 'bar'},
                    code: 'INVALID_ARGUMENTS',
                    message: 'Invalid arguments'
                  }
            },
            {
                ret: Err.permissionDenied({payload: { entity: 'user' }, cause: {foo: 'bar'} }),
                type: 'isPermissionDeniedError',
                expect: {
                    payload: { entity: 'user' },
                    cause: {foo: 'bar'},
                    code: 'PERMISSION_DENIED',
                    message: 'Permission denied'
                  }
            },
            {
                ret: Err.unknown(),
                type: 'isUnknownError',
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'UNKNOWN',
                    message: 'Unknown Error'
                  }
            },
            {
                ret: Err.notFound(),
                type: 'isNotFoundError',
                expect: {
                    payload: undefined,
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: 'Not Found'
                  }
            }
        ]

        // then
        for(const scenario of scenarios) {
            assert.deepStrictEqual(scenario.ret.err, scenario.expect)
            assert.deepStrictEqual(scenario.ret[scenario.type], true)
        }
        
        
    })
})