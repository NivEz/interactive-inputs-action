const core = require('@actions/core');

export const log = (message, style) => {
	let stylePrefix = '';
	switch (style.toLowerCase()) {
		case 'bold':
			stylePrefix = '\u001b[1m';
			break;
		case 'italic':
			stylePrefix = '\u001b[3m';
			break;
		case 'underlined':
			stylePrefix = '\u001b[4m';
			break;
	}
	core.info(stylePrefix + message);
};
