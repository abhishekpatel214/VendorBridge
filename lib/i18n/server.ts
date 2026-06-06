import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import gu from "./dictionaries/gu.json";
import { Language } from "./LanguageContext";

const dictionaries: Record<Language, any> = { en, hi, gu };

export async function getTranslations() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("vendorbridge_lang")?.value || "en") as Language;
  
  return (key: string) => {
    const keys = key.split(".");
    let value: any = dictionaries[lang];
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }
    
    if (value === undefined || typeof value !== "string") {
      let enValue: any = dictionaries.en;
      for (const k of keys) {
        if (enValue === undefined || enValue === null) break;
        enValue = enValue[k];
      }
      return typeof enValue === "string" ? enValue : key;
    }
    return value;
  };
}
