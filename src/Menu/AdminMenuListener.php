<?php

namespace Barth\SyliusGeminiLocalTranslatePlugin\Menu;

use Sylius\Bundle\AdminBundle\Menu\MainMenuBuilder;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: MainMenuBuilder::EVENT_NAME, method: 'addDiagnosticMenuItem')]
final class AdminMenuListener
{
    public function addDiagnosticMenuItem($event): void
    {
        $menu = $event->getMenu();
        $configuration = $menu->getChild('configuration');
        if (null === $configuration) {
            return;
        }

        $configuration
            ->addChild('barth_sylius_gemini_local_translate_diagnostic', ['route' => 'barth_sylius_gemini_local_translate_diagnostic'])
            ->setLabel('barth.gemini_local.admin_menu.diagnostic')
            ->setLabelAttribute('icon', 'tabler:robot');
    }
}
