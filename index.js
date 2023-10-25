const core = require('@actions/core');
const Telenode = require('telenode-js');
const { getActionInput } = require('./inputs');

const action = async () => {
	try {
		const apiToken = getActionInput('telegram-api-token');
		const chatId = getActionInput('telegram-chat-id');

		core.setSecret(apiToken);
		core.setSecret(chatId);

		const simpleMessage = getActionInput('simple-message');

		const bot = new Telenode({
			apiToken,
		});

		if (simpleMessage) {
			await bot.sendTextMessage(simpleMessage, chatId);
			return;
		}

		// early return for testing purposes
		return;

		bot.startLongPolling({ pollingDelay: 500 });

		const question = getActionInput('question');
		const choices = getActionInput('choices');
		const defaultChoice = getActionInput('default-choice');
		const message = getActionInput('message');
		const timeout = getActionInput('timeout');
		const timeoutMessage = getActionInput('timeout-message');
		const isChoosingRequired = getActionInput('is-choosing-required');
		const waitForTimeoutToFinish = getActionInput('wait-for-timeout-to-finish');
	} catch (error) {
		core.setFailed(error.message);
	}
};

action();
