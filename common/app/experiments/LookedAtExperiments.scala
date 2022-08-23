package experiments

import play.api.libs.typedmap.TypedKey
import play.api.mvc.RequestHeader
import scala.collection.JavaConverters._
import java.util.concurrent.ConcurrentHashMap

object LookedAtExperiments {

  type ExperimentsHashMap = ConcurrentHashMap[Experiment, Unit]

  private val attrKey: TypedKey[ConcurrentHashMap[Experiment, Unit]] =
    TypedKey[ExperimentsHashMap]("lookedAtExperiments")

  def createRequest(request: RequestHeader): RequestHeader =
    request.addAttr(attrKey, new ExperimentsHashMap) // Attach an empty mutable hashmap to a request and return it

  def addExperiment(newExperiment: Experiment)(implicit request: RequestHeader): Unit =
    request.attrs.get(attrKey).foreach(_.put(newExperiment, ()))

  def forRequest(request: RequestHeader): Set[Experiment] =
    request.attrs.get(attrKey).map(_.asScala.keySet.toSet).getOrElse(Set())
}
