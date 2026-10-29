# Book cover inventory (updated 2026-10-28)

**Replaces the previous inventory.** The earlier eight covers (Legends of the Soul, Think Local Sell Global, A Coffee with God, The Subtle Art of Leadership,
A Hitta and a Boss, Me acordé de mí, The Romagus Papers, Furrr Your Thoughts) were removed from the site and from `site/assets/img/books/` (Fix List C03).
Originals are only in `_backup_original_assets/`, which is never uploaded.

## Current covers (supplied by the owner on 2026-10-28)
All are shown as **sample covers, not client projects**, on the **home page only**. Web files: `site/assets/img/books/sample-cover-<id>.webp/.jpg` (640x960).

| # | id | Title as printed | Author as printed | Used in |
|---|---|---|---|---|
| 1 | echoes-of-battle | Echoes of Battle: Courage Lives Longer Than War | Jack Harrison | home hero + gallery |
| 2 | valor-rise-of-the-guardians | Valor: Rise of the Guardians, Volume 1 | Alex Raven | home hero + gallery |
| 3 | whispers-of-a-braver-heart | Whispers of a Braver Heart: A Collection of Poems on Love, Loss and New Beginnings | Eleanor James | home hero + gallery |
| 4 | the-forgotten-citadel | The Forgotten Citadel: Some places aren't meant to be found... | Daniel Brooks | home hero + gallery |
| 5 | adventures-of-milo | The Adventures of Milo and His Big Dreams | Lucas Bennett | home gallery |
| 6 | from-portuguese-to-possibilities | From Portuguese to Possibilities: A Friendly Guide to Learning Portuguese for Travel, Work and Everyday Life | Sophia Ellis | home gallery |
| 7 | a-brighter-tomorrow | A Brighter Tomorrow: Finding Hope, Purpose, and a New Beginning | Emily Carter | home gallery |
| 8 | the-private-lives-of-british-men | The Private Lives of British Men: The last open secret | Miguel Angel Ulloa | home gallery (not in the hero) |

The first version of cover 8 (a different, adult-worded title) was NOT used and is kept only in `_backup_original_assets/covers-oct28/`.

## Where covers do NOT appear (Fix List C03)
The landing page, all 19 service pages (the shared "Cover gallery" section was deleted from the template) and the Portfolio page (now the "Our Work" placeholder).
`node tools/audit.mjs` fails if any page other than the home page references `/assets/img/books/` or contains a gallery section.

## Ownership (confirmed by the owner, 2026-10-28)
The owner confirmed that these eight covers are the business's own sample designs, not other authors' published books. They stay on the home page labelled as samples and not client projects. If a real client project is ever added, set `client: true` in `tools/data/misc.mjs` only with the author's written permission.

