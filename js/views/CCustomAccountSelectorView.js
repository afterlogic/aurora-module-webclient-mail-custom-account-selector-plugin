'use strict';

const
	_ = require('underscore'),
	$ = require('jquery'),
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
		return this.accounts().length > 0;
	}, this);

	this.hideLastAccounts = ko.computed(function () {
		return Settings.NumberOfAccountsToDisplay > 0
			   && Settings.NumberOfAccountsToDisplay < (this.accounts().length - 1);
	}, this);
	this.firstAccounts = ko.computed(function () {
		if (this.hideLastAccounts()) {
			return this.accounts().slice(0, Settings.NumberOfAccountsToDisplay);
		} else {
			return this.accounts();
		}
	}, this);
	this.lastAccounts = ko.computed(function () {
		if (this.hideLastAccounts()) {
			return this.accounts().slice(Settings.NumberOfAccountsToDisplay);
		} else {
			return [];
		}
	}, this);
	this.showLastAccounts = ko.observable(false);
	this.lastAccountsMaxHeight = ko.observable(0);
	this.lastAccountsDom = ko.observable(null);
}

CCustomAccountSelectorView.prototype.ViewTemplate = '%ModuleName%_CustomAccountSelectorView';

CCustomAccountSelectorView.prototype.setLastAccountsMaxHeight = function () {
	if (this.lastAccountsDom()) {
		this.lastAccountsMaxHeight(this.lastAccountsDom().children().first().outerHeight());
	}
};

CCustomAccountSelectorView.prototype.onShow = function () {
	this.setLastAccountsMaxHeight();
};

CCustomAccountSelectorView.prototype.triggerShowLastAccounts = function () {
	this.setLastAccountsMaxHeight();
	this.showLastAccounts(!this.showLastAccounts());
};

module.exports = CCustomAccountSelectorView;
