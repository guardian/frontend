package commercial.model.merchandise.jobs

import commercial.model.merchandise.Job
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers
import test.ConfiguredTestSuite

@DoNotDiscover class JobTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "mainIndustry" should "give a value for jobs" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, "logo", Seq(218), "Unpaid Voluntary Work")

    job.mainIndustry should be(Some("Legal"))
  }

  "mainIndustry" should "not give a value for jobs without an industry sector" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, "logo", Nil, "Unpaid Voluntary Work")

    job.mainIndustry should be(None)
  }

  "mainIndustry" should "respect the industry order" in {
    val job = Job(1, "title", "desc", None, "recruiter", None, "logo", Seq(124, 111, 101), "Unpaid Voluntary Work")

    job.mainIndustry should be(Some("Arts & heritage"))
  }

  "shortSalaryDescription" should "be in correct format" in {
    val job1 =
      Job(1, "title", "desc", None, "recruiter", None, "logo", Seq(124, 111, 101), "Unpaid Voluntary Work")
    val job2 =
      Job(
        2,
        "title",
        "desc",
        None,
        "recruiter",
        None,
        "logo",
        Seq(124, 111, 101),
        "Unpaid Voluntary Work Without Bonus",
      )

    job1.shortSalaryDescription should be("Unpaid Voluntary Work")
    job2.shortSalaryDescription should be("Unpaid Voluntary Work …")
  }
}
