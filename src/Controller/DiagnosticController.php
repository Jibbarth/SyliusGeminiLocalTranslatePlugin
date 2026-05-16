<?php

namespace Barth\SyliusGeminiLocalTranslatePlugin\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DiagnosticController extends AbstractController
{
    #[Route('/%sylius_admin.path_name%/gemini-local-translate-plugin/diagnostic', name: 'barth_sylius_gemini_local_translate_diagnostic', methods: ['GET'])]
    public function __invoke(): Response
    {
        return $this->render('@BarthSyliusGeminiLocalTranslatePlugin/admin/diagnostic.html.twig');
    }
}
