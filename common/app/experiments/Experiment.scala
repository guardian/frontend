package experiments

import conf.switches.{Owner, Switch, SwitchGroup}
import conf.switches.Switches.ServerSideExperiments
import java.time.LocalDate
import play.api.mvc.RequestHeader

abstract case class Experiment(
    name: String,
    description: String,
    owners: Seq[Owner],
    sellByDate: LocalDate,
    participationGroup: ParticipationGroup,
) {
  val switch: Switch = Switch(
    SwitchGroup.ServerSideExperiments,
    name,
    description,
    owners,
    conf.switches.Off,
    sellByDate,
    exposeClientSide = true,
  )

  sealed abstract class ExperimentValue(val value: String)
  case object variantValue extends ExperimentValue("variant")
  case object controlValue extends ExperimentValue("control")
  case object unknownValue extends ExperimentValue("unknown")

  private def isSwitchedOn: Boolean = switch.isSwitchedOn && ServerSideExperiments.isSwitchedOn

  private def checkHeader(headerName: String, predicate: String => Boolean)(implicit request: RequestHeader): Boolean =
    request.headers
      .get(headerName)
      .map(predicate)
      .getOrElse(false)

  private def inVariant(implicit request: RequestHeader): Boolean =
    checkHeader(participationGroup.headerName, _ == variantValue.value)
  private def inControl(implicit request: RequestHeader): Boolean =
    checkHeader(participationGroup.headerName, _ == controlValue.value)
  private def matchesExtraHeader(implicit requestHeader: RequestHeader): Boolean =
    extraHeader.map(h => checkHeader(h.key, _ == h.value)).getOrElse(true)

  def canRun(implicit request: RequestHeader): Boolean = isSwitchedOn && priorCondition && matchesExtraHeader

  def isParticipating[A](implicit request: RequestHeader, canCheck: CanCheckExperiment): Boolean =
    canRun && inVariant

  def isControl[A](implicit request: RequestHeader, canCheck: CanCheckExperiment): Boolean = canRun && inControl
  def value(implicit request: RequestHeader, canCheck: CanCheckExperiment): String = {
    val experimentValue = if (isParticipating) variantValue else if (isControl) controlValue else unknownValue
    experimentValue.value
  }

  def priorCondition(implicit request: RequestHeader): Boolean =
    true // Can be overridden by experiments that requires some additional conditions to be true for the test to run
  val extraHeader: Option[ExperimentHeader] =
    None // Can be overriden by experiments that requires another header for a request to participate in the test

}

case class ExperimentHeader(key: String, value: String)
