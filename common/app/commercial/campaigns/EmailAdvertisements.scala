package commercial.campaigns

import layout.{LiveIntentMPU, LiveIntentSafeRTB}

object EmailAdvertisements {

  val guardianTodayUs = "email/us/daily"

  val mpu = Map(
    guardianTodayUs -> LiveIntentMPU(
      newsletterId = guardianTodayUs.replace("/", "-"),
      ids = ("228579", "228580", "228581", "108656", "108657"),
    ),
  )

  val safeRtb = Map(
    guardianTodayUs -> LiveIntentSafeRTB(
      newsletterId = guardianTodayUs.replace("/", "-"),
      ids = (123626500 to 123626519).map(_.toString).toList,
    ),
  )
}
