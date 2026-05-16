<?php

use Barth\SyliusGeminiLocalTranslatePlugin\Service\TranslationConfig;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $services = $container->services();
    $services->defaults()
        ->autowire()
        ->autoconfigure();

    $services->load('Barth\\SyliusGeminiLocalTranslatePlugin\\', __DIR__.'/../src/*')
        ->exclude([__DIR__.'/../src/{DependencyInjection,Entity,Migrations,Tests}']);
};
