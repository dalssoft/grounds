class Ok {

	constructor(value) {
		this.value = value
		if (value instanceof Ok)
			this.value = value.value
	}

	get isOk() { return true }
	get isErr() { return false }
	get ok() { return this.value }
	get err() { return null }
	
	toString() {
		if (this.value)
			return 'Ok: ' + JSON.stringify(this.value)
		return 'Ok'
	}

	toJSON() { return { 'Ok': (this.value === undefined ? '' : this.value) } }
}

class Err {

	constructor(error) {
		this._error = error
		if (error instanceof Err)
			this._error = error._error
	}

	get isOk() { return false }
	get isErr() { return true }
	get ok() { return null }
	get err() { return this._error }

	toString() {
		if (this._error)
			return "Error: " + JSON.stringify(this._error)
		return "Error"
	}

	toJSON() {
		let error = (this._error === undefined ? '' : this._error)
		error = error instanceof Error ? error.toString() : error
		return { 'Error': error }
	}
}


const ErrBuilder = (err) => new Err(err)

Object.assign(ErrBuilder, {
	buildCustomErr: (code, message, payload, cause, caller) => {
		const err = new Err({ payload, cause, code, message })
		err[`is${caller}Error`] = true
		return err
	},
	notFound: ({ message = 'Not Found', payload, cause } = {}) =>
		ErrBuilder.buildCustomErr('NOT_FOUND', message, payload, cause, 'NotFound'),
	alreadyExists: ({ message = 'Already exists', payload, cause } = {}) =>
		ErrBuilder.buildCustomErr('ALREADY_EXISTS', message, payload, cause, 'AlreadyExists'),
	invalidEntity: ({ message = 'Invalid entity', payload, cause } = {}) =>
		ErrBuilder.buildCustomErr('INVALID_ENTITY', message, payload, cause, 'InvalidEntity'),
	invalidArguments: ({ message = 'Invalid arguments', args, payload = {}, cause } = {}) => {
		payload.invalidArgs = args
		return ErrBuilder.buildCustomErr('INVALID_ARGUMENTS', message, payload, cause, 'InvalidArguments')
	},
	permissionDenied: ({ message = 'Permission denied', payload, cause } = {}) =>
		ErrBuilder.buildCustomErr('PERMISSION_DENIED', message, payload, cause, 'PermissionDenied'),
	unknown: ({ message = 'Unknown Error', payload, cause } = {}) =>
		ErrBuilder.buildCustomErr('UNKNOWN', message, payload, cause, 'Unknown')
})

module.exports = {
	Ok: (value) => new Ok(value),
	Err: ErrBuilder,
}