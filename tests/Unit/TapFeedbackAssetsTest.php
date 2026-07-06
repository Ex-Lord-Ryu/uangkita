<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class TapFeedbackAssetsTest extends TestCase
{
    public function test_global_tap_feedback_script_is_registered(): void
    {
        $script = file_get_contents(dirname(__DIR__, 2).'/resources/js/app.jsx');
        $helper = file_get_contents(dirname(__DIR__, 2).'/resources/js/lib/tapFeedback.js');

        $this->assertIsString($script);
        $this->assertIsString($helper);
        $this->assertStringContainsString("import { setupTapFeedback } from './lib/tapFeedback';", $script);
        $this->assertStringContainsString('setupTapFeedback();', $script);
        $this->assertStringContainsString("const tapFeedbackClass = 'tap-feedback-active';", $helper);
        $this->assertStringContainsString("'pointerdown'", $helper);
        $this->assertStringContainsString("'keydown'", $helper);
        $this->assertStringContainsString('window.__uangKuTapFeedbackBound = true;', $helper);
    }

    public function test_global_tap_feedback_styles_are_available(): void
    {
        $styles = file_get_contents(dirname(__DIR__, 2).'/resources/css/app.css');

        $this->assertIsString($styles);
        $this->assertStringContainsString('.tap-feedback-active', $styles);
        $this->assertStringContainsString('touch-action: manipulation;', $styles);
        $this->assertStringContainsString('scale: 0.98;', $styles);
        $this->assertStringContainsString('prefers-reduced-motion: reduce', $styles);
    }

    public function test_savings_forms_show_loading_feedback_while_processing(): void
    {
        $button = file_get_contents(dirname(__DIR__, 2).'/resources/js/Components/ui/Button.jsx');
        $page = file_get_contents(dirname(__DIR__, 2).'/resources/js/Pages/Savings/Index.jsx');

        $this->assertIsString($button);
        $this->assertIsString($page);
        $this->assertStringContainsString('loading = false', $button);
        $this->assertStringContainsString('animate-spin', $button);
        $this->assertStringContainsString('loading={accountForm.processing}', $page);
        $this->assertStringContainsString('closeable={!accountForm.processing}', $page);
        $this->assertStringContainsString('Rekening tabungan sedang disimpan...', $page);
        $this->assertStringContainsString('loading={mutationForm.processing}', $page);
        $this->assertStringContainsString('Mutasi tabungan sedang disimpan...', $page);
    }

    public function test_sidebar_top_bar_stays_fixed_while_scrolling(): void
    {
        $layout = file_get_contents(dirname(__DIR__, 2).'/resources/js/Layouts/SidebarLayout.jsx');

        $this->assertIsString($layout);
        $this->assertStringContainsString('overflow-x-clip bg-gray-50', $layout);
        $this->assertStringContainsString('flex-col overflow-x-clip transition-all', $layout);
        $this->assertStringContainsString('fixed left-0 right-0 top-0 z-30', $layout);
        $this->assertStringContainsString("collapsed ? 'lg:left-20' : 'lg:left-64'", $layout);
        $this->assertStringContainsString('h-16 shrink-0', $layout);
        $this->assertStringContainsString('shadow-sm backdrop-blur', $layout);
    }
}
