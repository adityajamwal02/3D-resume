import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Send } from "lucide-react";

type ContactConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
};

export default function ContactForm() {
  const [config, setConfig] = useState<ContactConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const inFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10000);
    let active = true;
    async function loadConfig() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}contact-config.json`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        if (!response.ok) throw new Error("Configuration unavailable");
        const value = await response.json();
        if (
          value &&
          [value.serviceId, value.templateId, value.publicKey].every(
            (entry) => typeof entry === "string" && entry.trim().length > 0,
          ) &&
          active
        ) {
          setConfig({
            serviceId: value.serviceId.trim(),
            templateId: value.templateId.trim(),
            publicKey: value.publicKey.trim(),
          });
        }
      } catch {
        if (active) setConfig(null);
      } finally {
        window.clearTimeout(timer);
        if (active) setLoading(false);
      }
    }
    void loadConfig();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config || inFlight.current || state === "success") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("from_name") ?? "").trim();
    const email = String(data.get("reply_to") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (name.length < 2 || message.length < 10 || data.get("website")) {
      setState("error");
      return;
    }
    inFlight.current = true;
    setState("sending");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: { from_name: name, reply_to: email, message },
          }),
        },
      );
      if (!response.ok || (await response.text()).trim() !== "OK") {
        throw new Error("Submission not confirmed");
      }
      form.reset();
      setState("success");
    } catch {
      setState("error");
    } finally {
      window.clearTimeout(timer);
      inFlight.current = false;
    }
  }

  return (
    <form className="contact-form" aria-label="Get in touch" onSubmit={submit}>
      <fieldset
        disabled={!config || state === "sending" || state === "success"}
      >
        <legend className="sr-only">Your details and message</legend>
        <div className="contact-fields">
          <label htmlFor="contact-name">
            Name
            <input
              id="contact-name"
              name="from_name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label htmlFor="contact-email">
            Your email
            <input
              id="contact-email"
              name="reply_to"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
        </div>
        <label htmlFor="contact-message">
          Message
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={3000}
          />
        </label>
        <label className="contact-trap" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="contact-consent">
          <input name="consent" type="checkbox" required />
          <span>
            I agree to my details being used to respond to this message.
          </span>
        </label>
        <button className="button contact-submit" type="submit">
          <Send size={17} />{" "}
          {state === "sending" ? "Sending..." : "Send message"}
        </button>
      </fieldset>
      <div
        className="contact-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {loading
          ? "Connecting..."
          : !config
            ? "The contact form is currently unavailable. Please get in touch on LinkedIn."
            : state === "success"
              ? "Message submitted. Thank you for getting in touch."
              : state === "error"
                ? "Submission could not be confirmed. Check your details and try again, or use LinkedIn. Your message has been kept."
                : ""}
      </div>
      <div className="contact-alternatives">
        <a
          href="https://www.linkedin.com/in/adityajamwal02/"
          target="_blank"
          rel="noreferrer"
        >
          Get in touch on LinkedIn <ArrowUpRight size={15} />
        </a>
        <a
          href="https://www.emailjs.com/legal/privacy-policy/"
          target="_blank"
          rel="noreferrer"
        >
          EmailJS privacy <ArrowUpRight size={15} />
        </a>
      </div>
    </form>
  );
}
