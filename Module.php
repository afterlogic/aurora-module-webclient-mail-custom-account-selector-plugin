<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MailCustomAccountSelectorWebclientPlugin;

/**
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2022, Afterlogic Corp.
 *
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractModule
{
	public function init() 
	{
	}

	/**
	 * Obtains list of module settings for super admin.
	 * @return array
	 */
	public function GetAccountsRelevantFoldersInformation($AccountsData)
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::NormalUser);

		$aAccountsData = [];
		foreach ($AccountsData as $aAccountData)
		{
			$iAccountId = $aAccountData['AccountID'];
			$oAccount = \Aurora\Modules\Mail\Module::Decorator()->GetAccount($iAccountId);
			if ($oAccount instanceof \Aurora\Modules\Mail\Models\MailAccount)
			{
				\Aurora\Modules\Mail\Module::checkAccess($oAccount);
				$aCounts = \Aurora\Modules\Mail\Module::Decorator()->GetRelevantFoldersInformation($iAccountId, $aAccountData['Folders'], $aAccountData['UseListStatusIfPossible']);
				$aCounts['AccountId'] = $iAccountId;
				$aAccountsData[] = $aCounts;
			}
		}
		return ['Accounts' => $aAccountsData];
	}
}
