const core = require('@actions/core');
const Telenode = require('telenode-js');
const { getActionInput } = require('./inputs');

const action = async () => {
	try {
		console.log('Starting interactive inputs action');

		const apiToken = getActionInput('telegram-api-token');
		const chatId = getActionInput('telegram-chat-id');
		core.setSecret(apiToken);
		core.setSecret(chatId);

		const bot = new Telenode({
			apiToken,
		});

		const simpleMessage = getActionInput('simple-message');
		if (simpleMessage) {
			console.log('Sending simple message and finishing execution');
			await bot.sendTextMessage(simpleMessage, chatId);
			return;
		}

		const question = getActionInput('question');
		const choices = getActionInput('choices');
		const defaultChoice = getActionInput('default-choice');
		let message = getActionInput('message');
		const timeout = getActionInput('timeout');
		const timeoutMessage = getActionInput('timeout-message');
		const isChoosingRequired = getActionInput('is-choosing-required');
		const waitForTimeoutToFinish = getActionInput('wait-for-timeout-to-finish');

		bot.startLongPolling({ pollingDelay: 500 });

		if (!choices.includes(defaultChoice)) {
			core.warning('Default choice is not in choices');
		}

		const structuredChoices = choices.map(choice => [{ text: choice, callback_data: choice }]);
		console.log('Sending question');
		await bot.sendInlineKeyboard(chatId, question, structuredChoices);

		let userResponse = defaultChoice;
		const pollingTimeout = setTimeout(async () => {
			try {
				if (isChoosingRequired && !userResponse) {
					if (timeoutMessage) {
						await bot.sendTextMessage(timeoutMessage, chatId);
					}
					core.error('Timeout exceeded and no choice has been selected');
					throw new Error('Timeout exceeded and no choice has been selected');
				}
				await finishInteraction(bot, message, chatId, userResponse);
			} catch (error) {
				bot.useLongPolling = false;
				core.setFailed(error.message);
			}
		}, timeout * 1000);

		console.log('Registering Telenode handlers');
		choices.forEach(choice => {
			bot.onButton(choice, async () => {
				userResponse = choice;
				if (!waitForTimeoutToFinish) {
					clearTimeout(pollingTimeout);
					console.log('Cleared timeout');
					await finishInteraction(bot, message, chatId, userResponse);
				}
			});
		});
	} catch (error) {
		bot.useLongPolling = false;
		core.setFailed(error.message);
	}
};

const finishInteraction = async (bot, message, chatId, userResponse) => {
	bot.useLongPolling = false;
	console.log('Finishing interaction');
	if (message) {
		message = message.replace('%s', userResponse);
		await bot.sendTextMessage(message, chatId);
	}
	core.setOutput('user-response', userResponse);
};

action();
