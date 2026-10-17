import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { itemApi, drawerApi } from '../api/modules';

export interface Label {
  title: string;
  subtitle?: string;
  qrImage: string;
}

export interface PrintSelection {
  kind: 'item' | 'drawer';
  id: number;
  name: string;
  subtitle?: string;
}

export interface PrintSettings {
  selectedPaperSize: string;
  customWidth: number;
  customHeight: number;
  dpi: number;
  qrCodeSize: number;
  showTitle: boolean;
  showBorder: boolean;
  labelsPerPage: number;
}

export const paperSizes = [
  { name: 'A4', label: 'A4 标准', width: 210, height: 297 },
  { name: 'label-small', label: '小标签', width: 30, height: 20 },
  { name: 'label-medium', label: '中等标签', width: 50, height: 30 },
  { name: 'label-large', label: '大标签', width: 70, height: 50 },
  { name: 'label-wide', label: '宽标签', width: 100, height: 30 },
];

export const defaultPrintSettings: PrintSettings = {
  selectedPaperSize: 'A4',
  customWidth: 60,
  customHeight: 40,
  dpi: 300,
  qrCodeSize: 200,
  showTitle: true,
  showBorder: false,
  labelsPerPage: 6,
};

const SETTINGS_KEY = 'batch-print-settings';

export const loadPrintSettings = (): PrintSettings => {
  try {
    return { ...defaultPrintSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...defaultPrintSettings };
  }
};

export const savePrintSettings = (settings: PrintSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getCurrentSize = (settings: PrintSettings) => {
  if (settings.selectedPaperSize === 'custom') {
    return { width: settings.customWidth, height: settings.customHeight, name: 'custom', label: '自定义' };
  }
  return paperSizes.find(s => s.name === settings.selectedPaperSize) || { width: 210, height: 297, name: 'A4', label: 'A4 标准' };
};

const renderQRHighDpi = (url: string, sizePx: number): Promise<string> =>
  QRCode.toDataURL(url, {
    width: sizePx,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });

// 并发限制
const runLimited = async <T>(tasks: (() => Promise<T>)[], limit = 6): Promise<T[]> => {
  const results: T[] = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (idx < tasks.length) {
      const i = idx++;
      const task = tasks[i];
      if (task) results[i] = await task();
    }
  });
  await Promise.all(workers);
  return results;
};

export const buildLabels = async (
  selection: PrintSelection[],
  settings: PrintSettings,
  highDpi: boolean,
  onProgress?: (done: number, total: number) => void,
): Promise<Label[]> => {
  const dpiScale = settings.dpi / 96;
  const qrPixelSize = Math.round(300 * dpiScale);
  let done = 0;

  const tasks = selection.map(sel => async (): Promise<Label> => {
    let qrImage: string;
    if (sel.kind === 'item') {
      const res: any = await itemApi.getQRCode(sel.id);
      qrImage = highDpi && res.url ? await renderQRHighDpi(res.url, qrPixelSize) : res.qrCodeImage;
    } else {
      const res: any = await drawerApi.getQRCode(sel.id);
      qrImage = highDpi && res.url ? await renderQRHighDpi(res.url, qrPixelSize) : res.qrCodeImage;
    }
    onProgress?.(++done, selection.length);
    return { title: sel.name, subtitle: sel.subtitle, qrImage };
  });

  return runLimited(tasks);
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const printLabels = async (
  selection: PrintSelection[],
  settings: PrintSettings,
  isPreview: boolean,
  onProgress?: (done: number, total: number) => void,
): Promise<void> => {
  // 必须在点击事件的同步阶段打开窗口，否则会被浏览器拦截
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以进行打印');
    return;
  }

  let labels: Label[];
  try {
    labels = await buildLabels(selection, settings, false, onProgress);
  } catch (e) {
    console.error('生成标签失败:', e);
    printWindow.close();
    alert('生成二维码失败，请重试');
    return;
  }
  if (labels.length === 0) {
    printWindow.close();
    return;
  }

  const currentSize = getCurrentSize(settings);
  const isA4 = settings.selectedPaperSize === 'A4';

  const labelHtml = (label: Label) => `
    <div class="label${settings.showBorder ? ' bordered' : ''}">
      ${settings.showTitle ? `<div class="title">${escapeHtml(label.title)}${label.subtitle ? `<div class="subtitle">${escapeHtml(label.subtitle)}</div>` : ''}</div>` : ''}
      <img src="${label.qrImage}" class="qr" alt="QR" />
    </div>
  `;

  let bodyHtml = '';
  let pageCss = '';

  if (isA4) {
    const cols = settings.labelsPerPage <= 1 ? 1 : settings.labelsPerPage === 6 ? 2 : settings.labelsPerPage === 12 ? 3 : 4;
    const perPage = settings.labelsPerPage;
    pageCss = `
      @page { size: A4; margin: 10mm; }
      .page { display: grid; grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${Math.ceil(perPage / cols)}, 1fr); gap: 5mm; height: 277mm; page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      .label { width: 100%; height: 100%; overflow: hidden; }
    `;
    const pages: string[] = [];
    for (let i = 0; i < labels.length; i += perPage) {
      pages.push(`<div class="page">${labels.slice(i, i + perPage).map(l => labelHtml(l)).join('')}</div>`);
    }
    bodyHtml = pages.join('');
  } else {
    pageCss = `
      @page { size: ${currentSize.width}mm ${currentSize.height}mm; margin: 2mm; }
      body { display: flex; flex-direction: column; }
      .label { width: ${currentSize.width - 4}mm; height: ${currentSize.height - 4}mm; page-break-after: always; overflow: hidden; }
      .label:last-child { page-break-after: auto; }
    `;
    bodyHtml = labels.map(l => labelHtml(l)).join('');
  }

  const qrCss = isA4
    ? `.qr { width: ${settings.qrCodeSize}px; height: ${settings.qrCodeSize}px; }`
    : `.qr { flex: 1; min-height: 0; object-fit: contain; width: 100%; }`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>批量打印标签</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ${pageCss}
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: black !important; }
        }
        body { font-family: Arial, sans-serif; background: white; }
        .label {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 2mm; text-align: center; ${settings.showBorder ? 'border: 1px solid #333;' : ''}
        }
        .title { font-size: 12px; font-weight: bold; color: #333; word-wrap: break-word; line-height: 1.3; max-width: 100%; }
        .subtitle { font-size: 8px; font-weight: normal; color: #666; }
        ${qrCss}
      </style>
    </head>
    <body>
      ${bodyHtml}
      <script>
        ${isPreview ? '' : `
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        `}
      <` + `/script>
    <` + `/body>
    <` + `/html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  if (isPreview) printWindow.focus();
};

// 用 canvas 绘制标签再嵌入 PDF，避免 jsPDF 内置字体不支持中文导致乱码
export const exportLabelsPDF = async (
  selection: PrintSelection[],
  settings: PrintSettings,
  onProgress?: (done: number, total: number) => void,
): Promise<void> => {
  let labels: Label[];
  try {
    labels = await buildLabels(selection, settings, true, onProgress);
  } catch (e) {
    console.error('生成标签失败:', e);
    alert('生成二维码失败，请重试');
    return;
  }
  if (labels.length === 0) return;

  const currentSize = getCurrentSize(settings);
  const isA4 = settings.selectedPaperSize === 'A4';
  const pdf = new jsPDF({
    unit: 'mm',
    format: isA4 ? 'a4' : [currentSize.width, currentSize.height],
    orientation: currentSize.width > currentSize.height ? 'landscape' : 'portrait',
  });

  const pageMargin = isA4 ? 10 : 2;
  const pageW = isA4 ? 210 : currentSize.width;
  const pageH = isA4 ? 297 : currentSize.height;

  const perPage = isA4 ? settings.labelsPerPage : 1;
  const cols = perPage <= 1 ? 1 : perPage === 6 ? 2 : perPage === 12 ? 3 : 4;
  const rows = Math.ceil(perPage / cols);
  const cellW = (pageW - pageMargin * 2) / cols;
  const cellH = (pageH - pageMargin * 2) / rows;

  const pxPerMm = settings.dpi / 25.4;
  const canvasW = Math.round(cellW * pxPerMm);
  const canvasH = Math.round(cellH * pxPerMm);

  // 按最大宽度折行（逐字符测量，兼容中文）
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    let line = '';
    for (const ch of text) {
      if (ch === '\n' || ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch === '\n' ? '' : ch;
      } else {
        line += ch;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const imgCache = new Map<string, HTMLImageElement>();
  const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const cached = imgCache.get(src);
    if (cached) return resolve(cached);
    const img = new Image();
    img.onload = () => { imgCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });

  const drawLabel = async (label: Label): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const mm = (v: number) => v * pxPerMm;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);

    let titleH = 0;
    if (settings.showTitle) {
      const titlePx = Math.round((isA4 ? 10 : 9) / 72 * settings.dpi);
      ctx.font = `bold ${titlePx}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const titleLines = wrapText(ctx, label.title, canvasW - mm(4));
      titleLines.forEach((line, idx) => {
        ctx.fillText(line, canvasW / 2, mm(2) + idx * titlePx * 1.25);
      });
      titleH = titleLines.length * titlePx * 1.25 + mm(1);

      if (label.subtitle) {
        const subPx = Math.round(7 / 72 * settings.dpi);
        ctx.font = `${subPx}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
        ctx.fillStyle = '#666666';
        const subLines = wrapText(ctx, label.subtitle, canvasW - mm(4));
        subLines.forEach((line, idx) => {
          ctx.fillText(line, canvasW / 2, mm(2) + titleH + idx * subPx * 1.25);
        });
        titleH += subLines.length * subPx * 1.25 + mm(1);
      }
    }

    if (settings.showBorder) {
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = Math.max(1, mm(0.3));
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvasW - ctx.lineWidth, canvasH - ctx.lineWidth);
    }

    const qrMax = Math.min(canvasW - mm(4), canvasH - titleH - mm(4));
    if (qrMax > 0) {
      const img = await loadImg(label.qrImage);
      const qrX = (canvasW - qrMax) / 2;
      const qrY = titleH + mm(2) + (canvasH - titleH - mm(4) - qrMax) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, qrX, qrY, qrMax, qrMax);
    }

    return canvas.toDataURL('image/png');
  };

  for (let i = 0; i < labels.length; i++) {
    if (i > 0 && i % perPage === 0) pdf.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
    const label = labels[i];
    if (!label) continue;

    const cellIdx = i % perPage;
    const col = cellIdx % cols;
    const row = Math.floor(cellIdx / cols);
    const cellX = pageMargin + col * cellW;
    const cellY = pageMargin + row * cellH;

    const dataUrl = await drawLabel(label);
    pdf.addImage(dataUrl, 'PNG', cellX, cellY, cellW, cellH);
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  pdf.save(`标签打印-${today}.pdf`);
};
