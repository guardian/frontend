package dfp

import com.google.api.ads.admanager.axis.factory.AdManagerServices
import com.google.api.ads.admanager.axis.v202208._
import com.google.api.ads.admanager.lib.client.AdManagerSession

private[dfp] class ServicesWrapper(session: AdManagerSession) {

  private val dfpServices = new AdManagerServices

  lazy val lineItemService = dfpServices.get(session, classOf[LineItemServiceInterface])

  lazy val licaService = dfpServices.get(session, classOf[LineItemCreativeAssociationServiceInterface])

  lazy val customFieldsService = dfpServices.get(session, classOf[CustomFieldServiceInterface])

  lazy val customTargetingService = dfpServices.get(session, classOf[CustomTargetingServiceInterface])

  lazy val inventoryService = dfpServices.get(session, classOf[InventoryServiceInterface])

  lazy val suggestedAdUnitService = dfpServices.get(session, classOf[SuggestedAdUnitServiceInterface])

  lazy val placementService = dfpServices.get(session, classOf[PlacementServiceInterface])

  lazy val creativeTemplateService = dfpServices.get(session, classOf[CreativeTemplateServiceInterface])

  lazy val creativeService = dfpServices.get(session, classOf[CreativeServiceInterface])

  lazy val networkService = dfpServices.get(session, classOf[NetworkServiceInterface])

  lazy val orderService = dfpServices.get(session, classOf[OrderServiceInterface])

  lazy val companyService = dfpServices.get(session, classOf[CompanyServiceInterface])

  lazy val reportService = dfpServices.get(session, classOf[ReportServiceInterface])
}
