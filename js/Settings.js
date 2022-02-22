'use strict';

const
	_ = require('underscore'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

module.exports = {
	NumberOfAccountsToDisplay: 3,

	/**
	 * Initializes settings from AppData object sections.
	 * 
	 * @param {Object} appData Object contained modules settings.
	 */
	init: function (appData)
	{
		const appDataSection = appData['%ModuleName%'];
		if (!_.isEmpty(appDataSection)) {
			this.NumberOfAccountsToDisplay = Types.pInt(appDataSection.NumberOfAccountsToDisplay, this.NumberOfAccountsToDisplay);
		}
	}
};
