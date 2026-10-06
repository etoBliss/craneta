import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import { Logo } from '@/components/Logo'
import LandingPassportPreview from '@/components/LandingPassportPreview'
import LandingHeroTitle from '@/components/LandingHeroTitle'
import { ContextRelayHero } from '@/components/hero/LivingPassportHero'

const principles = [
    {
        number: '01',
        title: 'Keep the useful parts',
        description: 'Give your preferences, projects, and working style a home you can return to and shape over time.',
    },
    {
        number: '02',
        title: 'Choose what travels',
        description: 'Copy a single page or export your passport. You stay in control of what you share and where it goes.',
    },
    {
        number: '03',
        title: 'Make it more yours',
        description: 'Edit any detail as life changes. Craneta keeps a history so you can see what you wrote before.',
    },
]

export default async function FreshLanding() {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) redirect('/dashboard')

    return (
        <main className="landing">
            <header className="landing-nav">
                <Link href="/" aria-label="Craneta home" className="landing-nav__brand"><Logo light={false} /></Link>
                <nav className="landing-nav__links" aria-label="Main navigation">
                    <a href="#why-craneta">Why Craneta</a>
                    <a href="#how-it-works">How it works</a>
                </nav>
                <div className="landing-nav__actions">
                    <Link href="/auth/signin" className="landing-nav__signin">Sign in</Link>
                    <Link href="/auth/signup" className="landing-button landing-button--small">Get started <span aria-hidden="true">↗</span></Link>
                </div>
            </header>

            <section className="landing-hero" aria-labelledby="hero-title">
                <div className="landing-hero__copy">
                    <p className="landing-kicker"><span aria-hidden="true">✳</span> One person. A better start everywhere.</p>
                    <LandingHeroTitle />
                    <p className="landing-hero__lead">Your writing voice for one chat. Your research lens for the next. Choose what fits, then carry it to the AI you’re using.</p>
                    <div className="landing-hero__actions">
                        <Link href="/auth/signup" className="landing-button">Shape your context <span aria-hidden="true">↗</span></Link>
                        <a href="#how-it-works" className="landing-text-link">See the story <span aria-hidden="true">↓</span></a>
                    </div>
                    <p className="landing-hero__aside">Free to start <span aria-hidden="true">·</span> No card required <span aria-hidden="true">·</span> Your words stay yours</p>
                </div>
                <div className="landing-hero__art">
                    <span className="landing-hero__index" aria-hidden="true">One person · three ways to begin</span>
                    <ContextRelayHero />
                    <span className="landing-hero__orbit" aria-hidden="true">YOUR VOICE · YOUR RULES · YOUR CONTEXT</span>
                </div>
            </section>

            <section className="landing-preview-section" aria-labelledby="preview-title">
                <div className="landing-preview-section__copy">
                    <p className="landing-kicker">Choose the details that matter now</p>
                    <h2 id="preview-title">Same person.<br /><em>Better context.</em></h2>
                    <p>Keep your working style, voice, and priorities close. Bring only what fits the conversation in front of you.</p>
                </div>
                <div className="landing-preview-section__demo">
                    <LandingPassportPreview />
                </div>
            </section>

            <section className="landing-note" id="why-craneta">
                <p className="landing-note__label">The small frustration</p>
                <p className="landing-note__copy">New chat. Same introduction. Same preferences. Same explaining what you meant by “keep it simple.”</p>
                <p className="landing-note__answer">Craneta gives that context a home outside the chat box.</p>
            </section>

            <section className="landing-principles" id="how-it-works" aria-labelledby="principles-title">
                <div className="landing-section-heading">
                    <p className="landing-kicker">A calmer way to work with AI</p>
                    <h2 id="principles-title">Write it once.<br /><em>Carry it your way.</em></h2>
                    <p>Not another model. Not another complicated setup. Just the context you want to bring along.</p>
                </div>
                <div className="principle-grid">
                    {principles.map((item) => (
                        <article className="principle-card" key={item.number}>
                            <span className="principle-card__number">{item.number}</span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-privacy" aria-label="Privacy and control">
                <div className="landing-privacy__mark" aria-hidden="true">C</div>
                <div>
                    <p className="landing-kicker">Made to belong to you</p>
                    <h2>Your context. Your call.</h2>
                    <p>Your pages are private to your account. Copy or export only what you want to share. Delete your account whenever you’re ready.</p>
                </div>
                <Link href="/privacy" className="landing-text-link">Read our privacy note <span aria-hidden="true">↗</span></Link>
            </section>

            <section className="landing-close">
                <p className="landing-kicker">Start with one small page</p>
                <h2>Give your next conversation<br />a better beginning.</h2>
                <Link href="/auth/signup" className="landing-button landing-button--light">Create your context <span aria-hidden="true">↗</span></Link>
                <p>Start with one useful detail. Add the rest as you go.</p>
            </section>

            <footer className="landing-footer">
                <Link href="/" aria-label="Craneta home"><Logo light={false} /></Link>
                <p>A portable home for the context you choose to carry.</p>
                <nav aria-label="Legal links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="mailto:hello@craneta.app">Contact</Link></nav>
                <span>© {new Date().getFullYear()} Craneta</span>
            </footer>
        </main>
    )
}
