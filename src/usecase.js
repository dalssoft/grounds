const { step } = require('./step')
const { Err } = require('./results')
const { schema } = require('./schema')
const { v4: uuidv4 } = require('uuid')

class UseCase {

    constructor(description, body) {
        this.type = "use case"
        this.description = description

        //request schema
        this._requestSchema = body.request
        delete body.request

        //response schema
        this._responseSchema = body.response
        delete body.response

        //authotization
        this._authorize = body.authorize
        this._hasAuthorization = null
        delete body.authorize

        //setup function
        this._setup = body.setup || (() => void 0)
        delete body.setup

        // main step
        this._mainStep = step(body)
        this._mainStep.type = this.type
        this._mainStep.description = description

        // audit trail
        this._auditTrail = this._mainStep._auditTrail
        this._auditTrail.type = this.type
        this._auditTrail.description = description
        this._auditTrail.transactionId = uuidv4()

        // run flag
        this._hasRun = false
    }

    async authorize(user) {
        this._hasAuthorization = false
        this._auditTrail.user = { ...user }
        if (this._authorize) {
            const ret = await this._authorize(user)
            if (ret.isOk) this._hasAuthorization = true
        }
        return this._auditTrail.authorized = this._hasAuthorization
    }

    async run(request) {

        if (this._hasRun)
            return Err('Cannot run use case more than once. Try to instantiate a new object before run this use case.')
        this._hasRun = true

        if ((this._hasAuthorization === false) ||
            (this._authorize && this._hasAuthorization === null))
            return Err('Not Authorized')

        if (request) {
            const requestSchema = schema(this._requestSchema)
            requestSchema.validate(request)
            if (!requestSchema.isValid) return Err({ request: requestSchema.errors })
            this._mainStep.context.req = request
        }

        this._setup(this._mainStep.context)

        return this._mainStep.run()
    }

    doc() {
        const docStep = this._mainStep.doc()
        if (this._requestSchema) docStep.request = this._requestSchema
        if (this._responseSchema) docStep.response = this._responseSchema
        return docStep
    }

    get auditTrail() {
        return this._mainStep.auditTrail
    }

    get requestSchema() {
        return this._requestSchema
    }

    get responseSchema() {
        return this._responseSchema
    }

}

const usecase = (description, body) => {
    return new UseCase(description, body)
}

module.exports = { usecase }