package controllers

import com.softwaremill.macwire._
import common.AkkaAsync
import controllers.admin._
import controllers.admin.commercial.{DfpDataController, SlotController, TakeoverWithEmptyMPUsController}
import controllers.cache.{ImageDecacheController, PageDecacheController}

trait AdminControllers {
  def akkaAsync: AkkaAsync

  lazy val oAuthLoginController = wire[OAuthLoginController]
  lazy val uncachedWebAssets = wire[UncachedWebAssets]
  lazy val uncachedAssets = wire[UncachedAssets]
  lazy val adminIndexController = wire[AdminIndexController]
  lazy val frontPressController = wire[FrontPressController]
  lazy val r2PressController = wire[R2PressController]
  lazy val apiController = wire[Api]
  lazy val imageDecacheController = wire[ImageDecacheController]
  lazy val pageDecacheController = wire[PageDecacheController]
  lazy val ophanApiController = wire[OphanApiController]
  lazy val switchboardController = wire[SwitchboardController]
  lazy val switchboardPlistaController = wire[SwitchboardPlistaController]
  lazy val analyticsController = wire[AnalyticsController]
  lazy val analyticsConfidenceController = wire[AnalyticsConfidenceController]
  lazy val contentPerformanceController = wire[ContentPerformanceController]
  lazy val metricsController = wire[MetricsController]
  lazy val whatIsDeduped = wire[WhatIsDeduped]
  lazy val commercialController = wire[CommercialController]
  lazy val dfpDataController = wire[DfpDataController]
  lazy val slotController = wire[SlotController]
  lazy val takeoverWithEmptyMPUsController = wire[TakeoverWithEmptyMPUsController]
  lazy val fastlyController = wire[FastlyController]
  lazy val radiatorController = wire[RadiatorController]
  lazy val deploysRadiatorController = wire[DeploysRadiatorControllerImpl]
  lazy val deploysNotifyController = wire[DeploysNotifyControllerImpl]
  lazy val redirectController = wire[RedirectController]
  lazy val sportTroubleShooterController = wire[SportTroubleshooterController]
  lazy val troubleshooterController = wire[TroubleshooterController]
  lazy val siteController = wire[SiteController]
  lazy val paBrowserController = wire[PaBrowserController]
  lazy val playerController = wire[PlayerController]
  lazy val tablesController = wire[TablesController]
  lazy val frontsController = wire[FrontsController]
  lazy val cssReportController = wire[CssReportController]
}
