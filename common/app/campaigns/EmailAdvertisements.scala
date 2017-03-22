package campaigns

import layout.{LiveIntentMarquee, LiveIntentSafeRTB}

object EmailAdvertisements {

  val guardianTodayUs = "email/us/daily"

  val marquee = Map(
    guardianTodayUs -> LiveIntentMarquee(
      newsletterId = guardianTodayUs.replace("/", "-"),
      ids = ("226945", "226946", "226947", "226948", "226949")
    )
  )

  val safeRtb = Map(
    guardianTodayUs -> LiveIntentSafeRTB(
      newsletterId = guardianTodayUs.replace("/", "-"),
      ids = (124760900 to 124760919).map(_.toString).toList
    )
  )
}
