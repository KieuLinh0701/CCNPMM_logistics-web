import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const exportService = {
  // Xuất báo cáo Excel
  async exportToExcel(data, filename = 'financial_report') {
    try {
      console.log('=== EXPORT SERVICE: exportToExcel ===');
      console.log('Data received:', data);

      const workbook = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      if (data.summary) {
        const summaryData = [
          ['Chỉ số', 'Giá trị'],
          ['Tổng đơn hàng', data.summary.totalOrders],
          ['Tổng doanh thu', data.summary.totalRevenue],
          ['Tổng COD', data.summary.totalCOD],
          ['Tổng phí vận chuyển', data.summary.totalShippingFee],
          ['Tổng giảm giá', data.summary.totalDiscount],
          ['Đơn đã giao', data.summary.deliveredOrders],
          ['COD đã thu', data.summary.codCollected],
          ['Phí vận chuyển đã thu', data.summary.shippingFeeCollected],
          ['Tỷ lệ thành công (%)', data.summary.successRate]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');
      }

      // Sheet 2: Thống kê theo bưu cục
      if (data.officeStats && data.officeStats.length > 0) {
        const officeData = [
          ['Bưu cục', 'Số đơn hàng', 'Tổng COD', 'Tổng phí vận chuyển', 'Tổng doanh thu', 'Đơn đã giao']
        ];
        
        data.officeStats.forEach(office => {
          officeData.push([
            office.toOffice?.name || 'N/A',
            office.orderCount || 0,
            office.totalCOD || 0,
            office.totalShippingFee || 0,
            office.totalRevenue || 0,
            office.deliveredCount || 0
          ]);
        });
        
        const officeSheet = XLSX.utils.aoa_to_sheet(officeData);
        XLSX.utils.book_append_sheet(workbook, officeSheet, 'Theo bưu cục');
      }

      // Sheet 3: Thống kê theo loại dịch vụ
      if (data.serviceTypeStats && data.serviceTypeStats.length > 0) {
        const serviceData = [
          ['Loại dịch vụ', 'Số đơn hàng', 'Tổng COD', 'Tổng phí vận chuyển', 'Tổng doanh thu']
        ];
        
        data.serviceTypeStats.forEach(service => {
          serviceData.push([
            service.serviceType?.name || 'N/A',
            service.orderCount || 0,
            service.totalCOD || 0,
            service.totalShippingFee || 0,
            service.totalRevenue || 0
          ]);
        });
        
        const serviceSheet = XLSX.utils.aoa_to_sheet(serviceData);
        XLSX.utils.book_append_sheet(workbook, serviceSheet, 'Theo loại dịch vụ');
      }

      // Sheet 4: Thống kê theo tháng
      if (data.monthlyStats && data.monthlyStats.length > 0) {
        const monthlyData = [
          ['Tháng', 'Số đơn hàng', 'Tổng COD', 'Tổng phí vận chuyển', 'Tổng doanh thu']
        ];
        
        data.monthlyStats.forEach(month => {
          monthlyData.push([
            month.month || 'N/A',
            month.orderCount || 0,
            month.totalCOD || 0,
            month.totalShippingFee || 0,
            month.totalRevenue || 0
          ]);
        });
        
        const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Theo tháng');
      }

      // Tạo buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        success: true,
        data: buffer,
        filename: `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    } catch (error) {
      console.error('❌ Export to Excel error:', error);
      return { success: false, message: 'Lỗi khi xuất file Excel' };
    }
  },

  // Xuất báo cáo PDF
  async exportToPDF(data, filename = 'financial_report') {
    try {
      console.log('=== EXPORT SERVICE: exportToPDF ===');
      console.log('Data received:', data);

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve({
            success: true,
            data: pdfData,
            filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
            mimeType: 'application/pdf'
          });
        });

        doc.on('error', (error) => {
          console.error('PDF generation error:', error);
          reject({ success: false, message: 'Lỗi khi tạo file PDF' });
        });

        // Header
        doc.fontSize(20).text('BÁO CÁO TÀI CHÍNH', { align: 'center' });
        doc.fontSize(12).text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        // Tổng quan
        if (data.summary) {
          doc.fontSize(16).text('TỔNG QUAN', { underline: true });
          doc.moveDown(0.5);
          
          const summaryItems = [
            ['Tổng đơn hàng:', data.summary.totalOrders],
            ['Tổng doanh thu:', `${data.summary.totalRevenue?.toLocaleString()}đ`],
            ['Tổng COD:', `${data.summary.totalCOD?.toLocaleString()}đ`],
            ['Tổng phí vận chuyển:', `${data.summary.totalShippingFee?.toLocaleString()}đ`],
            ['Tổng giảm giá:', `${data.summary.totalDiscount?.toLocaleString()}đ`],
            ['Đơn đã giao:', data.summary.deliveredOrders],
            ['COD đã thu:', `${data.summary.codCollected?.toLocaleString()}đ`],
            ['Phí vận chuyển đã thu:', `${data.summary.shippingFeeCollected?.toLocaleString()}đ`],
            ['Tỷ lệ thành công:', `${data.summary.successRate}%`]
          ];

          summaryItems.forEach(([label, value]) => {
            doc.fontSize(12).text(`${label} ${value}`, { indent: 20 });
          });
          
          doc.moveDown(1);
        }

        // Thống kê theo bưu cục
        if (data.officeStats && data.officeStats.length > 0) {
          doc.fontSize(16).text('THỐNG KÊ THEO BƯU CỤC', { underline: true });
          doc.moveDown(0.5);
          
          data.officeStats.forEach((office, index) => {
            doc.fontSize(12).text(`${index + 1}. ${office.toOffice?.name || 'N/A'}`, { indent: 20 });
            doc.fontSize(10).text(`   - Số đơn hàng: ${office.orderCount || 0}`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng COD: ${(office.totalCOD || 0).toLocaleString()}đ`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng phí vận chuyển: ${(office.totalShippingFee || 0).toLocaleString()}đ`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng doanh thu: ${(office.totalRevenue || 0).toLocaleString()}đ`, { indent: 40 });
            doc.fontSize(10).text(`   - Đơn đã giao: ${office.deliveredCount || 0}`, { indent: 40 });
            doc.moveDown(0.5);
          });
          
          doc.moveDown(1);
        }

        // Thống kê theo loại dịch vụ
        if (data.serviceTypeStats && data.serviceTypeStats.length > 0) {
          doc.fontSize(16).text('THỐNG KÊ THEO LOẠI DỊCH VỤ', { underline: true });
          doc.moveDown(0.5);
          
          data.serviceTypeStats.forEach((service, index) => {
            doc.fontSize(12).text(`${index + 1}. ${service.serviceType?.name || 'N/A'}`, { indent: 20 });
            doc.fontSize(10).text(`   - Số đơn hàng: ${service.orderCount || 0}`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng COD: ${(service.totalCOD || 0).toLocaleString()}đ`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng phí vận chuyển: ${(service.totalShippingFee || 0).toLocaleString()}đ`, { indent: 40 });
            doc.fontSize(10).text(`   - Tổng doanh thu: ${(service.totalRevenue || 0).toLocaleString()}đ`, { indent: 40 });
            doc.moveDown(0.5);
          });
        }

        doc.end();
      });
    } catch (error) {
      console.error('❌ Export to PDF error:', error);
      return { success: false, message: 'Lỗi khi xuất file PDF' };
    }
  }
};

export default exportService;
