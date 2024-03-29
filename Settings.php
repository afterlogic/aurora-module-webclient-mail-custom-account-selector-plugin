<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MailCustomAccountSelectorWebclientPlugin;

use Aurora\System\SettingsProperty;

/**
 * @property bool $Disabled
 * @property int $NumberOfAccountsToDisplay
 * @property array $AvailableFor
 */

class Settings extends \Aurora\System\Module\Settings
{
    protected function initDefaults()
    {
        $this->aContainer = [
            "Disabled" => new SettingsProperty(
                false,
                "bool",
                null,
                "Setting to true disables the module",
            ),
            "NumberOfAccountsToDisplay" => new SettingsProperty(
                3,
                "int",
                null,
                "",
            ),
            "AvailableFor" => new SettingsProperty(
                [
                    "MailWebclient"
                ],
                "array",
                null,
                "Automatically provide this feature if one of the listed modules is requested by the entry point",
            ),
        ];
    }
}
