package model.commercial.jobs

import org.scalatest.{Matchers, FlatSpec}

class JobTest extends FlatSpec with Matchers {

  "mainIndustry" should "give a value for jobs" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, None, Seq(218), "Competitive")

    job.mainIndustry should be(Some("Legal"))
  }

  "mainIndustry" should "not give a value for jobs without an industry sector" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, None, Nil, "Competitive")

    job.mainIndustry should be(None)
  }

  "mainIndustry" should "respect the industry order" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, None, Seq(124, 111, 101), "Competitive")

    job.mainIndustry should be(Some("Arts & heritage"))
  }

  "shortSalaryDescription" should "be in correct format" in {
    val job1 =
      Job(1, "title", "desc", None, "recruiter", None, None, Seq(124, 111, 101), "Unpaid Voluntary Work")
    val job2 =
      Job(2, "title", "desc", None, "recruiter", None, None, Seq(124, 111, 101), "Unpaid Voluntary Work Without Bonus")

    job1.shortSalaryDescription should be("Unpaid Voluntary Work")
    job2.shortSalaryDescription should be("Unpaid Voluntary Work …")
  }
}
