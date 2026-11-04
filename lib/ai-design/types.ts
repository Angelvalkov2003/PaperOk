import type { AiBackOption, AiFormatId, AiStyleId } from "./constants";

export type AiDesignVariant = {
  id: string;
  imageUrl: string;
  previewUrl?: string;
  printUrl?: string;
  cloudinaryPublicId?: string;
  createdAt: string;
};

export type AiDesignProjectState = {
  projectId?: string;
  sessionId: string;
  formatId: AiFormatId;
  withFrame: boolean;
  backOption: AiBackOption;
  idea: string;
  styles: AiStyleId[];
  exactText: string;
  attemptsUsed: number;
  variants: AiDesignVariant[];
  selectedVariantId: string | null;
  faceSide: "front" | "back";
};

export type AiCartMeta = {
  kind: "ai_design";
  projectId?: string;
  variantId: string;
  formatId: AiFormatId;
  withFrame: boolean;
  backOption?: AiBackOption | null;
  exactText?: string;
  styles?: string[];
  idea?: string;
  imageUrl: string;
  printUrl?: string;
  cloudinaryPublicId?: string;
};
