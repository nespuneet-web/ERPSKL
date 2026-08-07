import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { TeacherTimetableRecord, TIMETABLE_DAYS, TIMETABLE_PERIODS, TimetableDay, inferDepartment } from './timetableData';

/**
 * Generate a downloadable Excel template matching the exact format shown in the screenshot
 */
export async function downloadExcelTemplate(teachersData: TeacherTimetableRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Teachers' Timetable", {
    views: [{ showGridLines: true }]
  });

  // Setup Column Widths
  worksheet.getColumn(1).width = 24; // Teacher Name column
  let colIndex = 2;
  TIMETABLE_DAYS.forEach(() => {
    TIMETABLE_PERIODS.forEach(() => {
      worksheet.getColumn(colIndex).width = 8;
      colIndex++;
    });
  });

  // Row 1: Title Header
  worksheet.getRow(1).height = 24;
  const titleCell = worksheet.getCell('A1');
  titleCell.value = "ALL TEACHERS WEEKLY TIMETABLE MASTER SHEET";
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // Row 2: Days Header (Merged across 9 periods per day)
  worksheet.getRow(2).height = 28;
  const colA2 = worksheet.getCell('A2');
  colA2.value = "TEACHER NAME";
  colA2.font = { name: 'Arial', size: 10, bold: true };
  colA2.alignment = { vertical: 'middle', horizontal: 'center' };
  colA2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  let currentCol = 2; // Column B
  TIMETABLE_DAYS.forEach((day) => {
    const startCol = currentCol;
    const endCol = currentCol + TIMETABLE_PERIODS.length - 1;
    
    worksheet.mergeCells(2, startCol, 2, endCol);
    const dayCell = worksheet.getCell(2, startCol);
    dayCell.value = day;
    dayCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
    dayCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dayCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };

    currentCol = endCol + 1;
  });

  // Row 3: Period Numbers (0 to 8 under each Day)
  worksheet.getRow(3).height = 22;
  const colA3 = worksheet.getCell('A3');
  colA3.value = "";
  colA3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  currentCol = 2;
  TIMETABLE_DAYS.forEach(() => {
    TIMETABLE_PERIODS.forEach((periodNo) => {
      const pCell = worksheet.getCell(3, currentCol);
      pCell.value = periodNo;
      pCell.font = { name: 'Arial', size: 10, bold: true };
      pCell.alignment = { vertical: 'middle', horizontal: 'center' };
      pCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      currentCol++;
    });
  });

  // Populate Teacher Rows starting from Row 4
  teachersData.forEach((teacher, tIdx) => {
    const rowNum = 4 + tIdx;
    worksheet.getRow(rowNum).height = 36;

    // Col A: Teacher Name
    const nameCell = worksheet.getCell(rowNum, 1);
    nameCell.value = teacher.teacherName;
    nameCell.font = { name: 'Arial', size: 10, bold: true };
    nameCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Fill period cells
    let col = 2;
    TIMETABLE_DAYS.forEach((day) => {
      TIMETABLE_PERIODS.forEach((p) => {
        const key = `${day}_${p}`;
        const val = teacher.schedule[key] || '';
        const cell = worksheet.getCell(rowNum, col);
        cell.value = val;
        cell.font = { name: 'Arial', size: 9, bold: val !== '' };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        col++;
      });
    });
  });

  // Apply Borders across all cells
  const totalRows = 3 + teachersData.length;
  const totalCols = 1 + TIMETABLE_DAYS.length * TIMETABLE_PERIODS.length;

  for (let r = 2; r <= totalRows; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    }
  }

  // Export Buffer & Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Teachers_Timetable_Master_Format.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse an uploaded Excel file (.xlsx / .xls / .csv) into TeacherTimetableRecord[]
 */
export async function parseUploadedExcel(file: File): Promise<TeacherTimetableRecord[]> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  if (fileExt === 'csv') {
    return parseCsvFile(file);
  }

  return parseXlsxFile(file);
}

async function parseXlsxFile(file: File): Promise<TeacherTimetableRecord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  const results: TeacherTimetableRecord[] = [];

  // Determine row positions
  // Typically: Row 2 = Days ("Monday", "Tuesday", ...), Row 3 = Periods (0, 1, 2, ...), Row 4+ = Teachers
  let dayHeaderRowIndex = 2;
  let periodHeaderRowIndex = 3;
  let dataStartRowIndex = 4;

  // Let's scan first 10 rows to dynamically detect header positions if user uploaded with offset
  worksheet.eachRow((row, rowNumber) => {
    const values = row.values as Array<any>;
    const rowStr = values.map(v => String(v || '').toLowerCase()).join(' ');
    if (rowStr.includes('monday') && rowStr.includes('tuesday')) {
      dayHeaderRowIndex = rowNumber;
      periodHeaderRowIndex = rowNumber + 1;
      dataStartRowIndex = rowNumber + 2;
    }
  });

  // Map column index (1-based) to { day: TimetableDay, period: number }
  const colMap: Record<number, { day: TimetableDay; period: number }> = {};

  let currentDay: TimetableDay | null = null;
  const dayRow = worksheet.getRow(dayHeaderRowIndex);
  const periodRow = worksheet.getRow(periodHeaderRowIndex);

  const maxCols = worksheet.columnCount || 60;

  for (let c = 2; c <= maxCols; c++) {
    const dayVal = String(dayRow.getCell(c).value || '').trim();
    
    // Check if dayVal matches any known day
    const matchedDay = TIMETABLE_DAYS.find(d => d.toLowerCase() === dayVal.toLowerCase());
    if (matchedDay) {
      currentDay = matchedDay;
    }

    const pValRaw = periodRow.getCell(c).value;
    const pValStr = String(pValRaw !== null && pValRaw !== undefined ? pValRaw : '').trim();
    const periodNum = parseInt(pValStr, 10);

    if (currentDay && !isNaN(periodNum) && periodNum >= 0 && periodNum <= 10) {
      colMap[c] = { day: currentDay, period: periodNum };
    }
  }

  // Iterate teacher rows
  for (let r = dataStartRowIndex; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const teacherName = String(row.getCell(1).value || '').trim();

    // Skip empty rows or title headers
    if (!teacherName || teacherName.toLowerCase().includes('teacher name') || teacherName.toLowerCase().includes('timetable')) {
      continue;
    }

    const schedule: Record<string, string> = {};

    Object.entries(colMap).forEach(([colIdxStr, info]) => {
      const c = parseInt(colIdxStr, 10);
      const cellVal = row.getCell(c).value;
      let textVal = '';
      if (cellVal && typeof cellVal === 'object' && 'result' in cellVal) {
        textVal = String(cellVal.result || '').trim();
      } else if (cellVal !== null && cellVal !== undefined) {
        textVal = String(cellVal).trim();
      }

      if (textVal) {
        const key = `${info.day}_${info.period}`;
        schedule[key] = textVal;
      }
    });

    results.push({
      id: `tt-up-${r}-${Date.now()}`,
      teacherName: teacherName.toUpperCase(),
      department: inferDepartment(teacherName, schedule),
      lastUpdated: new Date().toLocaleString(),
      schedule
    });
  }

  if (results.length === 0) {
    throw new Error('No valid teacher schedule rows found in the Excel file. Please verify the format matches the template.');
  }

  return results;
}

async function parseCsvFile(file: File): Promise<TeacherTimetableRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          if (rows.length < 3) {
            reject(new Error('CSV file has too few rows to parse timetable matrix.'));
            return;
          }

          let dayRowIdx = 0;
          rows.forEach((r, idx) => {
            if (r.some(cell => String(cell).toLowerCase().includes('monday'))) {
              dayRowIdx = idx;
            }
          });

          const dayRow = rows[dayRowIdx];
          const periodRow = rows[dayRowIdx + 1];

          const colMap: Record<number, { day: TimetableDay; period: number }> = {};
          let currentDay: TimetableDay | null = null;

          for (let c = 1; c < dayRow.length; c++) {
            const dayVal = String(dayRow[c] || '').trim();
            const matchedDay = TIMETABLE_DAYS.find(d => d.toLowerCase() === dayVal.toLowerCase());
            if (matchedDay) currentDay = matchedDay;

            const pNum = parseInt(String(periodRow[c] || '').trim(), 10);
            if (currentDay && !isNaN(pNum)) {
              colMap[c] = { day: currentDay, period: pNum };
            }
          }

          const records: TeacherTimetableRecord[] = [];
          for (let r = dayRowIdx + 2; r < rows.length; r++) {
            const row = rows[r];
            const teacherName = String(row[0] || '').trim();
            if (!teacherName) continue;

            const schedule: Record<string, string> = {};
            Object.entries(colMap).forEach(([colIdxStr, info]) => {
              const c = parseInt(colIdxStr, 10);
              const val = String(row[c] || '').trim();
              if (val) {
                schedule[`${info.day}_${info.period}`] = val;
              }
            });

            records.push({
              id: `tt-csv-${r}-${Date.now()}`,
              teacherName: teacherName.toUpperCase(),
              department: inferDepartment(teacherName, schedule),
              lastUpdated: new Date().toLocaleString(),
              schedule
            });
          }

          resolve(records);
        } catch (err: any) {
          reject(new Error('CSV Parsing Error: ' + err.message));
        }
      },
      error: (err) => reject(new Error('PapaParse failed: ' + err.message))
    });
  });
}
