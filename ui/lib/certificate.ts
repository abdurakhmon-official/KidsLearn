import { jsPDF } from "jspdf";
import type { ProgressSummary } from "@/types/api";

const ASCII_MAP: Record<string, string> = {
  "‘": "'", "’": "'", "ʻ": "'", "ʼ": "'", "“": '"', "”": '"', "–": "-", "—": "-",
  "о́": "o", "ў": "u", "қ": "q", "ғ": "g", "ҳ": "h",
};

function toAscii(text: string): string {
  return text
    .split("")
    .map((char) => ASCII_MAP[char] ?? char)
    .join("")
    .replace(/[^\x00-\x7F]/g, "");
}

export function buildCertificate(progress: ProgressSummary, awardCount: number) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const center = width / 2;

  // Ikki qatlamli ramka
  doc.setDrawColor(109, 81, 236);
  doc.setLineWidth(2.5);
  doc.rect(10, 10, width - 20, height - 20);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, width - 30, height - 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(109, 81, 236);
  doc.text("KidsLearn", center, 33, { align: "center" });

  doc.setFontSize(30);
  doc.setTextColor(40, 40, 50);
  doc.text("SERTIFIKAT", center, 52, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(110, 110, 125);
  doc.text("Ushbu sertifikat quyidagi ishtirokchiga beriladi", center, 64, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(40, 40, 50);
  doc.text(toAscii(progress.child.fullName), center, 82, { align: "center" });

  doc.setDrawColor(200, 200, 215);
  doc.setLineWidth(0.4);
  doc.line(center - 55, 88, center + 55, 88);

  // Ko'rsatkichlar
  const stats = [
    ["Ball", String(progress.stats?.totalPoints ?? 0)],
    ["Yulduz", String(progress.stats?.totalStars ?? 0)],
    ["Darslar", String(progress.lessons.completed)],
    ["Oyinlar", String(progress.games.played)],
    ["Mukofot", String(awardCount)],
  ];

  const columnWidth = 44;
  const startX = center - ((stats.length - 1) * columnWidth) / 2;

  stats.forEach(([label, value], index) => {
    const x = startX + index * columnWidth;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(109, 81, 236);
    doc.text(value, x, 108, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 125);
    doc.text(label, x, 116, { align: "center" });
  });

  doc.setFontSize(11);
  doc.setTextColor(110, 110, 125);
  doc.text(
    `Berilgan sana: ${new Date().toLocaleDateString("en-GB")}`,
    center,
    height - 28,
    { align: "center" },
  );

  return doc;
}

export function downloadCertificate(progress: ProgressSummary, awardCount: number) {
  const doc = buildCertificate(progress, awardCount);
  const name = toAscii(progress.child.fullName).replace(/\s+/g, "-").toLowerCase() || "kidslearn";

  doc.save(`kidslearn-sertifikat-${name}.pdf`);
}
