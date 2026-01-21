"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportButtonsProps {
    data: any[]
    fileName?: string
    pdfTitle?: string
    headers?: string[] // Optional: for PDF column headers if needed specifically
}

export function ExportButtons({ data, fileName = "report", pdfTitle = "Report" }: ExportButtonsProps) {
    if (!data || data.length === 0) return null

    const handleExcelExport = () => {
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

        // Generate Excel file
        XLSX.writeFile(wb, `${fileName}.xlsx`)
    }

    const handlePdfExport = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(16)
        doc.text(pdfTitle, 14, 20)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)

        // Columns (Keys of first object)
        const columns = Object.keys(data[0]).map(key => ({ header: key, dataKey: key }))

        // Table
        autoTable(doc, {
            startY: 35,
            head: [columns.map(c => c.header)],
            body: data.map(item => Object.values(item)),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        })

        doc.save(`${fileName}.pdf`)
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExcelExport}>
                <FileDown className="mr-2 h-4 w-4 text-green-600" />
                Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handlePdfExport}>
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                PDF
            </Button>
        </div>
    )
}
