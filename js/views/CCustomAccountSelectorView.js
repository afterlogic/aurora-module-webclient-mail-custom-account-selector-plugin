'use strict';

const
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),

	AccountList = ModulesManager.run('MailWebclient', 'getAccountList'),

	Settings = require('modules/%ModuleName%/js/Settings.js')
;

function CCustomAccountSelectorView(allInboxesUnseenCounts)
{
	this.accounts = ko.computed(function () {
		if (AccountList) {
			return _.map(AccountList.collection(), (account) => {
				return {
					isCurrent: account.isCurrent,
					id: account.id,
					mailboxName: ko.observable(account.mailboxName()),
					position: ko.observable(account.mailboxPosition()),
					changeAccount: account.changeAccount.bind(account),
					unseenMessagesCount: ko.computed(() => allInboxesUnseenCounts()[account.id()] || 0)
				};
			});
		}
		return [];
	}, this);

	this.sortedAccounts = ko.computed(function () {
		return this.accounts().sort((accountA, accountB) => (accountA.position() > accountB.position()) ? 1 : -1);
	}, this);

	this.visible = ko.computed(function () {
		return this.sortedAccounts().length > 0;
	}, this);

	this.hideLastAccounts = ko.computed(function () {
		return Settings.NumberOfAccountsToDisplay > 0
			   && Settings.NumberOfAccountsToDisplay < (this.sortedAccounts().length - 1);
	}, this);
	this.firstAccounts = ko.computed(function () {
		if (this.hideLastAccounts()) {
			return this.sortedAccounts().slice(0, Settings.NumberOfAccountsToDisplay);
		} else {
			return this.sortedAccounts();
		}
	}, this);
	this.lastAccounts = ko.computed(function () {
		if (this.hideLastAccounts()) {
			return this.sortedAccounts().slice(Settings.NumberOfAccountsToDisplay);
		} else {
			return [];
		}
	}, this);
	this.showLastAccounts = ko.observable(false);
	this.lastAccountsMaxHeight = ko.observable(0);
	this.lastAccountsDom = ko.observable(null);
	this.accountListDivided = ko.computed(function () {
		return this.lastAccounts().length > 0;
	}, this);

	this.editMode = ko.observable(false);
	this.visibleLastAccounts = ko.computed(function () {
		return this.showLastAccounts() && !this.editMode();
	}, this);

	if (AccountList) {
		AccountList.currentId.subscribe(this.showLastAccountsIfNecessary, this);
		this.showLastAccountsIfNecessary();
	}
}

CCustomAccountSelectorView.prototype.ViewTemplate = '%ModuleName%_CustomAccountSelectorView';

CCustomAccountSelectorView.prototype.showLastAccountsIfNecessary = function () {
	const isCurrentInLastPart = !!this.lastAccounts().find(account => account.id() === AccountList.currentId());
	if (isCurrentInLastPart) {
		this.showLastAccounts(true);
	}
};

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

CCustomAccountSelectorView.prototype.switchToEditMode = function () {
	this.editMode(true);
};

CCustomAccountSelectorView.prototype.cancelEditMode = function () {
	this.editMode(false);
	AccountList.collection.valueHasMutated();
};

CCustomAccountSelectorView.prototype.moveUpAccount = function (accountId) {
	const position = this.sortedAccounts().findIndex(account => account.id() === accountId);
	if (position > 0) {
		const
			account = this.sortedAccounts()[position],
			prevAccount = this.sortedAccounts()[position - 1]
		;
		account.position(position - 1);
		prevAccount.position(position);
	}
};

CCustomAccountSelectorView.prototype.saveChanges = function () {
	const
		accountsData = this.sortedAccounts().map(account => {
			return {
				'AccountID': account.id(),
				'MailboxName': account.mailboxName(),
				'MailboxPosition': account.position()
			};
		}),
		parameters = {
			'AccountsData': accountsData
		}
	;
	Ajax.send('%ModuleName%', 'SaveAccountsData', parameters, (response, request) => {
		if (response.Result) {
			if (AccountList) {
				AccountList.collection().forEach(account => {
					const accountData = accountsData.find(data => data.AccountID === account.id());
					if (accountData) {
						account.mailboxName(accountData.MailboxName);
						account.mailboxPosition(accountData.MailboxPosition);
					}
				});
			}
		} else {}
	}, this);
	this.cancelEditMode();
};

module.exports = CCustomAccountSelectorView;
