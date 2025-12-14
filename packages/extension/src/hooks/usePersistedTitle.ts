import { useEffect } from "react";
import { fromUnknown } from "../services/errorUtils";
import type { FormikValues } from "formik/dist/types";
import { useAppStore } from "../store";
import { normalizeUrl } from "../utils/normalizeUrl";
import { useGetFlashcardGroupUrls } from "./useGetFlashcardGroupUrls";

/**
 * Builds a storage key for the current page using normalized URL.
 * Note: we compute it inside the hook because hooks cannot be called at module scope.
 */

/**
 * @function usePersistedTitle
 * @description A hook that synchronizes the 'title' field of a Formik form
 * with `chrome.storage.local` for the current page URL.
 * @param {FormikValues} values - The `values` object from Formik.
 * @param {(field: string, value: any) => void} setFieldValue - The `setFieldValue` function from Formik.
 */
export const usePersistedTitle = (
  values: FormikValues,
  setFieldValue: (field: string, value: any) => void
) => {
  const { groupUrls } = useGetFlashcardGroupUrls();
  const flashcardCreatorTitle = useAppStore(
    (state) => state.flashcardCreator.title
  );
  const setFlashcardCreatorTitle = useAppStore(
    (state) => state.setFlashcardCreatorTitle
  );

  useEffect(() => {
    const h1Element = document.querySelector("h1");
    const pageTitle = h1Element
      ? h1Element.textContent?.trim() || ""
      : document.title;

    setFlashcardCreatorTitle(pageTitle);
  }, [setFlashcardCreatorTitle]);

  useEffect(() => {
    const key = `assistant_title_${normalizeUrl(
      window.location.href,
      groupUrls
    )}`;
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        fromUnknown(chrome.runtime.lastError, { notify: true });
        return;
      }
      if (result[key]) {
        setFieldValue("title", result[key]);
      }
    });
  }, [setFieldValue]);

  useEffect(() => {
    const key = `assistant_title_${normalizeUrl(
      window.location.href,
      groupUrls
    )}`;
    const titleToSave = values.title;

    if (titleToSave && titleToSave !== flashcardCreatorTitle) {
      chrome.storage.local.set({ [key]: titleToSave }, () => {
        setFlashcardCreatorTitle(titleToSave);
        if (chrome.runtime.lastError) {
          fromUnknown(chrome.runtime.lastError, { notify: true });
        }
      });
    }
  }, [values.title, flashcardCreatorTitle]);
};
