const PDFDocument = require("pdfkit");

function generateMonthlyReport(business, stats, reviews, analysis) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const now = new Date();
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();

    // Header
    doc.fontSize(8).fillColor("#818CF8").text("NERVÜR SENTINEL", 50, 50);
    doc.fontSize(24).fillColor("#1a1a1a").text(`Rapport mensuel`, 50, 80);
    doc.fontSize(14).fillColor("#666").text(`${monthName} ${year} — ${business.businessName}`, 50, 112);

    doc.moveTo(50, 140).lineTo(545, 140).strokeColor("#e5e5e5").stroke();

    // Score overview
    doc.fontSize(16).fillColor("#1a1a1a").text("Vue d'ensemble", 50, 160);

    const boxY = 185;
    const boxes = [
      { label: "Score global", value: `${stats.averageRating || 0}/5`, color: "#ef4444" },
      { label: "Total avis", value: `${stats.totalReviews || 0}`, color: "#3b82f6" },
      { label: "Ce mois", value: `${stats.thisMonthCount || 0}`, color: "#4ADE80" },
      { label: "Taux de réponse", value: `${stats.responseRate || 0}%`, color: "#f59e0b" },
    ];

    boxes.forEach((box, i) => {
      const x = 50 + i * 125;
      doc.roundedRect(x, boxY, 115, 65, 6).fillColor("#f8f8f8").fill();
      doc.fontSize(8).fillColor("#888").text(box.label, x + 10, boxY + 12, { width: 95 });
      doc.fontSize(20).fillColor(box.color).text(box.value, x + 10, boxY + 30, { width: 95 });
    });

    // Sentiment breakdown
    doc.fontSize(16).fillColor("#1a1a1a").text("Répartition des sentiments", 50, 275);

    const sentiments = stats.sentiments || { positive: 0, negative: 0, mixed: 0 };
    const total = sentiments.positive + sentiments.negative + sentiments.mixed || 1;

    const sentData = [
      { label: "Positifs", count: sentiments.positive, pct: Math.round(sentiments.positive / total * 100), color: "#4ADE80" },
      { label: "Mixtes", count: sentiments.mixed, pct: Math.round(sentiments.mixed / total * 100), color: "#f59e0b" },
      { label: "Négatifs", count: sentiments.negative, pct: Math.round(sentiments.negative / total * 100), color: "#ef4444" },
    ];

    sentData.forEach((s, i) => {
      const y = 300 + i * 25;
      doc.fontSize(10).fillColor("#333").text(`${s.label}: ${s.count} (${s.pct}%)`, 50, y);
      // Bar
      doc.roundedRect(200, y, 345, 12, 3).fillColor("#f0f0f0").fill();
      doc.roundedRect(200, y, Math.max(345 * s.pct / 100, 4), 12, 3).fillColor(s.color).fill();
    });

    // Semantic analysis
    if (analysis && analysis.themes) {
      doc.fontSize(16).fillColor("#1a1a1a").text("Analyse sémantique", 50, 400);

      analysis.themes.forEach((t, i) => {
        const y = 425 + i * 22;
        if (y > 700) return;
        const barWidth = Math.max((t.score / 10) * 300, 4);
        const barColor = t.score >= 7 ? "#4ADE80" : t.score >= 5 ? "#f59e0b" : "#ef4444";

        doc.fontSize(9).fillColor("#333").text(t.theme.charAt(0).toUpperCase() + t.theme.slice(1), 50, y, { width: 100 });
        doc.roundedRect(155, y, 300, 12, 3).fillColor("#f0f0f0").fill();
        doc.roundedRect(155, y, barWidth, 12, 3).fillColor(barColor).fill();
        doc.fontSize(9).fillColor("#666").text(`${t.score}/10`, 465, y);
      });
    }

    // Summary
    if (analysis && analysis.summary) {
      const summaryY = analysis.themes ? 425 + analysis.themes.length * 22 + 20 : 400;
      if (summaryY < 680) {
        doc.fontSize(16).fillColor("#1a1a1a").text("Résumé", 50, summaryY);
        doc.fontSize(10).fillColor("#555").text(analysis.summary, 50, summaryY + 25, { width: 495, lineGap: 4 });
      }
    }

    // Strengths & weaknesses
    if (analysis && analysis.strengths && analysis.weaknesses) {
      doc.addPage();

      doc.fontSize(16).fillColor("#1a1a1a").text("Points forts", 50, 50);
      (analysis.strengths || []).forEach((s, i) => {
        doc.fontSize(10).fillColor("#4ADE80").text("✓ ", 50, 80 + i * 20, { continued: true });
        doc.fillColor("#333").text(s);
      });

      const weakY = 80 + (analysis.strengths || []).length * 20 + 30;
      doc.fontSize(16).fillColor("#1a1a1a").text("Points à améliorer", 50, weakY);
      (analysis.weaknesses || []).forEach((w, i) => {
        doc.fontSize(10).fillColor("#ef4444").text("✗ ", 50, weakY + 30 + i * 20, { continued: true });
        doc.fillColor("#333").text(w);
      });

      // Recent reviews
      const reviewsY = weakY + 30 + (analysis.weaknesses || []).length * 20 + 40;
      doc.fontSize(16).fillColor("#1a1a1a").text("Derniers avis", 50, reviewsY);

      const recentReviews = (reviews || []).slice(0, 5);
      recentReviews.forEach((r, i) => {
        const y = reviewsY + 30 + i * 60;
        if (y > 700) return;
        const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        doc.fontSize(10).fillColor("#f59e0b").text(stars, 50, y, { continued: true });
        doc.fillColor("#333").text(`  ${r.authorName}`, { continued: true });
        doc.fillColor("#999").text(`  — ${new Date(r.publishedAt).toLocaleDateString("fr-FR")}`);
        doc.fontSize(9).fillColor("#666").text(
          (r.text || "(Sans texte)").substring(0, 120) + (r.text && r.text.length > 120 ? "..." : ""),
          50, y + 16, { width: 495 }
        );
      });
    }

    // Footer
    doc.fontSize(8).fillColor("#aaa").text(
      `Rapport généré automatiquement par NERVÜR Sentinel — ${new Date().toLocaleDateString("fr-FR")}`,
      50, 750, { align: "center", width: 495 }
    );

    doc.end();
  });
}

module.exports = { generateMonthlyReport };
