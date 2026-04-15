import { describe, it, expect } from "@jest/globals";
import { isValidImageURL } from "../../../utils/isValidImageUrl.js";

describe("isValidImageURL", () => {
  it("aceita URL https válida", () => {
    expect(isValidImageURL("https://cdn.site.com/img.jpg")).toBe(true);
  });

  it("aceita URL http válida", () => {
    expect(isValidImageURL("http://cdn.site.com/img.jpg")).toBe(true);
  });

  it("rejeita caminho relativo", () => {
    expect(isValidImageURL("/uploads/foto.jpg")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isValidImageURL("")).toBe(false);
  });

  it("rejeita null", () => {
    expect(isValidImageURL(null)).toBe(false);
  });

  it("rejeita undefined", () => {
    expect(isValidImageURL(undefined)).toBe(false);
  });
});