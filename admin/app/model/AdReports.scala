package model

import dfp.Sponsorship
import org.joda.time.DateTime

object AdReports {

  private var advertisementTags: Report = Report(Nil, rightNow)

  private var sponsorshipTags: Report = Report(Nil, rightNow)

  def rightNow = new DateTime()

  def updateAdvertisementTags(adSponsorships: Seq[Sponsorship]) = {
    this.advertisementTags = Report(adSponsorships, rightNow)
  }
  
  def getAdvertisementTags = advertisementTags

  def updateSponsoredTags(contentSponsorships: Seq[Sponsorship]) {
    this.sponsorshipTags = Report(contentSponsorships, rightNow)
  }

  def getSponsoredTags = sponsorshipTags
}

case class Report(sponsorships: Seq[Sponsorship], timestamp: DateTime)
