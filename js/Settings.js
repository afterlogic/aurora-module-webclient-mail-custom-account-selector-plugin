'use strict';

var
	ko = require('knockout'),
	_ = require('underscore'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

module.exports = {
	accountsAboveFolders: ko.observable(true),

	/**
	 * Initializes settings from AppData object sections.
	 * 
	 * @param {Object} appData Object contained modules settings.
	 */
	init: function (appData)
	{
		var appDataSection = appData['%ModuleName%'];
		if (!_.isEmpty(appDataSection)) {
			this.accountsAboveFolders(Types.pBool(appDataSection.AccountsAboveFolders, this.accountsAboveFolders()));
		}
	},

	/**
	 * Updates new settings values after saving on server.
	 * @param {boolean} accountsAboveFolders
	 */
	update: function (accountsAboveFolders)
	{
		this.accountsAboveFolders(Types.pBool(accountsAboveFolders, this.accountsAboveFolders()));
	}
};
