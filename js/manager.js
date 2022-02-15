'use strict';

const ko = require('knockout');

const Types = require('%PathToCoreWebclientModule%/js/utils/Types.js');

const Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js');

const allInboxesUnseenCounts = ko.observable({});

function updateAllInboxesUnseenCounts(accountId, counts)
{
	if (Types.isNonEmptyArray(counts && counts.INBOX)) {
		allInboxesUnseenCounts()[accountId] = counts.INBOX[1];
		allInboxesUnseenCounts.valueHasMutated();
	}
}

function parseAccountsRelevantFoldersInformation(result)
{
	if (result && result.Accounts) {
		result.Accounts.forEach(accoutData => {
			updateAllInboxesUnseenCounts(accoutData.AccountId, accoutData.Counts);
		});
	}
}

function requestAccountsRelevantFoldersInformation(method, request, result, allAccounts)
{
	let refreshedAccountsIds = [];
	if (method === 'GetRelevantFoldersInformation' && result.Counts) {
		refreshedAccountsIds.push(request.Parameters.AccountID);
		updateAllInboxesUnseenCounts(request.Parameters.AccountID, result.Counts);
	}
	if (method === 'GetUnifiedRelevantFoldersInformation' && result.Accounts) {
		refreshedAccountsIds = result.Accounts.map(accoutData => accoutData.AccountId);
		parseAccountsRelevantFoldersInformation(result);
	}
	const parameters = {
		'AccountsData': allAccounts
			.filter(account => refreshedAccountsIds.indexOf(account.id()) === -1)
			.map(account => {
				return {
					'AccountID': account.id(),
					'Folders': ['INBOX'],
					'UseListStatusIfPossible': false
				};
			})
	};
	Ajax.send('%ModuleName%', 'GetAccountsRelevantFoldersInformation', parameters, (response, request) => {
		parseAccountsRelevantFoldersInformation(response.Result);
	}, this);
}

module.exports = function (appData) {
	const App = require('%PathToCoreWebclientModule%/js/App.js');

	if (App.isUserNormalOrTenant()) {
		App.subscribeEvent('MailWebclient::GetHeaderItemView', function (params) {
			params.HeaderItemView = require('modules/%ModuleName%/js/views/HeaderItemView.js');
		});
		return {
			start: (ModulesManager) => {
				if (ModulesManager.isModuleIncluded('MailWebclient')) {
					App.subscribeEvent('MailWebclient::RegisterFolderListController', function (registerFolderListController) {
						const CCustomAccountSelectorView = require('modules/%ModuleName%/js/views/CCustomAccountSelectorView.js');
						const CustomAccountSelectorView = new CCustomAccountSelectorView(allInboxesUnseenCounts);
						registerFolderListController(CustomAccountSelectorView, 'UnderNewMessageButton');
					});
					App.subscribeEvent('ReceiveAjaxResponse::after', function (params = {}) {
						const request = params.Request;
						const module = request && request.Module;
						const method = request && request.Method;
						const result = params.Response && params.Response.Result;
						const checkMethods = ['GetRelevantFoldersInformation', 'GetUnifiedRelevantFoldersInformation'];
						if (result && module === 'Mail' && checkMethods.indexOf(method) !== -1) {
							const AccountList = ModulesManager.run('MailWebclient', 'getAccountList');
							requestAccountsRelevantFoldersInformation(method, request, result, AccountList.collection());
						}
					});
				}
			}
		};
	}

	return null;
};
