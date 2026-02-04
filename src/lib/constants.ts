/**
 * App constants. 416 rule: NEVER use any other totals.
 * @see cursorrules.txt, CORRECTIONS_416_DEVOTIONS.md
 */

export const TOTAL_DEVOTIONS = 416
export const DEVOTIONS_PER_SPHERE = 52
export const TOTAL_SPHERES = 8

export interface SphereConfig {
  id: number
  slug: string
  name: string
  description: string
  color_primary: string
  /** Filename in public/sphere-icons/ (e.g. Fou.svg) */
  icon: string
  order_index: number
}

/** 8 spheres in fixed order (cursorrules + CORRECTIONS). Icons from Assets/7 Sphere Logos. */
export const SPHERES: SphereConfig[] = [
  { id: 1, slug: 'foundational', name: 'Foundational', description: 'Biblical foundations for life and society', color_primary: '#323b43', icon: 'Fou.svg', order_index: 1 },
  { id: 2, slug: 'family', name: 'Family', description: 'God and the sphere of family', color_primary: '#ff3a30', icon: 'Fam.svg', order_index: 2 },
  { id: 3, slug: 'economics', name: 'Economics', description: 'Biblical wisdom for economics', color_primary: '#ff9600', icon: 'Eco.svg', order_index: 3 },
  { id: 4, slug: 'government', name: 'Government', description: 'Government and authority under God', color_primary: '#ffcc01', icon: 'Gov.svg', order_index: 4 },
  { id: 5, slug: 'religion', name: 'Religion', description: 'Faith and worship', color_primary: '#88c807', icon: 'Rel.svg', order_index: 5 },
  { id: 6, slug: 'education', name: 'Education', description: 'Learning and teaching', color_primary: '#25b7d6', icon: 'Edu.svg', order_index: 6 },
  { id: 7, slug: 'media', name: 'Media/Communication', description: 'Media and communication', color_primary: '#595ad3', icon: 'Com.svg', order_index: 7 },
  { id: 8, slug: 'celebration', name: 'Celebration', description: 'Celebration and the arts', color_primary: '#df57ad', icon: 'Cel.svg', order_index: 8 },
]

/** Achievement badges (video watched). */
export const ACHIEVEMENT_BADGES: { id: string; name: string; threshold: number; emoji: string }[] = [
  { id: 'first-step', name: 'First Step', threshold: 1, emoji: '🌟' },
  { id: 'getting-started', name: 'Getting Started', threshold: 10, emoji: '🚀' },
  { id: 'half-century', name: 'Half Century', threshold: 50, emoji: '📚' },
  { id: 'century-club', name: 'Century Club', threshold: 100, emoji: '💯' },
  { id: 'double-century', name: 'Double Century', threshold: 200, emoji: '🔥' },
  { id: 'master-scholar', name: 'Master Scholar', threshold: TOTAL_DEVOTIONS, emoji: '🏆' },
]

/** Full-completion badges (video + all reflection questions). */
export const FULL_COMPLETION_BADGES: { id: string; name: string; threshold: number; emoji: string }[] = [
  { id: 'first-full', name: 'First Full', threshold: 1, emoji: '✨' },
  { id: 'ten-full', name: 'Ten Complete', threshold: 10, emoji: '📖' },
  { id: 'sphere-full', name: 'Sphere Complete', threshold: 52, emoji: '🎯' },
  { id: 'all-full', name: 'All 416', threshold: TOTAL_DEVOTIONS, emoji: '👑' },
]

/** Short intro (2 lines) and full intro for each sphere / foundational. */
export const SPHERE_INTROS: Record<string, { short: string; full: string }> = {
  foundational:
    {
      short: 'The Foundational 52 key passages apply to the whole of society. They are the backbone of a biblical worldview that informs all of life.',
      full: "The Foundational 52 key passages are passages that apply to the whole of society. They are 'foundational' because they are the backbone of a biblical worldview that informs all of life.",
    },
  family:
    {
      short: 'God had the original idea of family. He instituted marriage at creation (Genesis 2:24) and desires that we serve and strengthen families and see his purposes restored.',
      full: "God is the one who had the original idea of family. He instituted marriage at the very beginning of creation (Genesis 2:24) as the lifetime commitment between one man and one woman. When the original couple expanded into a family with the birth of their first child we are told that it was \"with the Lord's help\" (Genesis 4:1). His purpose for this sphere is that life might be multiplied and that a God-given destiny for every individual may be established. God desires that we engage with families, to serve and strengthen them, to see his purposes restored.",
    },
  economics:
    {
      short: 'God’s purpose for this sphere is to release provision and model stewardship. Science drives research and innovation; business distributes what is created. Stewarded well, this glorifies the Creator.',
      full: "(Science & Technology together with Business) God's purpose for this sphere is to release provision and model stewardship. Science is the motor of this sphere, for it produces the research that makes possible the creation of wealth by inventing new products and services. The sphere moves forward by the distributive capacity of the business enterprise which produces and sells those inventions. When stewarded well, this process of creating and distributing wealth should enhance the life of people and glorify the Creator who inspires innovation.",
    },
  government:
    {
      short: 'God has appointed government to safeguard justice and create peaceful society. Rulers should exercise delegated authority to serve citizens. We seek godly government and an end to injustice and corruption.',
      full: "God has appointed government in order to safeguard justice and create a peaceful society. Rulers should exercise delegated authority in order to serve the citizens whom they govern. The \"Law of the King\" found in Deuteronomy 17:14- 21 warns those in authority against multiplying that which would lead them into a life-style of authoritarianism, hedonism and materialism. God's alternative to these three unrighteous value systems is servanthood, purity and generosity. We must seek to end every form of injustice, corruption and greed and establish godly government.",
    },
  religion:
    {
      short: 'God’s purpose for religion is the extension of mercy and reconciliation—between people and between people and God. We display why the gospel of Christ is unique and the only means of enduring grace.',
      full: "God's purpose for the sphere of religion is the extension of mercy and the promotion of reconciliation between those who have had relationships broken. This is to occur horizontally between human beings, and vertically between individuals and God. Competing religious worldviews contend for the hearts and minds of men and women everywhere. Without falling into a contentious spirit, we are to enter this marketplace of religious ideas and clearly display why the gospel of Christ is unique. In fact, the gospel is the only means of enduring grace, for it alone makes lasting reconciliation possible through the sacrificial love displayed on the cross.",
    },
  education:
    {
      short: 'God has designed education to be a means of discipleship and multiplication. The purpose is transformation of the student, not mere transaction of knowledge. God has delegated to the family the primary responsibility for their children’s education.',
      full: "God has designed the educational sphere to be a means of discipleship and multiplication. The purpose should be the transformation of the student rather than the mere transaction of knowledge. Godly education should develop Biblical Christians who have Jesus as their model and the Bible as their foundation. This should occur in a family-friendly context, for God has delegated to the family the primary authority and responsibility for the education of their children. Every family on earth should have access to a Christian school for their children.",
    },
  media:
    {
      short: 'God’s purposes for media are the transfer of wisdom and the promotion of healthy relationships. With new technologies we have more capacity to communicate than ever—we must use every tool to advance the kingdom.',
      full: "God's purposes for the sphere of media is the transfer of wisdom and the promotion of healthy relationships. Proverbs is full of pithy axioms which emphasize the power of communication to do good or to do ill. There is great power not only in what is said but in how it is said. Today, with new media technologies emerging one after another, we have more and more capacity to communicate than ever before. But what are we communicating? Is it bringing life or death? Is it enhancing wisdom or promoting folly? We must enter into this arena as followers of Jesus to use every tool available to advance the ways of the kingdom of God.",
    },
  celebration:
    {
      short: 'God’s purposes for celebration are to strengthen hope and build community. From Jubal (Genesis 4:21), artists have used their skills to speak to the heart. Stories of God’s work produce courage and hope.',
      full: "(Arts, Entertainment & Sports): God's purposes for the sphere of celebration is to strengthen hope and build community. Ever since the days of Jubal (Genesis 4:21), artists have used their skills to entertain people and speak to the heart issues of their culture. Biblically, these artistic gifts are often linked with the prophetic ministry. When God's ideas are embedded in story form, the truth resonates with both heart and mind, maximizing their impact. Stories of God's work in the past produce courage and strength for the present and hope for the future.",
    },
}

export function getSphereBySlug(slug: string): SphereConfig | undefined {
  return SPHERES.find((s) => s.slug === slug)
}

export function getSphereById(id: number): SphereConfig | undefined {
  return SPHERES.find((s) => s.id === id)
}
