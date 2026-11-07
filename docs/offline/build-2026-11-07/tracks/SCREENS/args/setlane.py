"""Usage: python setlane.py "<now>" "<STATE note or ->" "<LANE line prefix>=<full new line>" ... [--section "<markdown section>"]
Rewrites lines of status-SCREENS.md in place (STATE:, LANE: <lane>, UPDATED:), optionally inserts a dated section
after the header block (before the first '# ' section)."""
import sys, re
D = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/'
p = D + 'coordination/status-SCREENS.md'
args = sys.argv[1:]
now = args.pop(0)
section = None
if '--section' in args:
    k = args.index('--section'); section = args[k + 1]; del args[k:k + 2]
t = open(p, encoding='utf-8').read()
def setline(t, prefix, new):
    pat = re.compile(r'(?m)^' + re.escape(prefix) + r'(\s|$).*$')
    assert pat.search(t), prefix
    return pat.sub(lambda m: new, t, count=1)
for a in args:
    prefix, new = a.split('=', 1)
    t = setline(t, prefix, new)
t = setline(t, 'UPDATED:', 'UPDATED: ' + now)
if section:
    i = t.index('\n# ') + 1
    t = t[:i] + section.rstrip('\n') + '\n\n' + t[i:]
open(p, 'w', encoding='utf-8', newline='\n').write(t)
print('ok')
