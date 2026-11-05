# ATS Resume Generator — Strict 1-Page A4 Optimizer

An intelligent, ATS-compliant resume generator that guarantees your resume fits on **exactly ONE A4 page (210 × 297 mm)** with zero blank second pages and 100% selectable, machine-readable text.

---

## 🎯 Strict 1-Page A4 Architecture

The application enforces the **One-Page ATS Rule** through an intelligent multi-stage optimization engine:

1. **Exact Dimension Canvas**: Renders precisely at $210 \times 297\text{ mm}$ with a calibrated $296.8\text{ mm}$ print safety threshold, eliminating driver-level blank page rollover.
2. **Real-Time Height & Overflow Meter**: Live DOM measurement calculates `scrollHeight` against A4 printable bounds and displays the current page fill percentage (e.g., $96\%$ optimal vs $>100\%$ overflow).
3. **Automated 1-Page Compaction Engine**:
   - **Content Tightening**: Automatically strips wordy prefixes (*"Responsible for managing"* $\to$ *"Managed"*, *"In order to"* $\to$ *"To"*), upgrades passive voice to strong ATS power verbs (*Spearheaded, Engineered, Architected, Refactored, Delivered*), and removes orphan lines.
   - **Spacing Micro-Tuner**: Automatically scales margins ($0.40\text{–}0.55\text{ in}$), line height ($1.15\text{–}1.35$), section spacing ($5\text{–}13\text{ pt}$), and item gaps within ATS boundaries.
   - **Typography Auto-Scaler**: Safely adjusts body font ($9.0\text{–}10.0\text{ pt}$), section headings ($10.0\text{–}12.0\text{ pt}$), and name ($18\text{–}22\text{ pt}$).
4. **Pre-Export Validation Guardrail**: Blocks export if multi-page overflow is detected, guaranteeing that every generated resume is strictly **1 page**.

---

## 🛠️ Features

- **Strict A4 ATS Formatting**:
  - Fonts: Standard ATS fonts (*Calibri*, *Arial*, *Times New Roman*, *Georgia*).
  - Body font: $9.0\text{–}10.0\text{ pt}$.
  - Section headings: $10.0\text{–}12.0\text{ pt}$.
  - Name: $18.0\text{–}22.0\text{ pt}$.
  - Margins: $0.40\text{–}0.55\text{ inches}$.
- **ATS Compatibility Audit**: Live score ($0\text{–}100$) evaluating single-column layout, standard section architecture, verb strength, and quantifiable metric density.
- **Job Description Keyword Matcher**: Paste job descriptions to see matched vs missing keywords.
- **Interactive Live Editor**: Full manual editing for Personal Info, Summary, Experience, Skills, Projects, Education, and Certifications.
- **Templates**: *ATS Classic*, *ATS Modern*, *ATS Executive*, *ATS Technical*.
- **Export Options**:
  - **Native Browser Print to PDF**: 100% vector, selectable, and searchable text.
  - **Direct PDF Download**: Client-side A4 generation via jsPDF.
  - **JSON Backup / Restore**: Export and import resume data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

