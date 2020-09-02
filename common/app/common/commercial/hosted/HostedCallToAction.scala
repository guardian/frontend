package common.commercial.hosted

import com.gu.contentatom.thrift.{Atom, AtomData}

case class HostedCallToAction(
    url: String,
    image: Option[String],
    label: Option[String],
    trackingCode: Option[String],
    btnText: Option[String],
)

object HostedCallToAction {

  def fromAtom(ctaAtom: Atom): HostedCallToAction = {
    val cta = ctaAtom.data.asInstanceOf[AtomData.Cta].cta
    HostedCallToAction(
      url = cta.url,
      image = cta.backgroundImage,
      label = cta.label,
      trackingCode = cta.trackingCode,
      btnText = cta.btnText,
    )
  }
}
