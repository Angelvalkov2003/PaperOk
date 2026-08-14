import Link from "next/link";
import {
  BUSINESS_TAGLINE,
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  FACEBOOK_URL,
  FIXED_MENU,
  INSTAGRAM_URL,
  SITE_NAME,
  TIKTOK_URL,
  YOUTUBE_URL,
} from "lib/constants";
import { SiteLogo } from "components/site-logo";

const contactPhone =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || process.env.CONTACT_PHONE || "";



function SocialIcon({

  href,

  label,

  children,

}: {

  href: string;

  label: string;

  children: React.ReactNode;

}) {

  return (

    <a

      href={href}

      target="_blank"

      rel="noopener noreferrer"

      aria-label={label}

      className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-border text-paper-text transition-all duration-300 hover:-translate-y-0.5 hover:border-paper-green hover:text-paper-green"

    >

      {children}

    </a>

  );

}



export default function Footer() {

  const currentYear = new Date().getFullYear();

  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : "");



  return (

    <footer className="animate-fade-in relative z-0 overflow-hidden border-t border-paper-border-strong/70 bg-paper-surface text-sm text-paper-text">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">

        {/* Brand */}

        <div className="lg:col-span-1">

          <Link className="mb-4 inline-flex items-center" href="/" aria-label={SITE_NAME}>
            <SiteLogo height={48} />
          </Link>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-muted">

            {BUSINESS_TAGLINE}

          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            <SocialIcon href={INSTAGRAM_URL} label="Instagram">

              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">

                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />

              </svg>

            </SocialIcon>

            <SocialIcon href={FACEBOOK_URL} label="Facebook">

              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">

                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />

              </svg>

            </SocialIcon>

            <SocialIcon href={YOUTUBE_URL} label="YouTube">

              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">

                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />

              </svg>

            </SocialIcon>

            <SocialIcon href={TIKTOK_URL} label="TikTok">

              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">

                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />

              </svg>

            </SocialIcon>

          </div>

        </div>



        {/* Menu */}

        <div>

          <h3 className="mb-4 font-heading text-base font-semibold text-paper-heading">

            Меню

          </h3>

          <ul className="space-y-2.5">

            {[
              ...FIXED_MENU,
            ].map((item) => (

              <li key={item.path}>

                <Link

                  href={item.path}

                  className="text-paper-text transition-colors hover:text-paper-green"

                >

                  {item.title}

                </Link>

              </li>

            ))}

          </ul>

        </div>



        {/* Help / Legal */}

        <div>

          <h3 className="mb-4 font-heading text-base font-semibold text-paper-heading">

            Помощ

          </h3>

          <ul className="space-y-2.5">

            <li>

              <Link

                href="/#faq"

                className="text-paper-text transition-colors hover:text-paper-green"

              >

                Често задавани въпроси

              </Link>

            </li>

            <li>

              <Link

                href="/privacy-policy"

                className="text-paper-text transition-colors hover:text-paper-green"

              >

                Политика за поверителност

              </Link>

            </li>

            <li>

              <Link

                href="/dostavka-i-plashtane"

                className="text-paper-text transition-colors hover:text-paper-green"

              >

                Доставка и плащане

              </Link>

            </li>

          </ul>

        </div>



        {/* Contact */}

        <div>

          <h3 className="mb-4 font-heading text-base font-semibold text-paper-heading">

            Контакти

          </h3>

          <ul className="space-y-3">

            <li className="flex items-start gap-2.5">

              <svg className="mt-0.5 h-4 w-4 shrink-0 text-paper-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>

                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />

              </svg>

              <a

                href={`mailto:${CONTACT_EMAIL}`}

                className="transition-colors hover:text-paper-green"

              >

                {CONTACT_EMAIL}

              </a>

            </li>

            {contactPhone ? (
            <li className="flex items-start gap-2.5">

              <svg className="mt-0.5 h-4 w-4 shrink-0 text-paper-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>

                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />

              </svg>

              <a

                href={`tel:${contactPhone.replace(/\s/g, "")}`}

                className="transition-colors hover:text-paper-green"

              >

                {contactPhone}

              </a>

            </li>
            ) : null}

            <li className="flex items-start gap-2.5">

              <svg className="mt-0.5 h-4 w-4 shrink-0 text-paper-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>

                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />

                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />

              </svg>

              <span>{CONTACT_LOCATION}</span>

            </li>

          </ul>

        </div>

      </div>



      <div className="relative z-10 border-t border-paper-border/80 py-6">

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-paper-muted sm:flex-row lg:px-8">

          <p>

            &copy; {copyrightDate} {SITE_NAME}. Всички права запазени.

          </p>

          <p>Ръчно изработена семенна хартия от София</p>

        </div>

      </div>

    </footer>

  );

}

