const core = require('@actions/core');

const types = {
	'telegram-api-token': 'string',
	'telegram-chat-id': 'string',
	question: 'string',
	options: 'array',
	'default-choice': 'string',
	message: 'string',
	timeout: 'number',
	'timeout-message': 'string',
	'is-choosing-required': 'boolean',
	'wait-for-timeout-to-finish': 'boolean',
	'simple-message': 'string',
};

const requiredInputs = ['telegram-api-token', 'telegram-chat-id', 'question'];

export const getActionInput = input => {
	const required = requiredInputs.includes(input);
	const actionInput = core.getInput(input, { required });
	const inputType = types[input];
	if (!inputType) {
		throw new Error(`Input ${input} is not supported`);
	}
	let returnValue;
	switch (inputType) {
		case 'string':
			return actionInput;
		case 'number':
			if (!actionInput) {
				return;
			}
			const num = parseInt(actionInput);
			if (isNaN(num)) {
				throw new Error(`Input ${input} is not a number`);
			}
			returnValue = num;
			break;
		case 'boolean':
			returnValue = actionInput === 'true';
			break;
		case 'array':
			try {
				const arr = JSON.parse(actionInput);
				if (!Array.isArray(arr)) {
					throw new Error();
				}
				returnValue = arr;
				break;
			} catch (error) {
				throw new Error(`Input ${input} is not an array`);
			}
	}
	return returnValue;
};
