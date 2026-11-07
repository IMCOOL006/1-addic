# game-tutorials contract (V3) - base f69bc68a

Hook attribute: data-test for SCREENS hooks, data-tour for tour targets (tests-docs writes against this; tid() is [data-testid] for CORE hooks only).

## Relied on
- Actions.useSkill({skillId, helpful}) -> {ok, event}; refusal returns {ok:false}, never throws. WAITS for actions-sos V-08a (absent at base; actions.js:255 VERB_OWNED refuses recordEvent('SkillUsed'); validators :150, :277-280). Consumer: ui-tools.js helpedRow (:307).
- Engine.newDots(view) -> Set of feature ids (engine.js:603). Actions.reveal(id, {seen:true}) clears a dot. Actions.tutorial.done(id, {skipped?}).
- Content.features.status = {name, gist, route:'#/status'}; Content.tutorials: tour step {target:'status-open', text} and {id:'status', kind:'jit', feature:'status', steps}; Content.reveal lists 'status' with the Harbor. WAITS for content V-10.
- data-tour="status-open" on the Today chip, with GuidanceUI.dot('status', ctx) beside it. WAITS for today-track V-01b. Shell targets exist (shell.html:14-20, ui-core.js:20-26).

## Exposed (GuidanceUI, ui-guidance.js; all exist at base, changes marked)
- coach(id, {replay}) -> Promise<'done'|'skipped'|'aborted'> (:378). CHANGE V-21: a kind 'tour' resolves 'aborted' when the route leaves Today; marks nothing. Consumers: workbook-settings (Training), tests-docs.
- replayTour(); isOpen(); maybeTour(ctx); training() -> [{id,name,route,kind}]: unchanged.
- featureOfRoute(path) -> featureId|null. CHANGE V-28: '/status' -> 'status'. Consumers: afterRender, jitFor.
- jitFor({path, revealed:Set, isDone, asked, today}) -> tutorial|null (:161): offers the status JIT once on first open. Consumer: none yet.
- dot(featureId, ctx) -> span.dot.gt-dot[data-test=new-dot][data-feature=<id>] "New", or null (:559). Consumer: today-track V-01b.
- UI.tour.start(id) returns undefined (v1 FIX-TOUR): unchanged.

## DOM hooks
None new. Existing: new-dot, jit-bar, jit-show, jit-later, coach-overlay, game-helped, game-helped-yes, game-helped-no (ui-tools.js:310, :318-319), game-card, game-panel. Tour targets used by browser tests: status-open (today-track), sos-button, nav-*.

## Events
SkillUsed {skillId, helpful} is written by Actions.useSkill (not this lane). TutorialCompleted by Actions.tutorial.done on done/skipped; none on aborted.

## Routes
None added. #/status is today-track's UI.pages.status (ui-status.js).
