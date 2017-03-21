<?php

namespace Drupal\commonfare_ui\Breadcrumb;

use Drupal\Core\Breadcrumb\BreadcrumbBuilderInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Link;

class WelfareBreadcrumbBuilder implements BreadcrumbBuilderInterface {

  /**
   * @inheritdoc
   */
  public function applies(RouteMatchInterface $route_match) {
    // This breadcrumb apply only for all articles
    $parameters = $route_match->getParameters()->all();
    kint($parameters);
    if (isset($parameters['node'])) {
      return $parameters['node']->getType() == 'welfare_organization';
    }
  }

  /**
   * @inheritdoc
   */
  public function build(RouteMatchInterface $route_match) {

    $breadcrumb = [];

    $breadcrumb[] = Link::createFromRoute($this->t('Home'), '<front>');
    $breadcrumb[] = Link::createFromRoute($this->t('Blog'), '<<<your route for blog>>>');

    return $breadcrumb;
  }
}
