const { Ok, Err } = require('./results')

class IfElse {

    constructor(body) {
        this.type = "if else"
        this._body = body
        this._auditTrail = { type: this.type }
    }

    _addMeta(info) {
        const [description, step] = info
        step.description = description
        step.context = this.context
        return step
    }

    async run() {
        const startTime = process.hrtime.bigint() /* measure time */
        this._auditTrail.description = this.description

        const steps = Object.entries(this._body)
        const [ifInfo, thenInfo, elseInfo] = steps

        const ifStep = this._addMeta(ifInfo)
        const thenStep = this._addMeta(thenInfo)
        const elseStep = this._addMeta(elseInfo)

        const ifRet = this._auditTrail.returnIf = await ifStep.run()
        let ret
        if (ifRet && ifRet.isOk && ifRet.value === true) {
            ret = this._auditTrail.returnThen = await thenStep.run()
        }
        else if (ifRet && ifRet.isOk && ifRet.value === false) {
            ret = this._auditTrail.returnElse = await elseStep.run()
        }
        else
            ret = this._auditTrail.returnIf = Err({ value: ifRet, msg: 'Invalid ifElse' })
        this._auditTrail.elapsedTime = process.hrtime.bigint() - startTime
        return ret
    }

    doc() {
        const steps = Object.entries(this._body)
        const [ifInfo, thenInfo, elseInfo] = steps

        const ifStep = this._addMeta(ifInfo)
        const thenStep = this._addMeta(thenInfo)
        const elseStep = this._addMeta(elseInfo)

        return {
            description: this.description,
            type: this.type,
            'if': ifStep.doc(),
            'then': thenStep.doc(),
            'else': elseStep.doc()
        }
    }

    get auditTrail() {
        return this._auditTrail
    }
}

const ifElse = (body) => {
    return new IfElse(body)
}

module.exports = { ifElse }