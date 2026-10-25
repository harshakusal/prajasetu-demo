import sys, re
from playwright.sync_api import sync_playwright, expect
BASE = sys.argv[1]; SHOTS = '/workspace/prajasetu-demo/screenshots/'
res = []
def ok(name, cond=True):
    res.append((name, bool(cond))); print(('PASS ' if cond else 'FAIL ') + name, flush=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1440, 'height': 900})
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.add_init_script("window.__printed=0; window.print=()=>{window.__printed++}")
    pg.goto(BASE); pg.get_by_test_id('start-demo').wait_for(); pg.wait_for_timeout(1200)
    ok('desktop loads command centre', pg.locator('h1').first.inner_text().startswith('One Constituency'))
    ok('demo banner visible', pg.get_by_test_id('demo-banner').is_visible())
    pg.screenshot(path=SHOTS + 'command-centre-desktop.png', full_page=True)
    # navigation
    for label, h in [('Village 360°', 'Village 360°'), ("People's Issues", "People's Issues"), ('Development Tracker', 'Development Tracker'), ('Scheme Assistance', 'Scheme Assistance'), ('Field Operations', 'Field Operations'), ('Public Impact Report', 'Public Impact Report'), ('Settings', 'Settings'), ('Command Centre', None)]:
        pg.locator('aside').get_by_role('link', name=label).click(); pg.wait_for_timeout(300)
        ok(f'nav {label}', (h is None and 'Start MLA Demo' in pg.content()) or (h and pg.locator('h1').first.inner_text() == h))
    # global search
    pg.get_by_label('Global search').fill('Ammapalem'); pg.wait_for_timeout(200)
    ok('global search results', pg.get_by_test_id('search-results').get_by_role('option').count() > 0)
    pg.get_by_test_id('search-results').get_by_role('option').first.click(); pg.wait_for_timeout(400)
    ok('search opens village profile', pg.get_by_test_id('village-panel').is_visible())
    pg.get_by_label('Close panel').click()
    # notifications
    pg.get_by_label(re.compile('^Notifications')).click(); ok('notifications dropdown', pg.get_by_test_id('notifications').is_visible()); pg.keyboard.press('Escape'); pg.mouse.click(700, 500)
    # issues: status change
    pg.goto(BASE + '#/issues?status=Submitted'); pg.wait_for_timeout(400)
    pg.get_by_test_id('issue-row').first.click(); panel = pg.get_by_test_id('issue-panel'); panel.wait_for()
    iid = pg.url.split('id=')[1]
    pg.get_by_label('New status').select_option('Under Review'); pg.get_by_test_id('apply-status').click(); pg.wait_for_timeout(300)
    ok('issue status change to Under Review', 'Status changed to Under Review' in panel.inner_text())
    panel.get_by_label('Update text').fill('Called resident; confirmed location near tank.'); panel.get_by_role('button', name='Add update').click(); pg.wait_for_timeout(200)
    ok('action update added', 'Called resident; confirmed' in panel.inner_text())
    pg.get_by_label('Assign responsible person').select_option('G. Anitha'); pg.wait_for_timeout(200)
    ok('assign staff', 'Assigned to G. Anitha' in panel.inner_text())
    pg.get_by_label('Close panel').click()
    # verified requires evidence
    pg.goto(BASE + '#/issues?status=Resolved'); pg.wait_for_timeout(400)
    pg.get_by_test_id('issue-row').first.click(); panel = pg.get_by_test_id('issue-panel'); panel.wait_for()
    pg.get_by_test_id('mark-verified').click(); pg.wait_for_timeout(300)
    err = pg.get_by_test_id('status-error')
    ok('verified blocked without evidence', err.is_visible() and 'Evidence required' in err.inner_text())
    pg.screenshot(path=SHOTS + 'issue-panel-evidence-required.png')
    pg.get_by_label('Evidence title').fill('After-repair photo'); pg.get_by_label('Evidence description').fill('Village coordinator confirmed with residents'); pg.get_by_test_id('save-evidence').click(); pg.wait_for_timeout(300)
    pg.get_by_test_id('mark-verified').click(); pg.wait_for_timeout(400)
    ok('verified succeeds after evidence', 'Status changed to Verified' in panel.inner_text())
    pg.screenshot(path=SHOTS + 'issue-panel.png')
    pg.get_by_label('Close panel').click()
    # new issue
    pg.get_by_role('button', name='Record new issue').click(); pg.get_by_placeholder('e.g. Drinking water supply interruption').fill('Borewell motor burnt out'); pg.get_by_placeholder('What, where, how many households affected').fill('Motor at the SC colony borewell burnt; 30 families affected.'); pg.get_by_test_id('save-issue').click(); pg.wait_for_timeout(400)
    ok('new issue created', pg.get_by_test_id('issue-panel').is_visible() and 'Borewell motor burnt out' in pg.locator('[data-drawer]').inner_text())
    pg.get_by_label('Close panel').click()
    # project update
    pg.goto(BASE + '#/projects'); pg.wait_for_timeout(400)
    card = pg.get_by_test_id('project-card').filter(has_text='In Progress').first; card.get_by_role('button', name='Open project').click()
    pp = pg.get_by_test_id('project-panel'); pp.wait_for()
    pp.get_by_label('Progress percent').fill('80'); pp.get_by_label('Progress note').fill('Pipeline laid up to ward 5.'); pg.get_by_test_id('save-progress').click(); pg.wait_for_timeout(300)
    ok('project progress update', 'Pipeline laid up to ward 5.' in pp.inner_text() and '80%' in pp.inner_text())
    pp.get_by_label('New milestone').fill('Trial run with residents'); pp.get_by_role('button', name='Add', exact=True).click(); pg.wait_for_timeout(200)
    ok('milestone added', 'Trial run with residents' in pp.inner_text())
    pg.get_by_label('Close panel').click()
    proposed = pg.get_by_test_id('project-card').filter(has_text='Proposed').first.inner_text()
    ok('proposed shows not funded', 'Not approved / not funded' in proposed and '₹' not in proposed)
    # field visit
    pg.goto(BASE + '#/field'); pg.wait_for_timeout(300)
    n0 = pg.get_by_test_id('visit-card').count()
    pg.get_by_test_id('new-visit').click(); pg.get_by_test_id('save-visit').click(); pg.wait_for_timeout(400)
    vp = pg.get_by_test_id('visit-panel'); ok('field visit created', vp.is_visible())
    vp.get_by_test_id('check-item').first.check(); pg.wait_for_timeout(200)
    ok('checklist ticked', vp.get_by_test_id('check-item').first.is_checked())
    vp.get_by_test_id('visit-notes').fill('Met secretariat staff; drain cleaning agreed.'); pg.get_by_test_id('save-notes').click(); pg.wait_for_timeout(200)
    pg.get_by_label('Close panel').click(); pg.wait_for_timeout(200)
    ok('visit count increased', pg.get_by_test_id('visit-card').count() == n0 + 1)
    # persistence
    pg.reload(); pg.wait_for_timeout(600); ok('localStorage persistence', 'Borewell motor burnt out' in pg.evaluate("localStorage.getItem('prajasetu-demo-v1')"))
    # walkthrough
    pg.goto(BASE + '#/'); pg.wait_for_timeout(500); pg.get_by_test_id('start-demo').click(); pg.wait_for_timeout(800)
    wt = pg.get_by_test_id('walkthrough'); ok('walkthrough step 1', 'STEP 1 OF 6' in wt.inner_text().upper() and pg.get_by_test_id('spotlight').is_visible())
    pg.screenshot(path=SHOTS + 'walkthrough.png')
    steps_ok = True
    for k, (route, target) in enumerate([('#/issues', 'issue-list'), ('#/issues?id=', 'accountability'), ('#/projects?id=', 'project-milestones'), ('#/report', 'resolved-vs-verified'), ('#/report', 'report-preview')], start=2):
        wt.get_by_role('button', name='Next').click(); pg.wait_for_timeout(900)
        good = f'STEP {k} OF 6' in wt.inner_text().upper() and route in pg.url and pg.get_by_test_id('spotlight').is_visible()
        print('  step', k, pg.url, good); steps_ok &= good
        if k == 3: pg.screenshot(path=SHOTS + 'walkthrough-accountability.png')
    ok('walkthrough Next through 6 steps', steps_ok)
    wt.get_by_role('button', name='Back').click(); pg.wait_for_timeout(600); ok('walkthrough Back', 'STEP 5 OF 6' in wt.inner_text().upper())
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(500); ok('walkthrough keyboard next', 'STEP 6 OF 6' in wt.inner_text().upper())
    wt.get_by_role('button', name='Exit', exact=True).click(); pg.wait_for_timeout(300); ok('walkthrough Exit', pg.get_by_test_id('walkthrough').count() == 0)
    # report + print
    pg.goto(BASE + '#/report'); pg.wait_for_timeout(500)
    v180 = pg.get_by_test_id('report-0').inner_text(); pg.get_by_test_id('period').select_option('30'); pg.wait_for_timeout(200); v30 = pg.get_by_test_id('report-0').inner_text()
    ok(f'period selector recomputes ({v180} -> {v30})', int(v30) <= int(v180))
    pg.screenshot(path=SHOTS + 'impact-report.png', full_page=True)
    pg.get_by_test_id('preview-report').click(); pg.wait_for_timeout(500)
    ok('print preview opens', pg.get_by_test_id('print-preview').is_visible())
    pg.screenshot(path=SHOTS + 'impact-report-print-preview.png')
    pg.get_by_test_id('print-btn').click(); ok('window.print called', pg.evaluate('window.__printed') == 1)
    pg.emulate_media(media='print'); pg.pdf(path='/workspace/pstest/report.pdf') if False else None
    pg.emulate_media(media='screen')
    # reset
    pg.goto(BASE + '#/settings'); pg.get_by_test_id('reset-data').click(); pg.get_by_test_id('confirm-reset').click(); pg.wait_for_timeout(300)
    ok('reset demo data', 'Borewell' not in (pg.evaluate("localStorage.getItem('prajasetu-demo-v1')") or ''))
    ok('no console/page errors (desktop)', not errs); errs and print(errs[:5])
    # mobile
    m = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    mp = m.new_page(); merrs = []; mp.on('pageerror', lambda e: merrs.append(str(e)))
    mp.goto(BASE); mp.get_by_test_id('start-demo').wait_for(); mp.wait_for_timeout(1200)
    sw = mp.evaluate('document.documentElement.scrollWidth')
    ok(f'mobile no horizontal overflow (scrollWidth={sw})', sw <= 391)
    mp.screenshot(path=SHOTS + 'command-centre-mobile.png', full_page=True)
    mp.get_by_label('Open navigation menu').click(); mp.wait_for_timeout(300)
    mp.get_by_role('dialog', name='Navigation menu').get_by_role('link', name="People's Issues").click(); mp.wait_for_timeout(400)
    ok('mobile nav menu works', mp.locator('h1').first.inner_text() == "People's Issues")
    mp.get_by_test_id('issue-row').first.click(); mp.wait_for_timeout(300); ok('mobile issue panel', mp.get_by_test_id('issue-panel').is_visible())
    mp.screenshot(path=SHOTS + 'issue-panel-mobile.png')
    mp.get_by_label('Close panel').click()
    mp.goto(BASE + '#/'); mp.wait_for_timeout(500); mp.get_by_test_id('start-demo').click(); mp.wait_for_timeout(800)
    mp.get_by_test_id('walkthrough').get_by_role('button', name='Next').click(); mp.wait_for_timeout(900)
    ok('mobile walkthrough', 'STEP 2 OF 6' in mp.get_by_test_id('walkthrough').inner_text().upper())
    mp.screenshot(path=SHOTS + 'walkthrough-mobile.png')
    ok('no page errors (mobile)', not merrs)
    b.close()
print(f"\n{sum(r[1] for r in res)}/{len(res)} passed")
