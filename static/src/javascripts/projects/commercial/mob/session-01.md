# Let’s mob!
## 30 Jul 30 2021

Present today
- @chrislomaxjones
- @MarSavar
- @mxdvl
- @zekehuntergreen
- @arelra

## Purpose

- Add comments straight in the code
- Find candidates for `amIUsed` and start tracking usage.
- Make link to historic PRs to understand decisions

## Discoveries

The reason there are two commercial modules folders is because one isn’t loaded
if the `commercial` switch is off. This seems like a very premature optimisation
for a rare event. Commercial logic should always be loaded, and only use the
switch logic to prevent initialising further code.

## Actions taken

We will identify all the common/commercial/*.(ts|js) files use outside of the
commercial bundle, and identified this as comments in the code.

### https://github.com/guardian/frontend/pull/24047

## Next steps

- Create cards from above?
