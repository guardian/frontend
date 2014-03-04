package exacttarget


case class DataExtId(businessUnitId: String, customerKey: String)

case class SubscriptionDef(dataExtension: DataExtId, parameters: Map[String, String])

object SubscriptionDef {
  val liveBetter= DataExtId(businessUnitId="1058977", customerKey="1806")

  val liveBetterSubDefs =
    (1 to 7).map(n => s"lb$n" -> SubscriptionDef(liveBetter, Map(s"LB_Chal_$n" -> "true"))).toMap
  
  val All: Map[String, SubscriptionDef] = liveBetterSubDefs
}