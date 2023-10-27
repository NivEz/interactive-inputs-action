const core = require('@actions/core');
const Telenode = require('telenode-js');
const { getActionInput } = require('./inputs');

const action = async () => {
	try {
		const apiToken = getActionInput('telegram-api-token');
		const chatId = getActionInput('telegram-chat-id');

		if (!apiToken || !chatId) {
			core.setFailed('telegram-api-token and telegram-chat-id are required inputs');
		}

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

		const question = getActionInput('question');

		console.log('Testing console log!');
		console.info('Testing console info!');
		console.debug('Testing console debug!');
		core.debug('Testing core debug!');
		core.info('Testing core info!');
		core.notice('Testing core notice!');
		core.debug(question);
		core.info('question', question);
		console.info('question debug', question);

		if (!question) {
			core.setFailed('question is a required input');
		}
		const choices = getActionInput('choices');
		const defaultChoice = getActionInput('default-choice');
		let message = getActionInput('message');
		const timeout = getActionInput('timeout');
		const timeoutMessage = getActionInput('timeout-message');
		const isChoosingRequired = getActionInput('is-choosing-required');
		const waitForTimeoutToFinish = getActionInput('wait-for-timeout-to-finish');

		bot.startLongPolling({ pollingDelay: 500 });

		const structuredChoices = choices.map(choice => ({ text: choice }));
		bot.sendInlineKeyboard(chatId, question, structuredChoices);

		let userResponse = defaultChoice;
		const pollingTimeout = setTimeout(async () => {
			if (isChoosingRequired && !userResponse) {
				if (timeoutMessage) {
					await bot.sendTextMessage(timeoutMessage, chatId);
				}
				core.setFailed('Timeout exceeded and no choice has been selected');
			}
			if (message) {
				await sendMessageAfterInteraction(message);
			}
		}, timeout * 1000);

		choices.forEach(choice => {
			bot.onButton(choice, async () => {
				userResponse = choice;
				if (!waitForTimeoutToFinish) {
					bot.useLongPolling = false;
					clearTimeout(pollingTimeout);
					if (message) {
						await sendMessageAfterInteraction(message);
					}
				}
			});
		});
	} catch (error) {
		core.setFailed(error.message);
	}
};

const sendMessageAfterInteraction = async message => {
	message = message.replace('%s', userResponse);
	core.setOutput('user-response', userResponse);
	await bot.sendTextMessage(message, chatId);
};

action();
