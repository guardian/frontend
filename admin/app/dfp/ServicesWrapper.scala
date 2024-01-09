package dfp

import com.google.api.ads.admanager.axis.factory.AdManagerServices
import com.google.api.ads.admanager.axis.v202308._
import com.google.api.ads.admanager.lib.client.AdManagerSession

private[dfp] class ServicesWrapper(session: AdManagerSession) {

  private val dfpServices = new AdManagerServices

  lazy val lineItemService: LineItemServiceInterface = dfpServices.get(session, classOf[LineItemServiceInterface])

  lazy val licaService: LineItemCreativeAssociationServiceInterface =
    dfpServices.get(session, classOf[LineItemCreativeAssociationServiceInterface])

  lazy val customFieldsService: CustomFieldServiceInterface =
    dfpServices.get(session, classOf[CustomFieldServiceInterface])

  lazy val customTargetingService: CustomTargetingServiceInterface =
    dfpServices.get(session, classOf[CustomTargetingServiceInterface])

  lazy val inventoryService: InventoryServiceInterface = dfpServices.get(session, classOf[InventoryServiceInterface])

  lazy val suggestedAdUnitService: SuggestedAdUnitServiceInterface =
    dfpServices.get(session, classOf[SuggestedAdUnitServiceInterface])

  lazy val placementService: PlacementServiceInterface = dfpServices.get(session, classOf[PlacementServiceInterface])

  lazy val creativeTemplateService: CreativeTemplateServiceInterface =
    dfpServices.get(session, classOf[CreativeTemplateServiceInterface])

  lazy val creativeService: CreativeServiceInterface = dfpServices.get(session, classOf[CreativeServiceInterface])

  lazy val networkService: NetworkServiceInterface = dfpServices.get(session, classOf[NetworkServiceInterface])

  lazy val orderService: OrderServiceInterface = dfpServices.get(session, classOf[OrderServiceInterface])

  lazy val companyService: CompanyServiceInterface = dfpServices.get(session, classOf[CompanyServiceInterface])

  lazy val reportService: ReportServiceInterface = dfpServices.get(session, classOf[ReportServiceInterface])
}
