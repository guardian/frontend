# Sign In Gate Test

All sign in gate AB tests and designs should be logged in the Sign In Gate Variants Directory spreadsheet in the Identity team drive.

AB tests runs should also be added to the Identity calendar.

## Running a new test
When making changes to a test, for example adding a new variant, it is worth modifying the id of the test to seperate it out from the previous test.

To do this you have to modify a few files files:
1. in `static/src/javascripts/projects/common/modules/experiments/tests/sign-in-gate.js` change the `id` parameter of the test
2. in `common/app/conf/switches/ABTestSwitches.scala`, under the switch for the sign in gate, change the first parameter by turning the id in the file above into a kebab-case string with `ab-` appended at the front, e.g. `SignInGateTertius` would turn into `ab-sign-in-gate-tertius`
3. finally in `static/src/javascripts/projects/common/modules/identity/sign-in-gate/sign-in-gate.spec.js` update the `common/modules/experiments/ab` mock to reflect the new test too

## Adding Variants

1. Add the new variant to the sign in gate ab test definition in the `concurrentTests` array: `static/src/javascripts/projects/common/modules/experiments/ab-tests.js`
2. Clone the `example.js` file in the `./variants` folder, have the name of the file reflect the variant name, e.g. `control.js`.
3. Modify this file to reflect the new variant information.
    - First define the variant name, by changing `example` in `const name = 'example'` to the new variant name
    - Next change the `htmlTemplate` method to return the new template for the variant
    - Then modify the `canShow` method, this method determines if the test can be shown on that page view for that variant
    - After modify the `show` method to run anything thats needed to get the gate to show, e.g. setting the template, adding click handlers etc.
    - Finally export a `SignInGateVariant` type, which is an object that exports `name`, `canShow`, and `show`.
4. Import this object in `./variants/index.js`, and add it to the export `tests` array. From this point on the variant will be able to be used.

## Styling the gate

CSS for the gate lives at `static/src/stylesheets/module/identity/_sign-in-gate.scss`, modify or add anything here.
