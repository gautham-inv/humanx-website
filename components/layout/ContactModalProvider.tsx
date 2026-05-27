"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Modal } from "@/components/ui/Modal";
import { HumanForm } from "@/components/forms/HumanForm";
import { buildContactFields } from "@/lib/contactFields";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { ContactCtaContent } from "@/lib/sanity/loaders";

type ContactModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function useContactModal(): ContactModalContextValue {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used inside <ContactModalProvider>");
  }
  return ctx;
}

export function ContactModalProvider({
  dict,
  content,
  children,
}: {
  dict: Dictionary;
  /** Sanity-resolved contactCta. Used for modal title/close/submit + fields. */
  content?: ContactCtaContent | null;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  const fields = buildContactFields(dict, content);
  const modalTitle = content?.modalTitle ?? dict.cta.modalTitle;
  const modalClose = content?.modalClose ?? dict.cta.modalClose;
  const submit = content?.submit ?? dict.cta.submit;

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={close}
        title={modalTitle}
        closeLabel={modalClose}
      >
        <HumanForm dict={dict} title="" fields={fields} submitLabel={submit} />
      </Modal>
    </ContactModalContext.Provider>
  );
}
