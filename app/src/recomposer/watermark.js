const { degrees } = require('pdf-lib');
const { log, warn, error } = require('./log.js');

const RADIANS_PER_DEGREE = 0.0174533;

async function writeWatermark(doc, pageInfo) {
  let watermark = doc.settings.watermark;

  if (watermark) {
    // log("watermark", "Page dims", doc.pageDims);
    
    let textSize = 900 / watermark.length;
    let textWidth = doc.altFont.widthOfTextAtSize(watermark, textSize);
    let textHeight = doc.altFont.heightAtSize(textSize);
    // log("watermark", `Text dims (${textWidth}, ${textHeight})`);

    let isPortrait = doc.pageDims.height > doc.pageDims.width;
    let angle = isPortrait ? 60 : 30;
    let rad = angle * RADIANS_PER_DEGREE;
    // log("watermark", `Angle ${angle}° = ${rad} rad)`);

    let rotatedWidth = -textHeight * Math.sin(rad) + textWidth * Math.cos(rad);
    let rotatedHeight = textHeight * Math.cos(rad) + textWidth * Math.sin(rad);
    // log("watermark", `Rotated text dims (${rotatedWidth}, ${rotatedHeight})`);

    let x = doc.pageDims.width / 2 - rotatedWidth / 2;
    let y = doc.pageDims.height / 2 - rotatedHeight / 2;
    // log("watermark", `Position: (${x}, ${y})`);

    doc.canvas.drawText(watermark, {
      x,
      y,
      font: doc.altFont,
      size: textSize,
      rotate: degrees(angle),
      color: doc.textColour,
      opacity: 0.3,
    });
  }
}

module.exports = {
  writeWatermark,
}
