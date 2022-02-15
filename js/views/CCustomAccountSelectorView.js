'use strict';

const
	_ = require('underscore'),
	ko = require('knockout'),

	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),

	AccountList = ModulesManager.run('MailWebclient', 'getAccountList'),

	Settings = require('modules/%ModuleName%/js/Settings.js')
;

function CCustomAccountSelectorView(allInboxesUnseenCounts)
{
	this.accounts = AccountList ? AccountList.collection : [];
	this.accounts = ko.computed(function () {
		if (AccountList) {
			return _.map(AccountList.collection(), (account) => {
				return {
					isCurrent: account.isCurrent,
					email: account.email,
					changeAccount: account.changeAccount.bind(account),
					unseenMessagesCount: ko.computed(() => allInboxesUnseenCounts()[account.id()] || 0)
				};
			});
		}
		return [];
	}, this);
	this.visible = ko.computed(function () {
		return Settings.accountsAboveFolders() && this.accounts().length > 0;
	}, this);
}

CCustomAccountSelectorView.prototype.ViewTemplate = '%ModuleName%_CustomAccountSelectorView';

module.exports = CCustomAccountSelectorView;
