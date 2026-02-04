import Link from 'next/link'
import { SPHERES, TOTAL_DEVOTIONS, DEVOTIONS_PER_SPHERE } from '@/lib/constants'

export const metadata = {
  title: 'About the Spheres | Sphere Devotions',
  description:
    'Discover the biblical framework for the spheres of society and how to use Sphere Devotions for small group Bible study and kingdom impact.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-[720px]">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary">
          About the Spheres
        </h1>
        <p className="mt-3 text-lg text-text-secondary">
          A biblical framework for the Great Commission and how to use this tool in your small group.
        </p>

        {/* The Great Commission */}
        <section className="mt-12" aria-labelledby="great-commission-heading">
          <h2 id="great-commission-heading" className="font-heading text-2xl font-bold text-text-primary">
            The Great Commission: Two Sides of One Mission
          </h2>
          <p className="mt-4 text-text-primary leading-relaxed">
            Jesus left his church with a mission that is both <strong>wide</strong> and <strong>deep</strong>. In Mark 16:15 he tells us to preach the gospel to <em>every person</em>—every individual should have a chance to hear and respond. In Matthew 28:19–20 he tells us to <em>disciple all the nations</em>—not only individuals, but the very structures and cultures of society.
          </p>
          <p className="mt-4 text-text-primary leading-relaxed">
            God cares about the person in the pew and the nation they belong to. He wants to see <strong>individuals redeemed</strong> and <strong>societies transformed</strong>. So as we share the gospel with our neighbors, we also ask: How does God’s Word speak to family, work, government, education, media, and the arts? The Great Commission is not either/or—it’s both. We are called to be kingdom people who take the whole of Scripture into the whole of life.
          </p>
        </section>

        {/* The Spheres of Society */}
        <section className="mt-12" aria-labelledby="spheres-heading">
          <h2 id="spheres-heading" className="font-heading text-2xl font-bold text-text-primary">
            The Spheres of Society: God’s Design
          </h2>
          <p className="mt-4 text-text-primary leading-relaxed">
            Every society—no matter how simple or complex—is made up of the same basic dimensions: <strong>family</strong>, <strong>religion</strong>, <strong>economics</strong>, <strong>government</strong>, <strong>education</strong>, <strong>media/communication</strong>, and <strong>celebration</strong> (arts, sports, and culture). We didn’t invent these; they are part of how God designed human life together. Just as our bodies have systems (skeletal, digestive, nervous), societies have these “spheres.” They can be healthy or broken, aligned with God’s purposes or opposed to them—but they are always there.
          </p>
          <p className="mt-4 text-text-primary leading-relaxed">
            The Bible is not only a book about “getting saved.” It is a handbook for all of life. God has something to say about economics, government, education, family, media, and celebration. When we treat the Bible as relevant only to “religious” life, we shrink the kingdom to one slice of the pie. Instead, we want to see God’s character and wisdom <em>in every sphere</em>—so that families love like God loves, economies reflect his integrity, government serves like he serves, and education and the arts champion what he values.
          </p>
          <p className="mt-4 text-text-primary leading-relaxed">
            This platform includes a <strong>Foundational</strong> sphere (52 key passages that undergird a biblical worldview for every sphere) plus <strong>seven spheres of society</strong>, each with 52 key passages. That’s <strong>{TOTAL_DEVOTIONS} key passages</strong> in total—one for every day of the year and more—drawn from every book of the Bible, so no part of God’s story is left out.
          </p>
        </section>

        {/* Marinating the Nations */}
        <section className="mt-12" aria-labelledby="marinating-heading">
          <h2 id="marinating-heading" className="font-heading text-2xl font-bold text-text-primary">
            “Marinating” the Nations: Transformation from the Inside Out
          </h2>
          <p className="mt-4 text-text-primary leading-relaxed">
            In Matthew 28, Jesus says we are to disciple the nations by <em>baptizing</em> them in the name of the Father, Son, and Holy Spirit. The Greek word for baptize originally carried the idea of <strong>marinating</strong> or <strong>pickling</strong>—soaking something through and through so it is changed from the inside out. A cucumber can become a pickle; it can’t go back. In the same way, God’s heart is not to put a thin layer of religion on top of society, but to see every sphere <em>soaked in his character</em>: his justice, faithfulness, love, and wisdom. When family, economics, government, education, media, and celebration are shaped by who God is, his kingdom is advancing on earth as it is in heaven.
          </p>
        </section>

        {/* How to Use This Tool */}
        <section className="mt-12" aria-labelledby="how-to-use-heading">
          <h2 id="how-to-use-heading" className="font-heading text-2xl font-bold text-text-primary">
            How to Use This Tool: Become a Kingdom Great Commission Person
          </h2>
          <p className="mt-4 text-text-primary leading-relaxed">
            Sphere Devotions is designed to help you and your church <strong>see</strong> what God says about every area of life and <strong>apply</strong> it. Each of the {TOTAL_DEVOTIONS} key passages includes:
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-text-primary">
            <li>The <strong>scripture text</strong> (World English Bible, public domain) so you can read it right there.</li>
            <li>A short <strong>video</strong> (about 2–3 minutes) that introduces the passage and opens up the theme—not a full commentary, but a “discovery starter” to get you thinking.</li>
            <li><strong>Reflection questions</strong> to help you and your group explore: What does this mean for my life, my work, and my sphere?</li>
          </ul>
          <p className="mt-4 text-text-primary leading-relaxed">
            You can work through a sphere at your own pace (e.g. one devotion per week = one sphere per year), track your progress, and use the same content in small groups so everyone is aligned around God’s Word for all of life.
          </p>
        </section>

        {/* Small Group Bible Study */}
        <section className="mt-12 rounded-2xl border border-white/20 bg-white/70 p-8 shadow-glass" aria-labelledby="small-group-heading">
          <h2 id="small-group-heading" className="font-heading text-2xl font-bold text-text-primary">
            Using Sphere Devotions in Your Small Group
          </h2>
          <p className="mt-4 text-text-primary leading-relaxed">
            These passages and videos work well as the backbone of a simple small group Bible study. Here’s a practical way to use them:
          </p>
          <ol className="mt-6 list-decimal list-inside space-y-4 text-text-primary">
            <li>
              <strong>Pick a sphere and a passage.</strong> For example, choose “Family” and do one key passage per week. Or mix spheres if your group wants to touch several areas (e.g. one week Family, next week Economics).
            </li>
            <li>
              <strong>Before or during group:</strong> Read the scripture on the devotion page together (or assign it beforehand). Then watch the short video as a group. The video frames the theme without doing all the work—it gets people asking, “What does the Bible actually say here?”
            </li>
            <li>
              <strong>Discuss the reflection questions.</strong> Use the questions under the video to guide conversation: “How have you experienced God’s fatherly care?” “How does this passage speak to our roles at work or in our community?” Keep it practical and personal.
            </li>
            <li>
              <strong>Pray and apply.</strong> Pray for one another and for your sphere (e.g. “Lord, show us how to live this in our families and workplaces”). Encourage everyone to pick one concrete step—something to do or change—in light of the passage.
            </li>
          </ol>
          <p className="mt-6 text-text-primary leading-relaxed">
            <strong>Example:</strong> Your group decides to go through the <strong>Family</strong> sphere. Week 1 you open “God and the Sphere of Family,” read the passage (e.g. 1 John 3:1–2), watch the 2–3 minute video, then use the reflection questions to talk about how God’s character as Father shapes your parenting, marriage, or care for others. Week 2 you move to the next passage in the same category. Over a year you cover 52 passages in that sphere—and you can do the same for other spheres in parallel or in following years.
          </p>
          <p className="mt-4 text-text-primary leading-relaxed">
            The goal is not to rush through the list but to let the Word and the questions shape your group into people who think and live according to God’s design for every sphere—true Great Commission, kingdom-minded believers.
          </p>
        </section>

        {/* The 8 Spheres at a Glance */}
        <section className="mt-12" aria-labelledby="spheres-list-heading">
          <h2 id="spheres-list-heading" className="font-heading text-2xl font-bold text-text-primary">
            The Eight Spheres at a Glance
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {SPHERES.map((sphere) => (
              <li key={sphere.slug}>
                <Link
                  href={`/spheres/${sphere.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-white/20 bg-white/70 p-4 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${sphere.color_primary}20` }}
                  >
                    <img
                      src={`/sphere-icons/${sphere.icon}`}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </span>
                  <div>
                    <span className="font-heading font-semibold text-text-primary">{sphere.name}</span>
                    <p className="text-sm text-text-secondary">{DEVOTIONS_PER_SPHERE} key passages</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/#spheres"
            className="rounded-xl bg-text-primary px-6 py-3 font-semibold text-cream shadow-sm transition hover:opacity-90"
          >
            Explore the Spheres
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-text-primary/30 bg-white/70 px-6 py-3 font-semibold text-text-primary transition hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
