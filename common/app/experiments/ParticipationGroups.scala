package experiments

import enumeratum.EnumEntry
import scala.collection.immutable

sealed abstract class ParticipationGroup(val headerName: String) extends EnumEntry {
  override def toString: String = headerName

  val percentage = headerName match {
    case s"X-GU-Experiment-${percNo}perc-${_}" => percNo
    case _                                     => "unknown"
  }
}

object ParticipationGroups extends enumeratum.Enum[ParticipationGroup] {
  // Name of the header are defined and hard-coded in Fastly VCL to be assigned
  // to the correct proportion of traffic reflected by the name
  case object Perc0A extends ParticipationGroup("X-GU-Experiment-0perc-A")
  case object Perc0B extends ParticipationGroup("X-GU-Experiment-0perc-B")
  case object Perc0C extends ParticipationGroup("X-GU-Experiment-0perc-C")
  case object Perc0D extends ParticipationGroup("X-GU-Experiment-0perc-D")
  case object Perc0E extends ParticipationGroup("X-GU-Experiment-0perc-E")
  case object Perc1A extends ParticipationGroup("X-GU-Experiment-1perc-A")
  case object Perc1B extends ParticipationGroup("X-GU-Experiment-1perc-B")
  case object Perc1C extends ParticipationGroup("X-GU-Experiment-1perc-C")
  case object Perc1D extends ParticipationGroup("X-GU-Experiment-1perc-D")
  case object Perc1E extends ParticipationGroup("X-GU-Experiment-1perc-E")
  case object Perc2A extends ParticipationGroup("X-GU-Experiment-2perc-A")
  case object Perc2B extends ParticipationGroup("X-GU-Experiment-2perc-B")
  case object Perc2C extends ParticipationGroup("X-GU-Experiment-2perc-C")
  case object Perc2D extends ParticipationGroup("X-GU-Experiment-2perc-D")
  case object Perc2E extends ParticipationGroup("X-GU-Experiment-2perc-E")
  case object Perc5A extends ParticipationGroup("X-GU-Experiment-5perc-A")
  case object Perc10A extends ParticipationGroup("X-GU-Experiment-10perc-A")
  case object Perc20A extends ParticipationGroup("X-GU-Experiment-20perc-A")
  case object Perc50 extends ParticipationGroup("X-GU-Experiment-50perc")
  case object TLSSupport extends ParticipationGroup("X-GU-old-tls-traffic")
  override val values: immutable.IndexedSeq[ParticipationGroup] = findValues

}
