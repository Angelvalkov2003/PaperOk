"use client";

import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { useState } from "react";
import { useErrorPopup } from "components/error-popup-provider";
import {
  FieldError,
  FormField,
  formControlClass,
  formSelectClass,
} from "components/forms/field";
import {
  type BusinessFields,
  type FieldErrors,
  hasFieldErrors,
  validateBusinessInquiryForm,
} from "lib/validation";
import { reportGoogleAdsLeadConversion } from "lib/google-ads";

const productTypes = [
  "Рекламни картички",
  "Благодарствени картички",
  "Визитки",
  "Покани",
  "Етикети",
  "Hang tags",
  "Бележници",
  "Календари",
  "Комплекти",
  "Друго",
];

export function BusinessInquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    productType: "",
    quantity: "",
    message: "",
    privacy_policy_accepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<BusinessFields>>(
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
      const errorKey = key as BusinessFields;
      if (!(errorKey in prev)) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateBusinessInquiryForm(formData);
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/business-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          productType: formData.productType,
          quantity: formData.quantity,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изпращане на запитването");
      }

      reportGoogleAdsLeadConversion();

      setSuccess(true);
      setFieldErrors({});
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        productType: "",
        quantity: "",
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
    <div className="relative overflow-hidden rounded-2xl border border-paper-border p-6 shadow-sm md:p-8">
      <PaperTexture
        src={PAPER_BACKGROUNDS.petalsSoft}
        overlay={PAPER_OVERLAYS.white}
        sizes="(min-width: 768px) 42rem, 100vw"
        quality={80}
      />
      <div className="relative z-10">
        <h2 className="font-heading mb-6 text-2xl font-bold text-paper-heading">
          Форма за запитване
        </h2>

        {success && (
          <div className="mb-4 rounded-lg border border-paper-green bg-paper-accent-bg p-4 text-paper-heading">
            Запитването ви е изпратено успешно! Ще се свържем с вас скоро.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="biz-name"
              label="Име"
              required
              error={fieldErrors.name}
            >
              <input
                type="text"
                id="biz-name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-invalid={!!fieldErrors.name}
                className={formControlClass(!!fieldErrors.name, "rounded-xl")}
              />
            </FormField>
            <FormField id="biz-company" label="Фирма">
              <input
                type="text"
                id="biz-company"
                value={formData.company}
                onChange={(e) => updateField("company", e.target.value)}
                className={formControlClass(false, "rounded-xl")}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="biz-email"
              label="Имейл"
              required
              error={fieldErrors.email}
            >
              <input
                type="email"
                id="biz-email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={!!fieldErrors.email}
                className={formControlClass(!!fieldErrors.email, "rounded-xl")}
              />
            </FormField>
            <FormField
              id="biz-phone"
              label="Телефон"
              required
              error={fieldErrors.phone}
            >
              <input
                type="tel"
                id="biz-phone"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="08XXXXXXXX"
                aria-invalid={!!fieldErrors.phone}
                className={formControlClass(!!fieldErrors.phone, "rounded-xl")}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="biz-product"
              label="Вид продукт"
              required
              error={fieldErrors.productType}
            >
              <select
                id="biz-product"
                value={formData.productType}
                onChange={(e) => updateField("productType", e.target.value)}
                aria-invalid={!!fieldErrors.productType}
                className={formSelectClass(!!fieldErrors.productType)}
              >
                <option value="">Изберете вид продукт</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="biz-quantity" label="Количество">
              <input
                type="text"
                id="biz-quantity"
                placeholder="напр. 100, 500, 1000"
                value={formData.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                className={formControlClass(false, "rounded-xl")}
              />
            </FormField>
          </div>

          <FormField
            id="biz-message"
            label="Съобщение"
            required
            error={fieldErrors.message}
          >
            <textarea
              id="biz-message"
              rows={5}
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              aria-invalid={!!fieldErrors.message}
              className={formControlClass(!!fieldErrors.message, "rounded-xl")}
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
                  updateField("privacy_policy_accepted", e.target.checked)
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
                </a>
                . *
              </span>
            </label>
            <FieldError message={fieldErrors.privacy_policy_accepted} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Изпращане..." : "Изпрати запитване"}
          </button>
        </form>
      </div>
    </div>
  );
}
