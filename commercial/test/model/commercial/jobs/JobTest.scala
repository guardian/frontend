package model.commercial.jobs

import org.scalatest.{Matchers, FlatSpec}

class JobTest extends FlatSpec with Matchers {

  "mainIndustry" should "give a value for non-general jobs" in {
    val job = Job(1, "title", "desc", "recruiter", None, Seq(218))

    job.mainIndustry should be(Some("Legal"))
  }

  "mainIndustry" should "not give a value for jobs without an industry sector" in {
    val job = Job(1, "title", "desc", "recruiter", None, Nil)

    job.mainIndustry should be(None)
  }

  "mainIndustry" should "not give a value for general jobs" in {
    val job = Job(1, "title", "desc", "recruiter", None, Seq(158))

    job.mainIndustry should be(None)
  }
}
