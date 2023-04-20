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
 * @copyright Copyright (c) 2023, Afterlogic Corp.
 *
 * @property Settings $oModuleSettings
 *
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractModule
{
    public function init()
    {
    }

    /**
     * @return Module
     */
    public static function getInstance()
    {
        return parent::getInstance();
    }

    /**
     * @return Module
     */
    public static function Decorator()
    {
        return parent::Decorator();
    }

    /**
     * @return Settings
     */
    public function getModuleSettings()
    {
        return $this->oModuleSettings;
    }

    /**
     * Obtains list of module settings.
     * @return array
     */
    public function GetSettings()
    {
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::NormalUser);

        return [
            'NumberOfAccountsToDisplay' => $this->oModuleSettings->NumberOfAccountsToDisplay
        ];
    }

    /**
     * Obtains relevant folders information for several accounts
     * @return array
     */
    public function GetAccountsRelevantFoldersInformation($AccountsData)
    {
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::NormalUser);

        $aResultAccountsData = [];
        foreach ($AccountsData as $aAccountData) {
            $iAccountId = $aAccountData['AccountID'];
            $oAccount = \Aurora\Modules\Mail\Module::Decorator()->GetAccount($iAccountId);
            if ($oAccount instanceof \Aurora\Modules\Mail\Models\MailAccount) {
                \Aurora\Modules\Mail\Module::checkAccess($oAccount);
                $aCounts = \Aurora\Modules\Mail\Module::Decorator()->GetRelevantFoldersInformation($iAccountId, $aAccountData['Folders'], $aAccountData['UseListStatusIfPossible']);
                $aCounts['AccountId'] = $iAccountId;
                $aResultAccountsData[] = $aCounts;
            }
        }
        return ['Accounts' => $aResultAccountsData];
    }

    public function SaveAccountsData($AccountsData)
    {
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::NormalUser);

        foreach ($AccountsData as $aAccountData) {
            $iAccountId = $aAccountData['AccountID'];
            $oAccount = \Aurora\Modules\Mail\Module::Decorator()->GetAccount($iAccountId);
            if ($oAccount instanceof \Aurora\Modules\Mail\Models\MailAccount) {
                \Aurora\Modules\Mail\Module::checkAccess($oAccount);
                if (isset($aAccountData['MailboxName'])) {
                    $oAccount->{self::GetName() . '::MailboxName'} = $aAccountData['MailboxName'];
                }
                if (isset($aAccountData['MailboxPosition'])) {
                    $oAccount->{self::GetName() . '::MailboxPosition'} = $aAccountData['MailboxPosition'];
                }
                $oAccount->save();
            }
        }

        return true;
    }
}
