const core = require('@actions/core');

const types = {
	'telegram-api-token': 'string',
	'telegram-chat-id': 'string',
	question: 'string',
	choices: 'array',
	'default-choice': 'string',
	message: 'string',
	timeout: 'number',
	'timeout-message': 'string',
	'is-choosing-required': 'boolean',
	'wait-for-timeout-to-finish': 'boolean',
	'simple-message': 'string',
};

export const getActionInput = input => {
	const actionInput = core.getInput(input);
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
		case 'boolean':
			returnValue = actionInput === 'true';
		case 'array':
			try {
				const arr = JSON.parse(actionInput);
				if (!Array.isArray(arr)) {
					throw new Error();
				}
				returnValue = arr;
			} catch (error) {
				throw new Error(`Input ${input} is not an array`);
			}
	}
	return returnValue;
};
