const core = require('@actions/core');
const Telenode = require('telenode-js');
const { getActionInput } = require('./inputs');
const { log } = require('./log');

const action = async () => {
	try {
		log('Starting interactive inputs action', 'bold', 'cyan');

		const apiToken = getActionInput('telegram-api-token');
		const chatId = getActionInput('telegram-chat-id');
		core.setSecret(apiToken);
		core.setSecret(chatId);

		const bot = new Telenode({
			apiToken,
		});

		const simpleMessage = getActionInput('simple-message');
		if (simpleMessage) {
			log('Sending simple message and finishing execution', 'bold', 'cyan');
			await bot.sendTextMessage(simpleMessage, chatId);
			return;
		}

		const question = getActionInput('question');
		const options = getActionInput('options');
		const defaultChoice = getActionInput('default-choice');
		let message = getActionInput('message');
		const timeout = getActionInput('timeout');
		const timeoutMessage = getActionInput('timeout-message');
		const isChoosingRequired = getActionInput('is-choosing-required');
		const waitForTimeoutToFinish = getActionInput('wait-for-timeout-to-finish');

		bot.startLongPolling({ pollingDelay: 500 });

		if (!options.includes(defaultChoice)) {
			core.warning('Default choice is not in options');
		}

		const structuredOptions = options.map(option => [{ text: option, callback_data: option }]);
		log('Sending question', 'bold', 'cyan');
		await bot.sendInlineKeyboard(chatId, question, structuredOptions);

		let userChoice = defaultChoice;
		const pollingTimeout = setTimeout(async () => {
			try {
				if (isChoosingRequired && !userChoice) {
					if (timeoutMessage) {
						await bot.sendTextMessage(timeoutMessage, chatId);
					}
					core.error('Timeout exceeded and no option has been selected');
					throw new Error('Timeout exceeded and no option has been selected');
				}
				await finishInteraction(bot, message, chatId, userChoice);
			} catch (error) {
				bot.useLongPolling = false;
				core.setFailed(error.message);
			}
		}, timeout * 1000);

		log('Registering Telenode handlers', 'bold', 'cyan');
		options.forEach(option => {
			bot.onButton(option, async () => {
				userChoice = option;
				if (!waitForTimeoutToFinish) {
					clearTimeout(pollingTimeout);
					log('Cleared timeout', 'bold', 'cyan');
					await finishInteraction(bot, message, chatId, userChoice);
				}
			});
		});
	} catch (error) {
		bot.useLongPolling = false;
		core.setFailed(error.message);
	}
};

const finishInteraction = async (bot, message, chatId, userChoice) => {
	bot.useLongPolling = false;
	log('Finishing interaction', 'bold', 'cyan');
	if (message) {
		message = message.replace('%s', userChoice);
		await bot.sendTextMessage(message, chatId);
	}
	core.setOutput('user-choice', userChoice);
};

action();
