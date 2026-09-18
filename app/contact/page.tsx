"use client";

import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import {
  BUSINESS_BIO,
  BUSINESS_TAGLINE,
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TIKTOK_URL,
  YOUTUBE_URL,
} from "lib/constants";
import { useState } from "react";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useErrorPopup } from "components/error-popup-provider";
import {
  FieldError,
  FormField,
  formControlClass,
} from "components/forms/field";
import {
  type ContactFields,
  type FieldErrors,
  hasFieldErrors,
  validateContactForm,
} from "lib/validation";
import { reportGoogleAdsLeadConversion } from "lib/google-ads";

const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacy_policy_accepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ContactFields>>(
    {},
  );
  const { showError } = useErrorPopup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as ContactFields];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateContactForm(formData);
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изпращане на съобщението");
      }

      reportGoogleAdsLeadConversion();

      setSuccess(true);
      setFieldErrors({});
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        privacy_policy_accepted: false,
      });
    } catch (err: unknown) {
      showError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-paper-bg py-12 px-4 sm:px-6 lg:px-8">
        <PaperTexture
          src={PAPER_BACKGROUNDS.petalsSoft}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h1 className="font-heading mb-4 text-4xl font-bold text-paper-heading">
              Свържете се с нас
            </h1>
            <p className="mx-auto mb-2 max-w-xl text-paper-heading">
              {BUSINESS_TAGLINE}
            </p>
            <p className="mb-10 text-paper-text">
              {BUSINESS_BIO} Пишете ни или поръчайте в Instagram DM.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <Reveal variant="left" className="space-y-6">
              <h2 className="font-heading text-2xl font-semibold text-paper-heading">
                Контактна информация
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <EnvelopeIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Имейл
                    </h3>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-base text-paper-heading hover:text-paper-green"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                {contactPhone ? (
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <PhoneIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Телефон
                    </h3>
                    <a
                      href={`tel:${contactPhone.replace(/\s/g, "")}`}
                      className="text-base text-paper-heading hover:text-paper-green"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
                ) : null}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-accent-bg">
                    <MapPinIcon className="h-6 w-6 text-paper-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-paper-muted">
                      Адрес
                    </h3>
                    <p className="text-base text-paper-heading">
                      {CONTACT_LOCATION}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="YouTube"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="TikTok"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-section text-paper-heading transition-colors hover:bg-paper-green hover:text-white"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Google Maps */}
              <div className="mt-8 overflow-hidden rounded-xl border border-paper-border">
                <iframe
                  title="Карта на София"
                  src="https://maps.google.com/maps?q=Sofia,Bulgaria&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </Reveal>

            {/* Contact Form */}
            <Reveal variant="right" delay={100}>
            <div className="rounded-2xl border border-paper-border bg-paper-white p-6 shadow-sm">
              <h2 className="font-heading mb-6 text-2xl font-semibold text-paper-heading">
                Изпратете съобщение
              </h2>

              {success && (
                <div className="mb-4 rounded-lg border border-paper-green bg-paper-accent-bg p-4 text-paper-heading">
                  Съобщението ви е изпратено успешно! Ще се свържем с вас скоро.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <FormField
                  id="name"
                  label="Име"
                  required
                  error={fieldErrors.name}
                >
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={!!fieldErrors.name}
                    className={formControlClass(!!fieldErrors.name)}
                  />
                </FormField>

                <FormField
                  id="email"
                  label="Имейл"
                  required
                  error={fieldErrors.email}
                >
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                    className={formControlClass(!!fieldErrors.email)}
                  />
                </FormField>

                <FormField
                  id="phone"
                  label="Телефон"
                  required
                  error={fieldErrors.phone}
                >
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="08XXXXXXXX"
                    aria-invalid={!!fieldErrors.phone}
                    className={formControlClass(!!fieldErrors.phone)}
                  />
                </FormField>

                <FormField
                  id="message"
                  label="Съобщение"
                  required
                  error={fieldErrors.message}
                >
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    aria-invalid={!!fieldErrors.message}
                    className={formControlClass(!!fieldErrors.message)}
                  />
                </FormField>

                <div>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 ${
                      fieldErrors.privacy_policy_accepted
                        ? "border border-red-500 bg-red-50/50"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.privacy_policy_accepted}
                      onChange={(e) =>
                        updateField(
                          "privacy_policy_accepted",
                          e.target.checked,
                        )
                      }
                      aria-invalid={!!fieldErrors.privacy_policy_accepted}
                      className="mt-1 h-4 w-4 rounded border-paper-border text-paper-green focus:ring-paper-green"
                    />
                    <span className="text-sm text-paper-text">
                      Съгласен съм с{" "}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper-green underline"
                      >
                        Политиката за поверителност
                      </a>{" "}
                      и се съгласявам обработката на моите лични данни. *
                    </span>
                  </label>
                  <FieldError message={fieldErrors.privacy_policy_accepted} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Изпращане..." : "Изпрати съобщение"}
                </button>
              </form>
            </div>
            </Reveal>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
