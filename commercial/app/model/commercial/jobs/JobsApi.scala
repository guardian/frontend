package model.commercial.jobs

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import org.joda.time.format.DateTimeFormat
import scala.xml.Elem
import play.api.libs.ws.WS
import conf.CommercialConfiguration

object JobsApi extends ExecutionContexts with Logging {

  private val dateFormat = DateTimeFormat.forPattern("dd/MM/yyyy HH:mm:ss")

  private def loadXml: Future[Elem] = {
    val elem = <Jobs><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735311]]></JobID><JobTitle><![CDATA[Graduate Scheme - Quantity Surveying]]></JobTitle><JobDescription><![CDATA[<p>Looking for a graduate job that delivers real responsibility from day one?</p>
<p>The BAM Graduate Development scheme - Quantity Surveying is designed for graduates who have completed a quantity surveying degree. Ideally RICS accredited. You will be either in your final year of study now or have recently completed your degree.</p>
<p>Playing an important and proactive role in our project surveying teams, the graduate scheme will provide you with a broad range of experience in your first 2 years with the company and will establish an underlying base of knowledge for your future career with BAM.</p>
<p>Focusing on your core discipline, quantity surveying, you will also have the opportunity to work in other discipline areas.&nbsp;&nbsp;</p>
<p><strong>Learning Objectives:</strong></p>
<ul>
    <li>To understand the role and responsibilities of a BAM Quantity Surveyor</li>
    <li>To develop the commercial skills needed to perform the role of a quantity surveyor and demonstrate the application of these skills</li>
    <li>To appreciate the interaction with different disciplines that is needed to undertake the role of a quantity surveyor</li>
    <li>To understand the business management systems used by BAM through work experience and attendance at workshops</li>
    <li>To provide the knowledge necessary to work safely, with consideration for others and for the environment</li>
    <li>To develop personal and managerial skills necessary to career progression</li>
    <li>&nbsp;To develop communication skills, and appreciate how to deal effectively with others</li>
</ul>
<p>We encourage our graduates to become professionally qualified. The programme is aligned to the RICS APC.</p>
<p>In addition to providing you with a wealth of guidance and support in undertaking the APC, we also pay all the fees!</p>
<p>Personal and technical skills training forms an important part of your development programme. You will be given the opportunity to attend a number of internal and external training courses, and these will contribute to your RICS professional development record.</p>
<p><strong>To succeed as a BAM Graduate you will have:</strong></p>
<ul>
    <li>A clear passion for the construction industry and a good understanding of the role of a quantity surveyor</li>
    <li>The ability to negotiate</li>
    <li>A methodical approach to your work, combined with strong numeracy skills</li>
    <li>Well-developed team working and influencing ability</li>
    <li>Enthusiasm and self-drive</li>
    <li>The ability to set high standards within a team dynamic</li>
</ul>
<p>Every effort is made to provide you with an environment that allows you to evolve both professionally and personally.</p>
<p>You will be included in BAM's staff appraisal scheme and have regular contact with a dedicated Learning and Development manager.</p>
<p>In addition to a competitive salary and benefits package, we provide a creative and considerate work environment.</p>
<p>If you share our value of doing what you say you will, to the best of your ability, every time, we want to hear from you.</p>
<p>Applicants should be available to start from September 2014.</p>
<p><strong>BAM Construct UK Ltd aims to be a diverse and inclusive organisation. We are committed to developing a workforce that reflects the diversity of our customer base and the communities in which we operate.</strong><br />
&nbsp;</p>]]></JobDescription><ShortJobDescription><![CDATA[Looking for a graduate job that delivers real responsibility from day one?
The BAM Graduate Development scheme - Quantity Surveying is designed for graduates who have completed a quantity surveying degree. Ideally RICS accredited. You will be either in yo]]></ShortJobDescription><JobRef><![CDATA[335179 2013-10-30T16:58:32.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[UK Wide]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Housing]]></Description><Description><![CDATA[Surveying]]></Description></Sector><Location><Description><![CDATA[UK]]></Description><Description><![CDATA[England]]></Description><Description><![CDATA[North West]]></Description><Description><![CDATA[South East]]></Description><Description><![CDATA[South West]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[30/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[30/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/bam-construct-uk-ltd/335179-graduate-scheme-quantity-surveying]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735311/graduate-scheme-quantity-surveying/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735311/graduate-scheme-quantity-surveying/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735310]]></JobID><JobTitle><![CDATA[Graduate Scheme - Construction Management]]></JobTitle><JobDescription><![CDATA[<p>Looking for a graduate job that delivers real responsibility from day one?</p>
<p>The BAM Graduate Development scheme - Construction Management is designed for graduates who have completed a construction management degree. Ideally CIOB accredited. You will be either in your final year of study now or have recently completed your degree.</p>
<p>Playing an important and proactive role in our site management teams, the graduate scheme will provide you with a broad range of experience in your first 2 years with the company and will establish an underlying base of knowledge for your future career with BAM.</p>
<p>Focusing on your core discipline, construction management, you will also have the opportunity to work in other discipline areas.</p>
<p><strong>Learning Objectives:</strong></p>
<ul>
    <li>To understand the role and responsibilities of site management</li>
    <li>To meet the requirements for professional membership of the CIOB via the PDP</li>
    <li>To appreciate the interaction with different disciplines that is needed to undertake a role in site management</li>
    <li>To understand the business management systems used by BAM</li>
    <li>To provide the knowledge necessary to work safely, with consideration for others and for the environment</li>
    <li>To develop personal and managerial skills necessary to career progression</li>
    <li>To develop communication skills, and appreciate how to deal effectively with others</li>
</ul>
<p>We encourage our graduates to become professionally qualified. The programme is aligned to the CIOB PDP. In addition to providing you with a wealth of guidance and support in undertaking the PDP, we also pay all the fees!</p>
<p>Personal and technical skills training forms an important part of your development programme. You will be given the opportunity to attend a number of internal and external training courses, and these will contribute to your CIOB professional development record.</p>
<p><strong>To succeed as a BAM Graduate you will have:</strong></p>
<ul>
    <li>A clear passion for the construction industry and a good understanding of the site Management function</li>
    <li>Leadership potential</li>
    <li>Well-developed team working and influencing ability</li>
    <li>Enthusiasm and self-drive</li>
    <li>The ability to set high standards within a team dynamic</li>
</ul>
<p>Every effort is made to provide you with an environment that allows you to evolve both professionally and personally.</p>
<p>You will be included in BAM's staff appraisal scheme and have regular contact with a dedicated Learning and Development manager.</p>
<p>In addition to a competitive salary and benefits package, we provide a creative and considerate work environment.</p>
<p>If you share our value of doing what you say you will, to the best of your ability, every time, we want to hear from you.</p>
<p>Applicants should be available to start from September 2014.</p>
<p><strong>BAM Construct UK Ltd aims to be a diverse and inclusive organisation. We are committed to developing a workforce that reflects the diversity of our customer base and the communities in which we operate.</strong></p>]]></JobDescription><ShortJobDescription><![CDATA[Looking for a graduate job that delivers real responsibility from day one?
The BAM Graduate Development scheme - Construction Management is designed for graduates who have completed a construction management degree. Ideally CIOB accredited. You will be ei]]></ShortJobDescription><JobRef><![CDATA[335177 2013-10-30T16:54:27.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[UK Wide]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Construction]]></Description></Sector><Location><Description><![CDATA[UK]]></Description><Description><![CDATA[England]]></Description><Description><![CDATA[North West]]></Description><Description><![CDATA[South East]]></Description><Description><![CDATA[South West]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[30/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[30/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/bam-construct-uk-ltd/335177-graduate-scheme-construction-management]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735310/graduate-scheme-construction-management/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735310/graduate-scheme-construction-management/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735306]]></JobID><JobTitle><![CDATA[Graduate Opportunities]]></JobTitle><JobDescription><![CDATA[<p>As an industry leading provider of processors for mobile and embedded devices, we provide some of the best opportunities to work on cutting edge technology, including our PowerVR graphics and video, MIPS processors and Ensigma communications.</p>
<p>We also offer opportunities in Pure which is leading the way in wireless music, radio systems and entertainment cloud services.</p>
<p>At Imagination you get the opportunity to develop specialist technical skills and contribute to driving technology into a new era. Ourhighly skilled workforce of over 1,600 people, of which 80% are qualified engineers, coupled with a relaxed and friendly atmosphere means you have the perfect environment to develop your full potential as an engineer.</p>
<p>Imagination has a range of software and hardware roles across its technology areas for graduates to apply for, which include immediate roles androles for those graduating after May next year.</p>
Requirements
<p>In general our software roles require good programming skills in C or C++ (depending on the role), along with any knowledge in the area applying for e.g. compilers, drivers, OpenGL, DSP etc.</p>
<p>Our hardware roles require good knowledge of digital ASIC design. Other desirable skills include knowledge of RTL design, VHDL/Verilog, EDA Tools and FPGA&rsquo;s.</p>
<p>Most of our roles ask for a 2.1 or higher in a related degree discipline, but some of roles only state a degree background. However we are flexible, and focus more specifically on current skills and knowledge rather than the background you have come from.</p>
Graduate Benefits
<p>The salary offered is dependent on knowledge, experience and performance at interview. Additional benefits include:</p>
<ul>
    <li>Salary reviewed twice a year, for up to the first three years</li>
    <li>Shares in the company</li>
    <li>Save As You Earn share scheme</li>
    <li>Contributory pension scheme</li>
    <li>Generous employee referral scheme</li>
    <li>Relocation assistance</li>
    <li>Bike 2 Work scheme</li>
    <li>Subsidised gym membership</li>
    <li>Subsidised canteen and Coffee bar</li>
    <li>Private medical insurance</li>
</ul>]]></JobDescription><ShortJobDescription><![CDATA[As an industry leading provider of processors for mobile and embedded devices, we provide some of the best opportunities to work on cutting edge technology, including our PowerVR graphics and video, MIPS processors and Ensigma communications.
We also offe]]></ShortJobDescription><JobRef><![CDATA[335101 2013-10-30T11:28:35.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[Locations vary - predominately in Kings Langley, but also in Bristol, Leeds and Chepstow (Wales)]]></LocationDescription><SalaryDescription><![CDATA[£28000]]></SalaryDescription><Sector><Description><![CDATA[Education]]></Description><Description><![CDATA[Secondary teaching]]></Description><Description><![CDATA[ICT & Computing]]></Description><Description><![CDATA[Schools]]></Description></Sector><Location><Description><![CDATA[UK]]></Description><Description><![CDATA[England]]></Description><Description><![CDATA[East of England]]></Description><Description><![CDATA[South West]]></Description><Description><![CDATA[Wales]]></Description></Location><SalaryRange><Description><![CDATA[£25,000 - £30,000]]></Description></SalaryRange><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[30/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[30/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/imagination-technologies/335101-graduate-opportunities]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735306/graduate-opportunities/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735306/graduate-opportunities/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735307]]></JobID><JobTitle><![CDATA[Business Graduate Programme]]></JobTitle><JobDescription><![CDATA[<p>With our innovations for energy supply, healthcare, urban infrastructures and industrial productivity, we provide answers to urgent questions of our time. That&rsquo;s why we&rsquo;re always looking for curious, open-minded people, people who dare to ask tough questions. Like every Siemens employee worldwide. People like you?</p>
<p>The Siemens Graduate Programme (SGP) offers you the ideal start to your career &ndash; your opportunity to prepare yourself for a successful career at Siemens.</p>
What does the Siemens Graduate Programme (SGP) offer me?
<ul>
    <li>The SGP is an intensive and internationally oriented two-year programme and will prepare you for future leadership tasks, offering both flexibility and diverse work experiences.</li>
    <li>The programme, which enables you to actively integrate your interests and your qualifications, consists of three challenging eight-month assignments, during which you&rsquo;ll gain familiarity with at least two functional areas in one of our Sectors, while taking on various responsibilities and project work in your assignments at home. One of these three assignments will take place abroad at one of our 1,700 international business locations. On this international rotation you&rsquo;ll learn about the local business and culture.</li>
    <li>You will also receive an intensive training programme and the opportunity for personal development.</li>
    <li>A personal mentor will be at your side for the duration of the programme, helping you to achieve your various objectives while promoting your development and assisting you in planning your career.</li>
</ul>
What do I need to qualify for this programme?
<ul>
    <li>Master or comparable degree completed with above-average grades, also PHD candidates are welcome.</li>
    <li>Achieved minimum of 2:1 in course of study within business management or administration or comparable, focusing on e.g. economics finance, marketing, management, strategy, human resources, organisational psychology etc.</li>
    <li>Significant experience of a foreign-speaking culture by way of an extended stay abroad.</li>
    <li>Fluency in English; knowledge of further languages is welcome.</li>
    <li>Open-minded, highly motivated and ready to take on challenges.</li>
    <li>Flexible, mobile and interested in working in an international and constantly changing work environment.</li>
    <li>Candidates must be immediately available to start in the New Year.</li>
</ul>
What else do I need to know?
<p>We are looking for university graduates with excellent qualifications interested in helping us shape the future of our company &ndash; individuals who are interested in making a difference in the world. If you are about to finish your studies or have recently graduated and meet our requirements, then we would be pleased to get to know you.</p>]]></JobDescription><ShortJobDescription><![CDATA[With our innovations for energy supply, healthcare, urban infrastructures and industrial productivity, we provide answers to urgent questions of our time. That&rsquo;s why we&rsquo;re always looking for curious, open-minded people, people who dare to ask ]]></ShortJobDescription><JobRef><![CDATA[335049 2013-10-30T13:17:48.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[General]]></Description></Sector><Location><Description><![CDATA[UK]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[29/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[24/11/2013 00:00:00]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/siemens/335049-business-graduate-programme]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735307/business-graduate-programme/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735307/business-graduate-programme/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735308]]></JobID><JobTitle><![CDATA[Graduate Manufacturing Engineer]]></JobTitle><JobDescription><![CDATA[<p>Siemens is a global company that employs over 400,000 people in nearly 190 countries worldwide. Siemens Magnet Technology (SMT) is the world&rsquo;s leading designer and manufacturer of superconducting magnets for MRI scanners. More than 30% of MRI scanners in hospitals worldwide have at their heart a superconducting magnet produced by Siemens Magnet Technology. Innovative Technical design, modern Manufacturing techniques and flexible Operations have ensured that SMT continues to grow despite the challenging global economic environment. Siemens Magnet Technology is part of the Healthcare sector of Siemens plc and is located in a large, modern, purpose-built factory in Oxfordshire employing a highly skilled workforce.</p>
What are my responsibilities?
<ul>
    <li>Resolution of technical issues relating to area of responsibility (line support).</li>
    <li>To develop / improve manufacturing processes &amp; quality control measures. Identify, specify, acquire and install new plant and process equipment.</li>
    <li>To proactively manage continuous improvement of the plant &amp; process to ensure Cost, Quality and Output targets are achieved. Actively support and/or run continuous improvement activities in the manufacturing area.</li>
    <li>To manage changes through the recognized change process to support business unit targets.</li>
    <li>To work with suppliers to improve process and ensure that their activities comply with SMT&rsquo;s requirements</li>
    <li>Introduce new products / processes into production through in-depth involvement with the project team to ensure they are robust and repeatable.</li>
    <li>To ensure safe working practices are in place, documented and adhered to.</li>
    <li>To be part of the team that makes SMT an acknowledged world class manufacturing company.</li>
</ul>
What do I need to qualify for this job?
<ul>
    <li>You will be graduating or graduated in an Engineering/Manufacturing subject with a 2:2 or above. Ideally a degree in Mechanical Engineering, Electrical or Electronic Engineering, or Physics.</li>
    <li>You will be able to manage your workload effectively and be able to work inclusively in a team environment.</li>
    <li>Experience of Process / Production engineering in a manufacturing environment is desirable but not essential.</li>
    <li>You will be aware of, or familiar with, modern manufacturing philosophies.</li>
</ul>
What else do I need to know?
<p>Alongside on the job training and support from more experienced members of the team you will take part in the Siemens Graduate Development Programme. This is a series of modules covering the personal skills you will need at this stage in your career.</p>]]></JobDescription><ShortJobDescription><![CDATA[Siemens is a global company that employs over 400,000 people in nearly 190 countries worldwide. Siemens Magnet Technology (SMT) is the world&rsquo;s leading designer and manufacturer of superconducting magnets for MRI scanners. More than 30% of MRI scanne]]></ShortJobDescription><JobRef><![CDATA[335113 2013-10-30T13:21:58.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[Oxford]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Education]]></Description><Description><![CDATA[Secondary teaching]]></Description><Description><![CDATA[Engineering]]></Description><Description><![CDATA[ICT & Computing]]></Description><Description><![CDATA[Schools]]></Description></Sector><Location><Description><![CDATA[UK]]></Description><Description><![CDATA[England]]></Description><Description><![CDATA[South East]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[30/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[26/11/2013 00:00:00]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/siemens/335113-graduate-manufacturing-engineer]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735308/graduate-manufacturing-engineer/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735308/graduate-manufacturing-engineer/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735309]]></JobID><JobTitle><![CDATA[Graduate Programme]]></JobTitle><JobDescription><![CDATA[<p>The best jobs are always those that rely on your sharpest skills. If you enjoy devising creative solutions to difficult problems, and want to work with colleagues who are among the smartest and brightest in their field, then we would like to hear from you.</p>
<p>From day one, you will be assigned real tasks working on the design and development of complex software or hardware. We will provide you with the support and guidance to take on challenges that will allow you to increase your knowledge and continue to progress.</p>
<p>You can develop your career in a technical role, or you can explore other paths within our flexible organisation.</p>
<p>Graduates who start after September 2014 will join on a salary of &pound;32,000 plus benefits. These include bonus plan, share plans, life insurance, pension scheme, permanent health insurance, private healthcare, up to 7 weeks holiday after your first year.</p>
<p><strong>Our package highlights:</strong></p>
<ul>
    <li>Challenging work with leading-edge technology in a financially-strong company.</li>
    <li>Flexible working conditions and a deep company-wide commitment to training and development for everyone.</li>
    <li>We accept applications from graduates and postgraduates of all degree disciplines. No experience is necessary but an interest in technology is essential.</li>
    <li>We provide subsidised accommodation in a company house at our Enfield location. We also offer company-arranged accommodation in Edinburgh, Chester, Coventry and Cambridge.</li>
    <li>We recruit all year round with no deadline.</li>
</ul>
<p>Please reference TARGETjobs when applying.</p>]]></JobDescription><ShortJobDescription><![CDATA[The best jobs are always those that rely on your sharpest skills. If you enjoy devising creative solutions to difficult problems, and want to work with colleagues who are among the smartest and brightest in their field, then we would like to hear from you]]></ShortJobDescription><JobRef><![CDATA[335163 2013-10-30T16:17:39.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[Enfield, Edinburgh, Chester, Coventry and Cambridge]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Education]]></Description><Description><![CDATA[Secondary teaching]]></Description><Description><![CDATA[Engineering]]></Description><Description><![CDATA[ICT & Computing]]></Description><Description><![CDATA[Schools]]></Description></Sector><Location><Description><![CDATA[UK]]></Description><Description><![CDATA[England]]></Description><Description><![CDATA[North West]]></Description><Description><![CDATA[Greater London]]></Description><Description><![CDATA[East of England]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[30/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[30/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/metaswitch-networks/335163-graduate-programme]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735309/graduate-programme/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735309/graduate-programme/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735298]]></JobID><JobTitle><![CDATA[Graduate Manufacturing Engineering]]></JobTitle><JobDescription><![CDATA[<p>An ever-evolving heritage. A truly exciting future. Home to two of the world&rsquo;s most iconic brands. At Jaguar Land Rover we are continually redefining the benchmark for excellence and setting the standards that others want to follow. And with increasing demand and even greater ambitions, finding the future leaders of our business has never been more important than now. That&rsquo;s where you join the journey.</p>
<p>Innovative and pioneering. Since the beginning we&rsquo;ve been committed to delivering the best manufacturing techniques in the world. Today, revolutionary technologies and innovative lean processes combine to meet our ambitious programme of new models and vehicle lines. Join our Manufacturing Engineering programme and you&rsquo;ll spend two years immersing yourself in the processes and philosophies we use to create our world-renowned vehicles, and learn how we embed quality into everything from the construction of vehicle bodies to the application of crucial finishing touches.</p>
<p>Exploring and contributing to every area of manufacturing from Production Engineering to Powertrain Engineering and Production Supervision to New Model Programmes, you&rsquo;ll help us find new ways to improve &ndash; keeping our facilities and our thinking at the forefront of the industry, and in line with our customers&rsquo; high expectations.</p>
<p>Your journey will begin with a thorough introduction to both brands, followed by carefully planned development throughout the programme. You&rsquo;ll work with industry-leading experts to develop specialist, commercial and managerial skills and you&rsquo;ll be supported to gain professional qualifications and IMechE accreditation. At every stage, we will give you the encouragement and freedom to achieve your full potential, drive your own success and make your mark on our entire operation.</p>
<p>As you&rsquo;d expect from one of the world's most revered organisations, an outstanding range of rewards and benefits await those who have the vision and drive to continue our global success &ndash; including a competitive starting salary, joining bonus, pension scheme and discounted car purchase scheme. All this and more makes Jaguar Land Rover an excellent place to start your journey and build a world-class career.</p>]]></JobDescription><ShortJobDescription><![CDATA[An ever-evolving heritage. A truly exciting future. Home to two of the world&rsquo;s most iconic brands. At Jaguar Land Rover we are continually redefining the benchmark for excellence and setting the standards that others want to follow. And with increas]]></ShortJobDescription><JobRef><![CDATA[328975 2013-10-28T09:15:15.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Engineering]]></Description></Sector><Location><Description><![CDATA[UK]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[28/10/2013 00:00:00]]></StartDateTime><EndDateTime><![CDATA[28/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/jaguar-land-rover/328975-graduate-manufacturing-engineering]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735298/graduate-manufacturing-engineering/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735298/graduate-manufacturing-engineering/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735299]]></JobID><JobTitle><![CDATA[Graduate Engineer]]></JobTitle><JobDescription><![CDATA[The work
<p>Graduate Engineers at Dstl carry out research, development and assessment roles in support of current and future equipment and systems used by UK Armed Forces. This may include: working on practical lab-based research into emerging science and technology and new techniques relevant to military applications; developing concept demonstrators; developing and testing solutions to current and future physical threats in theatre; data analysis and modelling; test and measurement, and evaluation of military systems through laboratory testing and field trials.  Graduate Engineers work with project teams from other technical areas across Dstl and with external organisations from Industry and Academia.</p>
<p>Graduate Engineers at Dstl come from a wide range of technical areas including, but not limited to, many of the engineering disciplines (Aeronautical Engineering, Aerospace Engineering, General Engineering, Mechanical Engineering, Software Engineering, Communications Engineering, RF Engineering, Electronics Engineering, Systems Engineering)</p>
<p>In addition to the general graduate engineer roles described above, further specific graduate engineer roles include:</p>
<ul>
    <li>using and developing advanced computer modelling &amp; simulation tools and techniques to evaluate military air vehicle requirements, characteristics and weapons;</li>
    <li>researching and developing pyrotechnic materials and countermeasures for the protection of in-service air platforms;</li>
    <li>evaluating weapon systems through laboratory analysis and trials;</li>
    <li>developing technologies and equipment for explosive ordnance disposal;</li>
    <li>applying electronics and radio-frequency (RF) engineering expertise to assess cyber security threats and to identify, analyse and counter cyber vulnerabilities in electronic and RF systems;</li>
    <li>applying software engineering expertise to develop tools and software designed to reduce the data mining and sifting burden of Intelligence Analysts across defence to help them identify the key elements of information and intelligence amongst large and disparate data sets;</li>
    <li>applying engineering expertise in the injury modelling area to develop and test solutions to current and future physical threats faced by the UK Armed Forces;</li>
    <li>integrating tools and methods to deliver systems advice and operational analysis support to underpin policy, procurement, operational and research decisions in the Mounted and Dismounted Close Combat domains, on issues such as: armoured vehicle and infantry lethality, protection, capacity and stowage; mobility; survivability and sustainability; load carriage; power storage and sources; and human performance, spanning the full range of UK military operations.</li>
    <li>Applying engineering expertise in the design and development of novel pyrotechnic countermeasures to evaluate materials, flight characteristics and effectiveness with techniques such as lab tests, trials, and modelling.</li>
    <li>Design, test and evaluate explosive solutions in the Explosive Ordnance Disposal area and for other specialised explosive applications including research.</li>
    <li>Providing systems engineering expertise for aircraft survivability</li>
    <li>Using modelling and measurement, understand what causes aircraft to be detected by threat sensors and develop means of countering this.</li>
</ul>
Qualifications
<p><strong>Essential</strong><br />
Minimum of Grade C in GCSE Maths and English<br />
Honours Degree at 2.2 or higher in one of the following or similar subjects:</p>
<ul>
    <li>Aeronautical Engineering</li>
    <li>Aerospace Engineering</li>
    <li>General Engineering</li>
    <li>Mechanical Engineering</li>
    <li>Software Engineering</li>
    <li>Communications Engineering</li>
    <li>RF Engineering&nbsp;</li>
    <li>Electronics Engineering</li>
    <li>Systems Engineering</li>
</ul>
<p><strong>Desirable</strong><br />
M Eng, MA, MSc or PhD in an appropriate engineering discipline or similar subject.<br />
Membership of or working towards membership of relevant professional body.<br />
&nbsp;</p>]]></JobDescription><ShortJobDescription><![CDATA[The work
Graduate Engineers at Dstl carry out research, development and assessment roles in support of current and future equipment and systems used by UK Armed Forces. This may include: working on practical lab-based research into emerging science and te]]></ShortJobDescription><JobRef><![CDATA[331031 2013-10-28T09:25:02.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Finance & Accounting]]></Description><Description><![CDATA[Financial services]]></Description></Sector><Location><Description><![CDATA[UK]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[03/10/2013 00:03:00]]></StartDateTime><EndDateTime><![CDATA[03/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/dstl/331031-graduate-engineer]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735299/graduate-engineer/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735299/graduate-engineer/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735300]]></JobID><JobTitle><![CDATA[Electrical and Electronic Engineering Graduate Programme]]></JobTitle><JobDescription><![CDATA[<p>Salary: &pound;26,500 + any regional allowances + &pound;2,000 welcome bonus</p>
<p><strong>Life&rsquo;s too short to play it small<br />
Go BIG</strong></p>
<p>If you&rsquo;re interested in electrical and electronic engineering, opportunities don&rsquo;t get much bigger than this. We&rsquo;re the single largest consumer of electricity in the UK &ndash; and have an electrical asset base equivalent in size and value to the UK&rsquo;s biggest electricity utilities.</p>
Accelerating the future with state-of-the-art technology
<p>From the smallest signal readjustment to the rollout of our multi-million-pound electrification programmes, you&rsquo;ll face exciting challenges in our Electrical Engineering team. As the power behind the growth of the railway, you&rsquo;ll work with cutting-edge technology, delivering innovation that is fundamental to our future success and to the economic success of Britain.</p>
<p>Support to gain chartered status<br />
You&rsquo;ll work with technical experts on rail electrification, signalling and telecommunications, gaining a breadth of experience and a mixture of management and technical training. You&rsquo;ll also be mentored by our experienced engineers to help you achieve your chartered engineer status.</p>
<p>Benefit Britain&rsquo;s rail infrastructure and yourself <br />
The rewards are immense, including a &pound;2,000 welcome bonus, 28 days&rsquo; holiday and public holidays, a 75% discount on season tickets (up to &pound;2,250) and an interest-free season ticket loan (up to &pound;5,000).</p>
<p>Ready to go BIG?<br />
You must achieve at least a 2:1 in a degree accredited by IET (the Institution of Engineering and Technology) and be flexible about relocating as your placements may be throughout Britain.</p>]]></JobDescription><ShortJobDescription><![CDATA[Salary: &pound;26,500 + any regional allowances + &pound;2,000 welcome bonus
Life&rsquo;s too short to play it small
Go BIG
If you&rsquo;re interested in electrical and electronic engineering, opportunities don&rsquo;t get much bigger than this. We&rsquo;]]></ShortJobDescription><JobRef><![CDATA[330405 2013-10-28T11:21:28.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[]]></LocationDescription><SalaryDescription><![CDATA[any regional allowances + £2,000 welcome bonus]]></SalaryDescription><Sector><Description><![CDATA[Engineering]]></Description></Sector><Location><Description><![CDATA[UK]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[03/10/2013 00:03:00]]></StartDateTime><EndDateTime><![CDATA[03/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/network-rail/330405-electrical-and-electronic-engineering-graduate-programme]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735300/electrical-and-electronic-engineering-graduate-programme/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735300/electrical-and-electronic-engineering-graduate-programme/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job><Job><ClientName><![CDATA[TARGETJOBS.CO.UK]]></ClientName><JobID><![CDATA[4735301]]></JobID><JobTitle><![CDATA[UK Analyst Technology Program]]></JobTitle><JobDescription><![CDATA[<p>Mitsubishi UFJ Securities is the investment banking business of Mitsubishi UFJ Financial Group, one of the world&rsquo;s largest financial institutions. And technology sits at the heart of our on-going global success.</p>
<p>That&rsquo;s why it&rsquo;s crucial that you understand our industry and our business, so during this program, you&rsquo;ll receive a business induction and classroom training, as well as learn about the core technologies used in the finance industry. You&rsquo;ll also take two rotations within different IT areas &ndash; giving you real objectives and real work. And you&rsquo;ll get to study for professional qualifications at the same time.</p>
<p>To apply, you&rsquo;ll need to be in your final year of study with a predicted 2.1 in any degree discipline. You&rsquo;ll also need to be eligible to work in the UK. A passion for IT, plenty of ambition and a desire to get noticed for all the right reasons will be essentials too &ndash; because on our small team, you&rsquo;ll be part of big projects from the very start.</p>
<p>Discover a better balance in banking and apply now!</p>]]></JobDescription><ShortJobDescription><![CDATA[Mitsubishi UFJ Securities is the investment banking business of Mitsubishi UFJ Financial Group, one of the world&rsquo;s largest financial institutions. And technology sits at the heart of our on-going global success.
That&rsquo;s why it&rsquo;s crucial t]]></ShortJobDescription><JobRef><![CDATA[328925 2013-10-28T16:36:36.000Z]]></JobRef><JobPostCode><![CDATA[]]></JobPostCode><LocationDescription><![CDATA[]]></LocationDescription><SalaryDescription><![CDATA[Competitive]]></SalaryDescription><Sector><Description><![CDATA[Education]]></Description><Description><![CDATA[Secondary teaching]]></Description><Description><![CDATA[ICT & Computing]]></Description><Description><![CDATA[Schools]]></Description></Sector><Location><Description><![CDATA[UK]]></Description></Location><SalaryRange /><PositionType><![CDATA[Permanent]]></PositionType><Hours><![CDATA[Full Time]]></Hours><StartDateTime><![CDATA[03/10/2013 00:03:00]]></StartDateTime><EndDateTime><![CDATA[03/11/2013 23:59:59]]></EndDateTime><ContactTitle><![CDATA[]]></ContactTitle><ContactFirstName><![CDATA[]]></ContactFirstName><ContactLastName><![CDATA[]]></ContactLastName><Address1><![CDATA[]]></Address1><Address2><![CDATA[]]></Address2><Address3><![CDATA[]]></Address3><CityTown><![CDATA[]]></CityTown><County><![CDATA[]]></County><PostCode><![CDATA[]]></PostCode><Country><![CDATA[]]></Country><Email><![CDATA[]]></Email><Telephone><![CDATA[]]></Telephone><Fax><![CDATA[]]></Fax><ApplicationMethod><![CDATA[ExternalRedirect]]></ApplicationMethod><PreferredApplicationMethod><![CDATA[ExternalRedirect]]></PreferredApplicationMethod><ExternalApplicationURL><![CDATA[http://targetjobs.co.uk/employer-hubs/mitsubishi-ufj-securities/328925-uk-analyst-technology-program]]></ExternalApplicationURL><AdType><![CDATA[Graduate scheme]]></AdType><JobListingURL><![CDATA[http://jobs.theguardian.com/job/4735301/uk-analyst-technology-program/?TrackID=554176]]></JobListingURL><ApplyURL><![CDATA[http://jobs.theguardian.com/apply/4735301/uk-analyst-technology-program/?TrackID=554176]]></ApplyURL><IsPremium><![CDATA[false]]></IsPremium><RecruiterLogoURL><![CDATA[]]></RecruiterLogoURL><EmployerLogoURL><![CDATA[]]></EmployerLogoURL><SecondLogoURL><![CDATA[]]></SecondLogoURL></Job>
    </Jobs>

    Future(elem)

//    def buildUrl: Option[String] = {
//      for {
//        url <- CommercialConfiguration.jobsApi.url
//        key <- CommercialConfiguration.jobsApi.key
//      } yield s"$url?login=$key"
//    }
//
//    buildUrl map {
//      WS.url(_) withRequestTimeout 60000 get() map {
//        response => response.xml
//      }
//    } getOrElse {
//      log.error("No Jobs API config properties set")
//      Future(<jobs/>)
//    }
  }

  private def getAllJobs(xml: => Future[Elem] = loadXml): Future[Seq[Job]] = {

    log.info("Loading job ads...")

    val jobs = xml map {
      jobs => (jobs \ "Job") map {
        job =>
          Job(
            (job \ "JobID").text.toInt,
            (job \ "AdType").text,
            dateFormat.parseDateTime((job \ "StartDateTime").text),
            dateFormat.parseDateTime((job \ "EndDateTime").text),
            (job \ "IsPremium").text.toBoolean,
            (job \ "PositionType").text,
            (job \ "JobTitle").text,
            (job \ "ShortJobDescription").text,
            (job \ "SalaryDescription").text,
            OptString((job \ "LocationDescription").text),
            OptString((job \ "RecruiterLogoURL").text),
            OptString((job \ "EmployerLogoURL").text),
            (job \ "JobListingURL").text,
            (job \ "ApplyURL").text,
            ((job \ "Sector" \ "Description") map (_.text)).distinct,
            (job \ "Location" \ "Description") map (_.text)
          )
      }
    }

    for (loadedJobs <- jobs) log.info(s"Loaded ${loadedJobs.size} job ads")

    jobs
  }

  def getCurrentJobs(xml: => Future[Elem] = loadXml): Future[Seq[Job]] = {
    getAllJobs(xml) map (_ filter (_.isCurrent))
  }

}

object OptString {
  def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
}
