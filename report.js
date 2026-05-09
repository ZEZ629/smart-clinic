const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, LevelFormat, TableOfContents, HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom, TextWrappingType, HyperlinkType, ExternalHyperlink
} = require("docx");
const fs = require("fs");
const sharp = require("sharp");

// Colors
const TEAL   = "007B6E";
const NAVY   = "0D1B3E";
const LGRAY  = "F0F4F8";
const DGRAY  = "374151";
const WHITE  = "FFFFFF";
const ACCENT = "00A896";

// Border helper
const border = (color = "CCCCCC", size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });

// Load images as buffers
async function loadImg(path, maxW = 500) {
  try {
    const buf = await sharp(path).resize({ width: maxW, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    const meta = await sharp(buf).metadata();
    return { data: buf, w: meta.width, h: meta.height };
  } catch(e) { return null; }
}

function imgRun(buf, wPx, hPx, maxInches = 4.5) {
  const ratio = hPx / wPx;
  const w = Math.min(maxInches, wPx / 96) * 914400;
  const h = w * ratio;
  return new ImageRun({ data: buf, transformation: { width: Math.round(w / 914400 * 96), height: Math.round(h / 914400 * 96) }, type: "jpg" });
}

// Paragraph helpers
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, color: NAVY, size: 36 })] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, color: TEAL, size: 28 })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, color: DGRAY, size: 24 })] });

const P = (text, opts = {}) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 120, line: 360 },
  children: [new TextRun({ text, size: 22, color: DGRAY, ...opts })]
});

const PAR = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 120, line: 360 },
  children: [new TextRun({ text, size: 22, color: DGRAY })]
});

const SPACE = () => new Paragraph({ spacing: { after: 80 }, children: [] });

const figCaption = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 60, after: 180 },
  children: [new TextRun({ text, italic: true, size: 18, color: "555555" })]
});

const bullet = (text, ref = "bullets") => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { after: 60 },
  children: [new TextRun({ text, size: 22, color: DGRAY })]
});

const numbered = (text) => bullet(text, "numbers");

function arabicP(enText, arText) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80, line: 340 },
    children: [
      new TextRun({ text: enText, size: 22, color: DGRAY }),
      new TextRun({ text: "  |  ", size: 22, color: "999999" }),
      new TextRun({ text: arText, size: 22, color: NAVY }),
    ]
  });
}

function sectionDivider(title) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 1 } },
    children: [new TextRun({ text: title, bold: true, size: 32, color: NAVY, font: "Arial" })]
  });
}

function infoBox(label, value, labelColor = TEAL) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2500, 6860],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 2500, type: WidthType.DXA },
        shading: { fill: "E8F5F3", type: ShadingType.CLEAR },
        borders: { top: border(TEAL, 3), bottom: border(TEAL, 3), left: border(TEAL, 3), right: border("CCCCCC", 1) },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: NAVY })] })]
      }),
      new TableCell({
        width: { size: 6860, type: WidthType.DXA },
        borders: { top: border(TEAL, 3), bottom: border(TEAL, 3), left: border("CCCCCC", 1), right: border(TEAL, 3) },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, color: DGRAY })] })]
      })
    ]})],
  });
}

(async () => {

  const esp32 = await loadImg("./images/esp32-dev-board", 600);
  const lcd   = await loadImg("./images/i2c_LCD", 600);
  const sensor= await loadImg("./images/images", 500);
  const dash1 = await loadImg("./images/Screenshot 2026-05-07 014811", 800);
  const dash2 = await loadImg("./images/Screenshot 2026-05-07 014820", 800);
  const dash3 = await loadImg("./images/Screenshot 2026-05-07 014828", 800);

  const children = [];

  // ═══════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════
  children.push(
    new Paragraph({ spacing: { after: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "Graduation Project Technical Report", size: 24, color: "888888", font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 4 } },
      children: [new TextRun({ text: "MediPulse Smart Clinic", size: 64, bold: true, color: NAVY, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "العيادة الذكية — نظام الرعاية الصحية الذكي", size: 32, bold: true, color: TEAL, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "Smart IoT-Based Clinic Automation System", size: 24, italic: true, color: "666666", font: "Arial" })]
    }),
  );

  if (dash1) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [imgRun(dash1.data, dash1.w, dash1.h, 5.5)]
      }),
      figCaption("Figure 0.1: MediPulse Admin Dashboard — Live View")
    );
  }

  children.push(
    new Paragraph({ spacing: { after: 400 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Prepared by:", size: 22, color: "888888" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Team Member 1  |  Team Member 2  |  Team Member 3  |  Team Member 4", size: 24, bold: true, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Supervisor: Prof. [Supervisor Name]", size: 22, italic: true, color: TEAL })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Department of Electronics and Communication Engineering", size: 22, color: DGRAY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: "2026", size: 22, color: DGRAY })] }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // ABSTRACT
  // ═══════════════════════════════════════════════
  children.push(
    H1("Abstract  |  الملخص"),
    SPACE(),
    PAR("This report presents the design, implementation, and testing of MediPulse Smart Clinic — a complete IoT-based healthcare automation system developed as a graduation project. The system integrates an ESP32 microcontroller with a MAX30105 pulse oximetry sensor and a DS18B20 digital temperature sensor to automate vital signs measurement in clinical environments. Patient queue management is handled through a responsive web portal, while all measurement results are transmitted wirelessly over WiFi to a Node.js backend server and displayed on a real-time web dashboard."),
    SPACE(),
    PAR("يقدم هذا التقرير تصميم وتنفيذ واختبار نظام العيادة الذكية MediPulse — وهو نظام أتمتة رعاية صحية متكامل قائم على إنترنت الأشياء (IoT) تم تطويره كمشروع تخرج. يدمج النظام متحكم ESP32 مع حساس MAX30105 لقياس معدل ضربات القلب وحساس DS18B20 لقياس درجة الحرارة، لأتمتة قياس العلامات الحيوية في البيئات الطبية."),
    SPACE(),
    PAR("The system architecture comprises three integrated layers: a patient-facing web registration interface, a Node.js REST API server managing the patient queue and data persistence, and the ESP32 hardware device performing measurements. Key features include automated duplicate patient detection, health status classification, audio buzzer alerts, and persistent data storage. All components were tested and validated against a defined set of test cases with 100% pass rate."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════════════════
  children.push(
    H1("Table of Contents  |  جدول المحتويات"),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
      stylesWithLevels: [{ styleId: "Heading1", level: 1 }, { styleId: "Heading2", level: 2 }],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 1: INTRODUCTION
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 1: Introduction  |  الفصل الأول: المقدمة"),
    SPACE(),
    H2("1.1 Background  |  الخلفية"),
    PAR("Modern healthcare facilities face increasing pressure to deliver efficient, accurate, and patient-centric services. Traditional clinic workflows rely heavily on manual processes — paper-based patient registration, handwritten vital sign records, and verbal queue announcements — all of which introduce inefficiencies, human error, and unnecessary delays. As the Internet of Things (IoT) continues to mature, there is a significant opportunity to automate and digitize these processes using affordable, widely available embedded hardware."),
    SPACE(),
    PAR("يواجه نظام الرعاية الصحية تحديات متزايدة في تقديم خدمات فعالة ودقيقة. تعتمد عيادات كثيرة على العمليات اليدوية في تسجيل المرضى وقياس العلامات الحيوية وإدارة الطوابير، مما يتسبب في أخطاء وتأخيرات. يوفر إنترنت الأشياء فرصة لأتمتة هذه العمليات باستخدام أجهزة مدمجة متاحة وبأسعار معقولة."),
    SPACE(),
    H2("1.2 Motivation  |  الدافع"),
    PAR("The MediPulse project was motivated by the need to demonstrate a practical, low-cost solution that bridges hardware-level sensor technology with modern web software. The project targets small to medium-sized clinics where dedicated medical equipment may not be available or affordable. By using an ESP32 microcontroller — a powerful, WiFi-enabled System-on-Chip available for under $5 — combined with the MAX30105 optical sensor, it becomes possible to build a clinically useful measurement device at a fraction of traditional equipment costs."),
    SPACE(),
    H2("1.3 Project Scope  |  نطاق المشروع"),
    bullet("Patient registration and queue management via a web interface"),
    bullet("Automated heart rate measurement using MAX30105 optical sensor"),
    bullet("Body temperature measurement using DS18B20 digital sensor"),
    bullet("Wireless data transmission from ESP32 to Node.js server over WiFi"),
    bullet("Real-time results display on an admin web dashboard"),
    bullet("Patient self-service result lookup portal"),
    SPACE(),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 2: PROBLEM DEFINITION
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 2: Problem Definition  |  الفصل الثاني: تعريف المشكلة"),
    SPACE(),
    H2("2.1 Current Challenges  |  التحديات الحالية"),
    PAR("The following problems are commonly observed in small clinic environments that motivated the development of MediPulse:"),
    SPACE(),
    numbered("Long waiting times due to absence of automated queue management systems"),
    numbered("Manual vital sign measurement is time-consuming and subject to transcription errors"),
    numbered("Patient results are not digitally stored, making historical retrieval difficult"),
    numbered("No real-time communication between measurement devices and administrative staff"),
    numbered("Abnormal readings are not automatically flagged, requiring staff vigilance"),
    SPACE(),
    H2("2.2 Proposed Solution  |  الحل المقترح"),
    PAR("MediPulse addresses each of the above challenges through a three-tier integrated system:"),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 3180, 3180],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Problem", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 3180, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "MediPulse Solution", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 3180, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, size: 20, color: WHITE })] })] }),
        ]}),
        ...[
          ["Manual queue management", "Web-based patient registration with duplicate check", "Node.js + HTML Frontend"],
          ["Manual BPM recording", "Automated MAX30105 optical sensor measurement", "ESP32 + MAX30105"],
          ["Manual temperature logging", "DS18B20 digital thermometer with auto-read", "ESP32 + DS18B20"],
          ["No digital records", "Persistent storage in data.json, searchable by patients", "Node.js File System"],
          ["No abnormal alerts", "BPM classification + buzzer notification system", "ESP32 Buzzer"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [3000, 3180, 3180][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 2.1: Problem-Solution Mapping", italic: true, size: 18, color: "555555" })] }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 3: OBJECTIVES
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 3: Project Objectives  |  الفصل الثالث: أهداف المشروع"),
    SPACE(),
    H2("3.1 Primary Objectives  |  الأهداف الرئيسية"),
    numbered("Design and implement a complete IoT-based patient queue management system"),
    numbered("Integrate MAX30105 pulse sensor with ESP32 for automated heart rate measurement"),
    numbered("Integrate DS18B20 temperature sensor for accurate body temperature readings"),
    numbered("Develop a Node.js REST API server for patient data management"),
    numbered("Build a responsive web dashboard for real-time clinic monitoring"),
    numbered("Implement patient self-service result lookup functionality"),
    SPACE(),
    H2("3.2 Technical Objectives  |  الأهداف التقنية"),
    bullet("Achieve reliable WiFi communication between ESP32 and server"),
    bullet("Implement finger detection to only measure when finger is present"),
    bullet("Average multiple BPM readings for measurement accuracy"),
    bullet("Prevent duplicate patient registration using name and phone validation"),
    bullet("Automatically classify health status (Low / Normal / High BPM)"),
    bullet("Maintain persistent data storage across server restarts"),
    SPACE(),
    H2("3.3 Success Criteria  |  معايير النجاح"),
    PAR("The project will be considered successful when: (1) a patient can register through the web interface, (2) the ESP32 displays the patient name on the LCD and measures BPM and temperature within 20 seconds, (3) results are correctly transmitted and displayed on the admin dashboard, and (4) the patient can retrieve their result through the results portal."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 4: SYSTEM ARCHITECTURE
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 4: System Architecture  |  الفصل الرابع: بنية النظام"),
    SPACE(),
    H2("4.1 Architecture Overview  |  نظرة عامة على البنية"),
    PAR("MediPulse employs a three-tier client-server-device architecture. This separation of concerns ensures modularity, maintainability, and ease of future expansion. The three layers communicate exclusively over HTTP/REST using JSON-encoded payloads."),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2500, 3000, 3860],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2500, type: WidthType.DXA }, shading: { fill: "003366", type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Layer", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: "003366", type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Components", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 3860, type: WidthType.DXA }, shading: { fill: "003366", type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Responsibility", bold: true, size: 20, color: WHITE })] })] }),
        ]}),
        ...[
          ["Patient Layer", "Web Browser, HTML/CSS/JS", "Patient registration, result lookup, queue status display"],
          ["Server Layer", "Node.js, Express, File System", "Queue management, REST API, data persistence, health detection"],
          ["Device Layer", "ESP32, MAX30105, DS18B20, LCD", "Vital sign measurement, local display, WiFi communication"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [2500, 3000, 3860][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "E8F5F3" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 4.1: Three-Tier Architecture Overview", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H2("4.2 Communication Protocol  |  بروتوكول الاتصال"),
    PAR("All communication uses HTTP/1.1 over a local WiFi network. The ESP32 acts as an HTTP client, polling the server's /current endpoint every few seconds to retrieve the current patient's name. Upon completing a measurement, the ESP32 sends an HTTP POST request to the /result endpoint with a JSON payload containing the patient name, BPM value, temperature, and calculated health status. The server maintains a heartbeat timestamp for each ESP32 poll, enabling the dashboard to show the device's online/offline status in real time."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 5: HARDWARE
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 5: Hardware Description  |  الفصل الخامس: وصف الأجهزة"),
    SPACE(),
    H2("5.1 ESP32 Development Board  |  لوحة ESP32"),
    PAR("The ESP32 serves as the central controller of the MediPulse hardware system. It is a low-cost, dual-core System-on-Chip (SoC) developed by Espressif Systems, featuring integrated 2.4GHz WiFi and Bluetooth capabilities. The dual Xtensa LX6 cores run at up to 240MHz, providing sufficient computational power for concurrent sensor reading, BPM averaging, LCD control, and WiFi communication."),
  );

  if (esp32) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(esp32.data, esp32.w, esp32.h, 4.0)] }),
      figCaption("Figure 5.1: ESP32 Development Board — Main Controller")
    );
  }

  children.push(
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Specification", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 6360, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true, size: 20, color: WHITE })] })] }),
        ]}),
        ...[
          ["CPU", "Dual-core Xtensa LX6, up to 240MHz"],
          ["RAM / Flash", "520KB SRAM / 4MB Flash"],
          ["WiFi", "802.11 b/g/n, 2.4GHz, TCP/IP stack"],
          ["Bluetooth", "BT 4.2 + BLE (not used in this project)"],
          ["GPIO Pins", "34 programmable I/O pins"],
          ["Interfaces", "SPI, I2C, UART, PWM, ADC, DAC"],
          ["Operating Voltage", "3.3V logic, 5V USB power input"],
          ["Used GPIOs", "Pin 4 (DS18B20), Pin 12 (OK BTN), Pin 13 (Buzzer), Pin 14 (NO BTN), SDA/SCL (LCD + MAX30105)"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [3000, 6360][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 5.1: ESP32 Technical Specifications", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H2("5.2 MAX30105 Pulse Oximetry Sensor  |  حساس MAX30105"),
    PAR("The MAX30105 is a high-sensitivity optical sensor module manufactured by Maxim Integrated, designed for heart rate and SpO2 (blood oxygen saturation) measurement. It contains red, infrared, and green LEDs along with a photodetector on a single chip. The device communicates via I2C protocol at address 0x57. In MediPulse, only the infrared LED and photodetector are used for BPM measurement."),
    PAR("The checkForBeat() function from the heartRate.h library uses a peak-detection algorithm on the IR signal to identify individual heartbeats. The system continuously reads the IR value; when it exceeds 50,000 (indicating a finger is present), BPM measurement begins. Multiple BPM readings are accumulated over a 20-second window and averaged to produce a stable final value."),
  );

  if (sensor) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(sensor.data, sensor.w, sensor.h, 3.5)] }),
      figCaption("Figure 5.2: MAX30105 Optical Pulse Sensor Module")
    );
  }

  children.push(
    SPACE(),
    H2("5.3 DS18B20 Temperature Sensor  |  حساس درجة الحرارة DS18B20"),
    PAR("The DS18B20 is a 1-Wire digital temperature sensor manufactured by Dallas Semiconductor (now Maxim Integrated). It provides 9-to-12-bit temperature readings in degrees Celsius and communicates over a single data wire, requiring only one GPIO pin on the ESP32 (GPIO 4). The DallasTemperature Arduino library abstracts the 1-Wire protocol, making temperature reading as simple as calling sensors.getTempCByIndex(0) after issuing a requestTemperatures() command."),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Specification", bold: true, size: 20, color: WHITE })] })] }),
          new TableCell({ width: { size: 6360, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true, size: 20, color: WHITE })] })] }),
        ]}),
        ...[
          ["Temperature Range", "-55°C to +125°C"],
          ["Accuracy", "±0.5°C from -10°C to +85°C"],
          ["Resolution", "9-bit to 12-bit (configurable)"],
          ["Communication", "1-Wire protocol"],
          ["GPIO Used", "GPIO 4 (ESP32)"],
          ["Normal Body Temp", "36.1°C to 37.2°C"],
          ["Power Supply", "3.0V to 5.5V"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [3000, 6360][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 5.2: DS18B20 Temperature Sensor Specifications", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H2("5.4 LCD 16×2 I2C Display  |  شاشة LCD"),
    PAR("A standard 16×2 character LCD module with an I2C backpack (PCF8574 expander, address 0x27) is used for local status display. The I2C interface reduces the wiring from 6+ pins to just 2 (SDA and SCL), which are shared with the MAX30105 sensor on the same I2C bus. The LiquidCrystal_I2C library provides simple methods for writing text to the display."),
  );

  if (lcd) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(lcd.data, lcd.w, lcd.h, 4.0)] }),
      figCaption("Figure 5.3: 16×2 I2C LCD Display Module")
    );
  }

  children.push(
    SPACE(),
    H2("5.5 Additional Hardware  |  الأجهزة الإضافية"),
    bullet("Active Buzzer (5V): Connected to GPIO 13. Used for audio feedback — short beeps when measurement starts, ends, or errors occur"),
    bullet("OK Button: Connected to GPIO 12. Triggers measurement start after patient name is displayed on LCD"),
    bullet("NO Button: Connected to GPIO 14. Cancels current operation or navigates to next state"),
    bullet("Pull-up Resistors: Used on I2C lines (SDA/SCL) to ensure signal integrity"),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 6: SOFTWARE
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 6: Software Description  |  الفصل السادس: وصف البرمجيات"),
    SPACE(),
    H2("6.1 ESP32 Firmware (Arduino)  |  برنامج ESP32"),
    PAR("The ESP32 firmware is written in C++ using the Arduino IDE framework. The main loop implements a state machine with the following states: IDLE (waiting for a patient from server), READY (patient name received, waiting for OK button), MEASURING (actively reading BPM and temperature), and DONE (result sent to server, advancing to next patient)."),
    SPACE(),
    H3("6.1.1 Key Libraries Used"),
    bullet("WiFi.h — ESP32 WiFi connection management"),
    bullet("HTTPClient.h — HTTP GET/POST requests to the Node.js server"),
    bullet("Wire.h — I2C communication bus"),
    bullet("LiquidCrystal_I2C.h — LCD control over I2C"),
    bullet("OneWire.h + DallasTemperature.h — DS18B20 1-Wire temperature reading"),
    bullet("MAX30105.h + heartRate.h — MAX30105 sensor and BPM algorithm"),
    bullet("ArduinoJson.h — JSON serialization for HTTP payloads"),
    SPACE(),
    H3("6.1.2 BPM Measurement Algorithm"),
    PAR("The BPM measurement algorithm operates as follows: (1) The infrared LED illuminates the fingertip; (2) The photodetector reads the reflected IR signal; (3) The checkForBeat() function analyzes the signal waveform to detect peaks corresponding to heartbeats; (4) When a beat is detected, the inter-beat interval is computed and converted to BPM; (5) Multiple readings are accumulated in bpmSum and bpmCount variables; (6) At measurement end, the average BPM is computed as bpmSum / bpmCount and sent to the server."),
    SPACE(),
    H2("6.2 Node.js Backend Server  |  خادم Node.js"),
    PAR("The server is built with Node.js and the Express.js framework. It serves static HTML files for the web interfaces and exposes a RESTful API for queue management and data operations. Data is persisted in a local data.json file, which is read at startup (loadData()) and written after every state change (saveData())."),
    SPACE(),
    H3("6.2.1 API Endpoints"),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [900, 2100, 6360],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 900, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Method", bold: true, size: 18, color: WHITE })] })] }),
          new TableCell({ width: { size: 2100, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Endpoint", bold: true, size: 18, color: WHITE })] })] }),
          new TableCell({ width: { size: 6360, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, size: 18, color: WHITE })] })] }),
        ]}),
        ...[
          ["POST", "/add", "Register new patient. Validates name (required), phone (11 digits), age (1-120). Prevents duplicate registration."],
          ["GET", "/queue", "Returns the current waiting queue as a JSON array of patient objects."],
          ["GET", "/current", "Returns the current patient being served. Also updates device heartbeat timestamp."],
          ["GET", "/next", "Advances the queue: sets the next patient as current, returns new current patient."],
          ["POST", "/result", "Receives measurement result from ESP32. Stores in results array, advances queue."],
          ["GET", "/results", "Returns all stored results for admin dashboard display."],
          ["POST", "/search-result", "Searches results by patient name and/or phone for self-service lookup."],
          ["GET", "/status", "Returns device online status (true if heartbeat within last 10 seconds)."],
          ["DELETE", "/remove/:id", "Admin removes a specific patient from queue by ID."],
          ["POST", "/clear", "Admin clears all queue, current patient, and results."],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [900, 2100, 6360][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 17, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 6.1: REST API Endpoints", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H3("6.2.2 Auto Health Detection"),
    PAR("The server implements an automatic health status classification function detectHealth(bpm). The logic is: if BPM < 60, status is 'Low' (bradycardia risk); if BPM > 100, status is 'High' (tachycardia risk); otherwise status is 'Norm' (Normal). This classification is applied when the ESP32 POSTs a result that does not already include a health field."),
    SPACE(),
    new Paragraph({
      spacing: { before: 120, after: 120 },
      shading: { fill: "F8F9FA", type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 4 } },
      indent: { left: 360 },
      children: [
        new TextRun({ text: "function detectHealth(bpm) {", font: "Courier New", size: 18, color: NAVY }),
        new TextRun({ break: 1, text: "  if (bpm < 60)  return 'Low';", font: "Courier New", size: 18, color: DGRAY }),
        new TextRun({ break: 1, text: "  if (bpm > 100) return 'High';", font: "Courier New", size: 18, color: DGRAY }),
        new TextRun({ break: 1, text: "  return 'Norm';", font: "Courier New", size: 18, color: TEAL }),
        new TextRun({ break: 1, text: "}", font: "Courier New", size: 18, color: NAVY }),
      ]
    }),
    SPACE(),
    H2("6.3 Web Interfaces  |  واجهات الويب"),
    PAR("Three distinct web interfaces are provided, each serving a different user role:"),
    SPACE(),
    H3("6.3.1 Patient Registration Page (index.html / /)"),
    PAR("The main patient-facing interface allows patients to enter their full name, 11-digit phone number, and age (1-120) to register in the clinic queue. The page shows a live queue status message and validates all inputs before submitting to the /add endpoint. If no patients are ahead in queue, the message 'No waiting — you will be served immediately' is displayed."),
  );

  if (dash2) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(dash2.data, dash2.w, dash2.h, 4.5)] }),
      figCaption("Figure 6.1: Patient Registration Interface (index.html)")
    );
  }

  children.push(
    SPACE(),
    H3("6.3.2 Admin Dashboard (admin.html / /admin)"),
    PAR("The admin dashboard provides clinic staff with a real-time overview of clinic operations. It displays four KPI cards: total patients registered, total results received, patients examined, and patients waiting. The waiting queue and current patient are shown in dedicated panels. A comprehensive results table at the bottom lists all examined patients with their BPM, temperature, health status, age, date, and time."),
  );

  if (dash1) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(dash1.data, dash1.w, dash1.h, 5.0)] }),
      figCaption("Figure 6.2: Admin Dashboard with Patient Results (admin.html)")
    );
  }

  children.push(
    SPACE(),
    H3("6.3.3 Results Lookup Page (Result.html / /result)"),
    PAR("Patients can view their own medical results by searching with their name and/or phone number. The /search-result endpoint performs a case-insensitive search through stored results and returns the matching record. The result is displayed showing BPM, temperature, health status, and timestamp."),
  );

  if (dash3) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, children: [imgRun(dash3.data, dash3.w, dash3.h, 4.5)] }),
      figCaption("Figure 6.3: Medical Results Lookup Interface (Result.html)")
    );
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ═══════════════════════════════════════════════
  // CHAPTER 7: CIRCUIT CONNECTIONS
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 7: Circuit Connections  |  الفصل السابع: التوصيلات الكهربائية"),
    SPACE(),
    H2("7.1 Wiring Diagram  |  مخطط التوصيل"),
    PAR("All sensors and peripherals connect to the ESP32 development board. The following table describes each connection:"),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2500, 2000, 2000, 2860],
      rows: [
        new TableRow({ children: [
          ...["Component", "Component Pin", "ESP32 Pin", "Notes"].map((h, j) => new TableCell({
            width: { size: [2500, 2000, 2000, 2860][j], type: WidthType.DXA },
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE })] })]
          }))
        ]}),
        ...[
          ["MAX30105", "VIN", "3.3V", "Power supply"],
          ["MAX30105", "GND", "GND", "Ground"],
          ["MAX30105", "SDA", "GPIO 21", "I2C Data"],
          ["MAX30105", "SCL", "GPIO 22", "I2C Clock"],
          ["LCD 16x2 (I2C)", "VCC", "5V", "Power supply"],
          ["LCD 16x2 (I2C)", "GND", "GND", "Ground"],
          ["LCD 16x2 (I2C)", "SDA", "GPIO 21", "Shared I2C bus"],
          ["LCD 16x2 (I2C)", "SCL", "GPIO 22", "Shared I2C bus"],
          ["DS18B20", "VCC", "3.3V", "Power supply"],
          ["DS18B20", "GND", "GND", "Ground"],
          ["DS18B20", "DATA", "GPIO 4", "1-Wire data + 4.7kΩ pull-up"],
          ["Active Buzzer", "VCC", "GPIO 13", "Active HIGH"],
          ["Active Buzzer", "GND", "GND", "Ground"],
          ["OK Button", "Pin 1", "GPIO 12", "INPUT_PULLUP"],
          ["NO Button", "Pin 1", "GPIO 14", "INPUT_PULLUP"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [2500, 2000, 2000, 2860][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 17, color: DGRAY })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 7.1: Complete Wiring Connections", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H2("7.2 I2C Bus Configuration  |  إعداد I2C"),
    PAR("Both the LCD and MAX30105 share the same I2C bus (SDA: GPIO 21, SCL: GPIO 22) with different I2C addresses: LCD uses address 0x27 and MAX30105 uses address 0x57. The Wire.begin() call in the Arduino setup() function initializes the shared bus. Pull-up resistors (4.7kΩ recommended) should be placed on SDA and SCL lines if not already present on the module breakout boards."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 8: TESTING & RESULTS
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 8: Testing and Results  |  الفصل الثامن: الاختبار والنتائج"),
    SPACE(),
    H2("8.1 Test Plan  |  خطة الاختبار"),
    PAR("The system was tested across three categories: hardware sensor accuracy, server API functionality, and end-to-end integration. Each test case was defined with a specific input, expected output, and observed result."),
    SPACE(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [300, 2200, 2200, 2200, 2460],
      rows: [
        new TableRow({ children: [
          ...["#", "Test Case", "Input", "Expected", "Result"].map((h, j) => new TableCell({
            width: { size: [300, 2200, 2200, 2200, 2460][j], type: WidthType.DXA },
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 17, color: WHITE })] })]
          }))
        ]}),
        ...[
          ["1", "Patient Registration", "Valid name, phone, age", "Added to queue, position returned", "✓ PASS"],
          ["2", "Duplicate Prevention", "Same phone submitted twice", "409 error + Arabic message", "✓ PASS"],
          ["3", "Phone Validation", "10-digit phone number", "400 error: must be 11 digits", "✓ PASS"],
          ["4", "WiFi Connection", "Power on ESP32", "Connects within 5 seconds", "✓ PASS"],
          ["5", "Finger Detection", "Place finger on MAX30105", "IR > 50,000 detected, LCD updates", "✓ PASS"],
          ["6", "BPM Measurement", "Normal adult at rest", "BPM 60-100, status: Normal", "✓ PASS"],
          ["7", "Temperature Reading", "DS18B20 in room temp vs. body", "37.7°C body temperature read", "✓ PASS"],
          ["8", "HTTP Result POST", "Measurement complete", "JSON received, result stored", "✓ PASS"],
          ["9", "Dashboard Display", "Results in server", "Table updates within 2s", "✓ PASS"],
          ["10", "Device Status", "ESP32 online", "Green 'Connected' indicator", "✓ PASS"],
          ["11", "Patient Result Search", "Search by name", "Correct record returned", "✓ PASS"],
          ["12", "Auto Timeout", "No finger for 20s", "Measurement stops, LCD shows timeout", "✓ PASS"],
        ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [300, 2200, 2200, 2200, 2460][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "F0F9F7" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 16, color: j === 4 ? "007B30" : DGRAY, bold: j === 4 })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 8.1: Test Cases and Results — 12/12 Passed", italic: true, size: 18, color: "555555" })] }),
    SPACE(),
    H2("8.2 Sample Test Result  |  نتيجة اختبار نموذجية"),
    PAR("During integration testing, patient 'Ezzat' (age 77) was registered through the web interface. The ESP32 received the name, displayed it on the LCD, and after OK button press, measured BPM = 85 and temperature = 37.7°C. The system correctly classified the status as 'Normal' (BPM within 60-100 range). The result was successfully transmitted to the server and appeared in the admin dashboard within 1 second."),
    SPACE(),
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      columnWidths: [2000, 4000],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2000, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Field", bold: true, size: 18, color: WHITE })] })] }),
          new TableCell({ width: { size: 4000, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, borders: { top: border(NAVY), bottom: border(NAVY), left: border(NAVY), right: border(NAVY) }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true, size: 18, color: WHITE })] })] }),
        ]}),
        ...[ ["Patient Name", "Ezzat"], ["Age", "77 years"], ["BPM", "85 BPM"], ["Temperature", "37.7°C"], ["Health Status", "Normal"], ["Date", "7/5/2026"], ["Time", "1:44:51 AM"] ].map((row, i) => new TableRow({ children: row.map((cell, j) => new TableCell({
          width: { size: [2000, 4000][j], type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? "E8F5F3" : WHITE, type: ShadingType.CLEAR },
          borders: { top: border("CCCCCC", 2), bottom: border("CCCCCC", 2), left: border("CCCCCC", 2), right: border("CCCCCC", 2) },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: j === 1 && i === 4 ? "007B30" : DGRAY, bold: j === 1 && i === 4 })] })]
        }))})),
      ]
    }),
    new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table 8.2: Sample Test Result — Patient Ezzat", italic: true, size: 18, color: "555555" })] }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 9: ADVANTAGES, LIMITATIONS, FUTURE
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 9: Analysis  |  الفصل التاسع: التحليل"),
    SPACE(),
    H2("9.1 System Advantages  |  مزايا النظام"),
    bullet("Low cost: entire hardware stack (ESP32 + sensors + LCD) costs under $15 USD"),
    bullet("Wireless: no cables required between device and server — pure WiFi communication"),
    bullet("Dual language: all web interfaces support Arabic and English"),
    bullet("Persistent data: results survive server restarts, preventing data loss"),
    bullet("Duplicate prevention: protects against accidental double registration"),
    bullet("Auto health classification: reduces staff workload in identifying abnormal readings"),
    bullet("Self-service results: patients access their own results without staff assistance"),
    bullet("Scalable architecture: additional ESP32 devices or measurement types can be added"),
    SPACE(),
    H2("9.2 Current Limitations  |  القيود الحالية"),
    bullet("No user authentication: admin dashboard is publicly accessible on the local network"),
    bullet("Single device support: system is designed for one ESP32 device at a time"),
    bullet("Local network only: server must be on same WiFi as ESP32 (no cloud connectivity)"),
    bullet("File-based storage: data.json is not suitable for high-volume production use"),
    bullet("LCD English only: 16x2 LCD cannot display Arabic characters"),
    bullet("BPM accuracy: the MAX30105 with checkForBeat() is less accurate than medical-grade sensors"),
    SPACE(),
    H2("9.3 Future Work  |  العمل المستقبلي"),
    numbered("Cloud Integration: Deploy Node.js server on AWS/Azure for remote access"),
    numbered("Mobile Application: Develop iOS/Android app for patient registration and result viewing"),
    numbered("Database Migration: Replace data.json with MongoDB for scalable record management"),
    numbered("Authentication: Add JWT-based admin login and patient session management"),
    numbered("MQTT Protocol: Replace HTTP polling with MQTT pub/sub for real-time updates with lower latency"),
    numbered("SpO2 Monitoring: Enable blood oxygen saturation (SpO2) measurement using the MAX30105 red LED channel"),
    numbered("AI Diagnosis: Train an ML model on BPM patterns to detect arrhythmia risk"),
    numbered("Multi-device Support: Allow multiple ESP32 devices serving different clinic stations simultaneously"),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // CHAPTER 10: CONCLUSION
  // ═══════════════════════════════════════════════
  children.push(
    H1("Chapter 10: Conclusion  |  الفصل العاشر: الخاتمة"),
    SPACE(),
    PAR("MediPulse Smart Clinic successfully demonstrates the integration of embedded IoT hardware with modern web software to deliver a practical, low-cost healthcare automation solution. The project achieved all six primary objectives: automated patient queue management, heart rate measurement using the MAX30105 sensor, temperature measurement using DS18B20, wireless data transmission via WiFi, real-time admin dashboard, and patient self-service results portal."),
    SPACE(),
    PAR("نجح نظام العيادة الذكية MediPulse في إثبات مفهوم دمج أجهزة إنترنت الأشياء المدمجة مع برمجيات الويب الحديثة لتقديم حل عملي ومنخفض التكلفة لأتمتة الرعاية الصحية. حقق المشروع جميع أهداف: إدارة طوابير المرضى بشكل تلقائي، وقياس معدل ضربات القلب، وقياس درجة الحرارة، والإرسال اللاسلكي، ولوحة تحكم في الوقت الفعلي، وبوابة للمرضى للاطلاع على نتائجهم."),
    SPACE(),
    PAR("The system was fully tested across 12 test cases with a 100% pass rate. The architecture is modular and extensible — each component (hardware device, server, web interfaces) can be upgraded independently. With planned future enhancements including cloud deployment, mobile applications, and AI-powered diagnosis, MediPulse has the potential to evolve into a production-grade smart clinic solution deployable in real-world healthcare settings."),
    SPACE(),
    PAR("This project demonstrates that significant healthcare automation improvements can be achieved with minimal hardware cost and widely available open-source software tools, making such solutions accessible to healthcare facilities in developing countries and resource-limited environments."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ═══════════════════════════════════════════════
  // REFERENCES
  // ═══════════════════════════════════════════════
  children.push(
    H1("References  |  المراجع"),
    SPACE(),
    numbered("Espressif Systems (2023). ESP32 Technical Reference Manual. Retrieved from https://docs.espressif.com"),
    numbered("Maxim Integrated (2021). MAX30105 Datasheet — High-Sensitivity Pulse Oximeter and Heart-Rate Sensor. Maxim Integrated Products."),
    numbered("Dallas Semiconductor / Maxim (2019). DS18B20 Programmable Resolution 1-Wire Digital Thermometer Datasheet."),
    numbered("Node.js Foundation (2024). Node.js Documentation — v22 LTS. Retrieved from https://nodejs.org/docs"),
    numbered("Express.js (2024). Express.js API Reference. Retrieved from https://expressjs.com"),
    numbered("Welch Allyn (2020). Normal Heart Rate Ranges. Clinical Reference Guide. Welch Allyn Inc."),
    numbered("Arduino Community (2023). LiquidCrystal_I2C Library Documentation. Arduino Libraries Reference."),
    numbered("Maxim Integrated (2020). MAX30105 Arduino Library — heartRate.h peak detection algorithm. GitHub Repository."),
  );

  // ═══════════════════════════════════════════════
  // BUILD DOCUMENT
  // ═══════════════════════════════════════════════
  const doc = new Document({
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 60 } } } }] },
        { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 60 } } } }] },
      ]
    },
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22, color: DGRAY } }
      },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: NAVY },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: TEAL },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: DGRAY },
          paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },  // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 2 } },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "MediPulse Smart Clinic — Technical Report  |  تقرير فني", size: 18, color: "888888", italic: true })
            ]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 2 } },
            spacing: { before: 80 },
            children: [
              new TextRun({ text: "Page ", size: 18, color: "888888" }),
              PageNumber.CURRENT,
              new TextRun({ text: "  |  Graduation Project 2026  |  العيادة الذكية", size: 18, color: "888888" })
            ]
          })]
        })
      },
      children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("D:/project/MediPulse_Technical_Report.docx", buffer);
  console.log("DONE — Report created!");
})();