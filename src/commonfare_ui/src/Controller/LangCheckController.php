<?php

namespace Drupal\commonfare_ui\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;

/**
 * LangCheckController controller.
 */
class LangCheckController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function content() {
    $response = new Response();
    $response->setContent(json_encode([
      'lang' => \Drupal::languageManager()->getCurrentLanguage()->getId(),
    ]));
    return $response;
  }

}
