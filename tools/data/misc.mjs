// Sample cover gallery (home page only). Titles/authors exactly as printed on the supplied covers.
// These are SAMPLE covers shown to illustrate cover styles. They are NOT presented as client projects.
// Set client: true ONLY for a title the business produced AND has the author's written permission to show.
const B = (id, title, subtitle, author, cat) => ({ id: 'sample-cover-' + id, title, subtitle, author, cat, w: 640, h: 960, client: false });
export const books = [
  B('echoes-of-battle', 'Echoes of Battle', 'Courage Lives Longer Than War', 'Jack Harrison', 'War Fiction'),
  B('valor-rise-of-the-guardians', 'Valor: Rise of the Guardians', 'Volume 1', 'Alex Raven', 'Graphic Novels'),
  B('whispers-of-a-braver-heart', 'Whispers of a Braver Heart', 'A Collection of Poems on Love, Loss and New Beginnings', 'Eleanor James', 'Poetry'),
  B('the-forgotten-citadel', 'The Forgotten Citadel', "Some places aren't meant to be found...", 'Daniel Brooks', 'Adventure'),
  B('adventures-of-milo', 'The Adventures of Milo and His Big Dreams', '', 'Lucas Bennett', "Children's Books"),
  B('from-portuguese-to-possibilities', 'From Portuguese to Possibilities', 'A Friendly Guide to Learning Portuguese for Travel, Work and Everyday Life', 'Sophia Ellis', 'Language Learning'),
  B('a-brighter-tomorrow', 'A Brighter Tomorrow', 'Finding Hope, Purpose, and a New Beginning', 'Emily Carter', 'Inspirational'),
  B('the-private-lives-of-british-men', 'The Private Lives of British Men', 'The last open secret', 'Miguel Angel Ulloa', 'Non-fiction'),
];

export const homeFaqs = [
  ['Can I publish on Amazon myself?', 'Yes. Amazon KDP is free to use and you can publish there directly at kdp.amazon.com. We are an independent company, not affiliated with Amazon, and we charge only for the editing, design, formatting and publishing support you choose.'],
  ['Are you affiliated with Amazon?', 'No. amazonselfpublishers is an independent publishing-services company. We are not owned by, endorsed by or officially partnered with Amazon or Kindle Direct Publishing.'],
  ['Do I keep the rights to my book?', 'Yes. Authors retain ownership of their work, and any agreement we make should say so clearly.'],
  ['Can I choose individual services instead of a full package?', 'Yes. You can hire us for editing only, a cover only, formatting only, or any combination your book needs.'],
  ['How long does it take to publish a book?', 'Timelines depend on manuscript length, editing needs and how quickly feedback is returned. We will give you a realistic estimate after reading your project.'],
  ['Do you guarantee sales or bestseller status?', 'No. No honest publisher can. We focus on producing a professional book and giving it a well-prepared launch.'],
  ['What do I need to get started?', 'A manuscript or an idea, plus a short description of what you want to achieve. Fill in the inquiry form or call us and we will take it from there.'],
];

export const processSteps = [
  ['Tell us about your book', 'Share your manuscript status, goals and timeline through the form or by phone.'],
  ['Get a clear plan', 'We outline the services your book needs, in order, with scope and next steps.'],
  ['Build and review', 'Writing, editing, design and formatting move forward in stages, and you approve each one.'],
  ['Publish with confidence', 'We prepare final files and your listing, and guide you through release.'],
  ['Promote and grow', 'Optional marketing and promotion support to help readers discover your book.'],
];

export const blogPosts = [
  { slug: 'editing-vs-proofreading', title: 'Editing vs. proofreading: which does your manuscript need?', cat: 'Editing', mins: 5,
    excerpt: 'Developmental editing, copyediting and proofreading solve different problems. Here is how to decide where your draft stands.',
    body: [
      ['p', 'Authors often use "editing" and "proofreading" interchangeably, but they happen at different stages and fix different problems. Hiring the wrong one is one of the most common ways to waste money on a manuscript.'],
      ['h2', 'Developmental editing'],
      ['p', 'This is big-picture work: structure, pacing, character arcs, argument flow. It is best done early, while large changes are still easy.'],
      ['h2', 'Copyediting'],
      ['p', 'A copyeditor corrects grammar, punctuation, word choice and consistency. They also check details such as timelines, spellings and names.'],
      ['h2', 'Proofreading'],
      ['p', 'Proofreading comes last, after the pages are laid out. The goal is to catch the typos and formatting slips that earlier passes missed, not to rewrite.'],
      ['h2', 'A simple rule'],
      ['p', 'If you might still move chapters around, you need developmental editing. If the structure is final but the prose needs polish, copyedit. If the book is laid out and nearly ready, proofread.'],
    ] },
  { slug: 'choosing-a-trim-size', title: 'How to choose a trim size for your paperback', cat: 'Formatting', mins: 4,
    excerpt: 'Trim size affects page count, cost and reader comfort. A practical look at the common options for fiction and non-fiction.',
    body: [
      ['p', 'Trim size is the finished width and height of your book. It influences how many pages you end up with, what the printing costs and how the book feels in the hand.'],
      ['h2', 'Look at comparable books'],
      ['p', 'Pick up several recent books in your genre and measure them. Readers expect certain sizes, and matching them makes your book look at home on the shelf.'],
      ['h2', 'Consider page count'],
      ['p', 'A smaller trim usually means more pages. A larger one reduces page count but may feel less portable. Both affect spine width and printing cost.'],
      ['h2', 'Check your printer\'s options'],
      ['p', 'Not every printer offers every size. Confirm availability before you format, because changing size later means re-flowing the whole interior.'],
    ] },
  { slug: 'what-makes-a-good-book-description', title: 'What makes a good book description?', cat: 'Marketing', mins: 4,
    excerpt: 'Your description is a sales page in miniature. Learn how to hook readers in the first lines and set honest expectations.',
    body: [
      ['p', 'Readers decide quickly. The first two lines of your description are often all they see before clicking to read more.'],
      ['h2', 'Open with a hook'],
      ['p', 'Start with the central tension, question or promise of the book. Avoid generic openings like "This book is about".'],
      ['h2', 'Be specific'],
      ['p', 'Name the stakes, the setting or the problem you solve. Specifics persuade better than adjectives.'],
      ['h2', 'End with a clear invitation'],
      ['p', 'A short closing line can nudge the reader to continue. Keep it honest; do not over-promise.'],
    ] },
  { slug: 'ebook-vs-print-formatting', title: 'Ebook vs. print formatting: why one file is not enough', cat: 'Formatting', mins: 5,
    excerpt: 'Print pages are fixed, while ebooks reflow. Understanding the difference helps you avoid broken layouts and rejected uploads.',
    body: [
      ['p', 'A print book is a set of fixed pages. An ebook is a flowing stream of text that adapts to the reader\'s screen and font settings.'],
      ['h2', 'What changes in print'],
      ['p', 'Margins, gutters, running heads, page numbers and widow and orphan control all matter in print.'],
      ['h2', 'What changes in ebooks'],
      ['p', 'A working table of contents, clean heading structure and flexible images matter most.'],
      ['h2', 'Do not reuse one file for both'],
      ['p', 'A print PDF uploaded as an ebook will look wrong. Prepare each edition separately and test each one.'],
    ] },
  { slug: 'planning-a-book-launch', title: 'Planning a book launch: a simple timeline', cat: 'Launch', mins: 6,
    excerpt: 'A sensible launch starts weeks before release. Use this timeline to organise your proof copies, outreach and announcements.',
    body: [
      ['p', 'A launch is easier when the work is spread over several weeks instead of crammed into release day.'],
      ['h2', 'Eight weeks out'],
      ['p', 'Finalise your cover and description, set up your author page and begin building your mailing list.'],
      ['h2', 'Four weeks out'],
      ['p', 'Order a proof copy, request early reader feedback and prepare announcement posts.'],
      ['h2', 'Launch week'],
      ['p', 'Announce to your list and social channels, share your trailer if you have one and thank early readers.'],
      ['h2', 'After launch'],
      ['p', 'Keep a steady rhythm of posts, outreach and reader engagement. Many books gain readers slowly.'],
    ] },
  { slug: 'do-you-need-an-author-website', title: 'Do you need an author website?', cat: 'Author Platform', mins: 4,
    excerpt: 'Social profiles come and go. Here is why a website you own is still the foundation of an author platform.',
    body: [
      ['p', 'Social media is useful, but you do not own your audience there. A website is yours, and it gives readers a stable place to find you.'],
      ['h2', 'What it should include'],
      ['p', 'A short bio, a page for each book with buy links, a way to join your mailing list and a contact option.'],
      ['h2', 'Keep it simple'],
      ['p', 'A clear, fast, mobile-friendly site beats an elaborate one that you never update.'],
    ] },
];

export const testimonials = []; // Intentionally empty: add only real, authorised testimonials.
