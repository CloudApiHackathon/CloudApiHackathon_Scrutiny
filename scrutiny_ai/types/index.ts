export type Font = {
  formatting?: {
    color?: string;
    underline?: boolean;
    fontName?: string;
    fontSize?: number;
    italic?: boolean;
    fontWeight?: string[];
    link?: string;
    listLevel?: number;
    listMarker?: string;
    strikethrough?: boolean;
    textAlign?: string;
  };
  text?: string;
}[];