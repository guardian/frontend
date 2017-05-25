package commercial.campaigns

import org.joda.time.DateTime

// The PI campaign will run for one year, during which all the related pages must provide a sticky
// banner at the top that sticks all the way through, therefore overriding other config flags
// such as isPaidContent

object PersonalInvestmentsCampaign {
    lazy val endDate = new DateTime(2017, 4, 26, 0, 0)

    def isRunning(keywordIds: Seq[String]): Boolean = keywordIds.exists(t => t.endsWith("/personal-investments")) &&
        DateTime.now().isBefore(endDate)
}
