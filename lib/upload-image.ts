import { prepareImageForUpload } from "lib/compress-image";

export async function uploadImageFile(file: File): Promise<string> {
  console.log("[upload] start", {
    name: file.name,
    type: file.type || "(empty)",
    size: file.size,
  });

  let prepared: File;
  try {
    prepared = await prepareImageForUpload(file);
    console.log("[upload] prepared", {
      name: prepared.name,
      type: prepared.type || "(empty)",
      size: prepared.size,
    });
  } catch (error) {
    console.error("[upload] prepare failed", error);
    throw error;
  }

  const formData = new FormData();
  formData.append("file", prepared);

  let response: Response;
  try {
    response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("[upload] network error", error);
    throw new Error("Мрежова грешка при качване на снимка");
  }

  let data: { url?: string; error?: string } = {};
  let rawBody = "";
  try {
    rawBody = await response.text();
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch (error) {
    console.error("[upload] invalid JSON response", {
      status: response.status,
      statusText: response.statusText,
      body: rawBody.slice(0, 500),
      error,
    });
    throw new Error("Грешка при обработка на отговора от сървъра");
  }

  if (!response.ok) {
    console.error("[upload] server rejected", {
      status: response.status,
      statusText: response.statusText,
      error: data.error,
      body: data,
    });
    throw new Error(
      data.error || `Грешка при качване на снимка (${response.status})`,
    );
  }

  if (!data.url) {
    console.error("[upload] missing url in response", data);
    throw new Error("Сървърът не върна URL на снимката");
  }

  console.log("[upload] success", { url: data.url });
  return data.url;
}
