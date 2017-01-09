# Working with emails


## Sign up forms in iframes

The email sign up forms include the Guardian Today footer, and the iframe embeds used by editorial in Composer. They are also used in the email sign up interactive atoms, examples [here](https://www.theguardian.com/info/ng-interactive/2016/dec/07/sign-up-for-the-flyer) and [here](https://www.theguardian.com/info/ng-interactive/2016/dec/05/sign-up-for-weekend-reading).

They live in routes like this: `www.theguardian.com/email/form/<type>/<listID>`

The form **type** can be article, footer, plain, plaintone, or plaindark:
- [article](https://www.theguardian.com/email/form/article/37) >> Commonly used as embed in articles (example here). Button defaults to blue but tone overrides can be applied.
- [footer](https://www.theguardian.com/email/form/footer/37) >> This is the one used in the footer on every page.
- [plain](https://www.theguardian.com/email/form/plain/37) >> No header or description. Button will always be guardian-brand blue
- [plaintone](https://www.theguardian.com/email/form/plaintone/3743) >> No header or description. Submit button splits from input on widescreen. Button defaults to blue but tone overrides can be applied. Used in [email interactives](https://www.theguardian.com/info/ng-interactive/2016/dec/07/sign-up-for-the-flyer).
- [plaindark](https://www.theguardian.com/email/form/plaindark/3745) Used by [Documentaries](https://www.theguardian.com/world/ng-interactive/2016/oct/14/desert-fire-the-world-cup-rebels-of-kurdistan-video). Deprecated in favour of plaintone (which has a [dark option](http://localhost:9000/email/form/plaintone/3745)) and potentially removable, however, only if all usages can be found.

The **listID** is the primary key of the email in [ExactTarget](https://www.marketingcloud.com/products/email-marketing/). Editorial should know the listID. Any tone applied to the form will be determined by the listID (see later section).

When the form is submitted, the email address will be passed through [Identity](https://github.com/guardian/identity) to ExactTarget, along with the ListID.

N.B. For email sign ups to work, the listID must be set up in ExactTarget by Editorial

## Dynamic email sign up forms

These are injected by JavaScript into all articles within a tag, so long as the [global run checks](https://docs.google.com/document/d/1RkNCBg_ekfocuHsQOozW_jy21JDGH_BZnIKOE3mX95s/edit) are true.

1) Add a new list config in [**email-article.js**](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/email/email-article.js). The lists are in order of priority, so you probably want to add yours before the Guardian Today.

2) Add a [run-check](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/email/run-checks.js#L96) for your email sign up in the `canRunList`.

3) Add the section to the [blanket blacklist](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/email/run-checks.js#L37) to ensure that the Guardian Today never runs on the section you're adding the dynamic sign up to. (Optional)

N.B. When testing, the sign-up will only show if it passes all the global run checks which includes only showing an email sign-up once per session, so you will probably need to clear out your session storage each time you test (or flip that to always pass).

## The email preferences centre and the newsletters page

The [email preferences centre](https://profile.theguardian.com/email-prefs) and the [email newsletters page](https://www.theguardian.com/email-newsletters) both pull data from [**EmailSubscriptions.scala**](https://github.com/guardian/frontend/blob/master/common/app/model/EmailSubscriptions.scala)

The email newsletters page does not use iframed forms

#### Adding, removing or otherwise altering the emails listed

When adding a new `EmailSubscription`:

- theme >> Section of the email preferences page that this email will appear in
- teaser >> Short (~120 char) description used on the newsletters page
- description >> Longer description used on the email preferences page
- frequency >> Text that appears next to the clock icon
- subheading >> Currently used for the region specific emails (UK, AUS, US)
- tone >> Determines the tone colours of the card on the newsletters page
- imageFilename >> Placeholder for when we add an image to each card (WIP)


## Adding colour and tones to the email sign up forms

1) In the [**EmailSignupController.scala**](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/email/EmailSignupController.scala) add an email name to `ListIds`, and assign it the value of the listID.

2) Within  [**emailSignUp.scala.html**](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/email/signup/emailSignUp.scala.html) map the email name to a tone in `listIdTones`

## Email sign up atoms

These interactives have their [own repo](https://github.com/guardian/interactive-email-signups) and readme.


## Writing a new email sign up form

If you are adding a custom email sign up form somewhere, you will want to POST an email address and listID to https://www.theguardian.com/email.

An example implementation of this can be found in  [**newsletters.scala.html**](https://github.com/guardian/frontend/blob/master/applications/app/views/signup/newsletters.scala.html#L74).

### How to do email address validation

1) Don't use regular expressions to validate email addresses:
- http://nullprogram.com/blog/2008/12/24/
- https://davidcel.is/posts/stop-validating-email-addresses-with-regex/
- http://www.ex-parrot.com/~pdw/Mail-RFC822-Address.html

2) If you want to provide some helpful feedback to the user, just check the address has at least one `@`

```
function validate(form) {
  var emailAddress = $('.' + classes.textInput, form).val();
  return typeof emailAddress === 'string' &&
  emailAddress.indexOf('@') > -1;
}
```

3) Let the browser support validation efforts; some browsers support `type="email"` on inputs:
- https://davidwalsh.name/html5-email

4) If all else fails, ExactTarget has checks in place for valid emails and also cleans the lists.
