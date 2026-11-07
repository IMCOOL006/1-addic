"""Usage: python rr.py <section-file> <resume-file>: inserts the dated section before '## Resume here' and replaces the Resume here body."""
import sys
p = 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/SCREENS/RUN-RECORD.md'
t = open(p, encoding='utf-8').read()
sec = open(sys.argv[1], encoding='utf-8').read().rstrip('\n')
res = open(sys.argv[2], encoding='utf-8').read().rstrip('\n')
i = t.index('## Resume here')
t = t[:i] + sec + '\n\n## Resume here\n\n' + res + '\n'
open(p, 'w', encoding='utf-8', newline='\n').write(t)
print('ok', len(t))
