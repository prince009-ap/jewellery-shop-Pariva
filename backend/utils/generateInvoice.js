import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Address from '../models/Address.js';

// Create invoices directory if it doesn't exist
const invoicesDir = path.join(process.cwd(), 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

const generateInvoice = async (order) => {
  let browser = null;
  
  try {
    console.log('🌐 Launching Puppeteer for PDF generation...');
    
    // TASK 1️⃣ – DATA CONSOLIDATION: Fetch complete data from multiple sources
    console.log('📊 Fetching complete invoice data...');
    
    // Fetch user details with all required fields
    const user = await User.findById(order.user).select('name email mobile');
    if (!user) {
      throw new Error('User not found for order. Cannot generate invoice.');
    }
    
    // Validate mandatory user fields
    if (!user.name || !user.email || !user.mobile) {
      throw new Error('User profile incomplete: Missing name, email, or mobile number. Cannot generate invoice.');
    }
    
    // Fetch complete address details
    const addressDoc = order.shippingAddress;
    
    if (!addressDoc) {
      throw new Error('Shipping address not found. Cannot generate invoice.');
    }
    
    // TASK 2️⃣ – SAFE DATA MAPPING: Consolidate data with intelligent fallbacks
    const consolidatedData = {
      // Order details (correct payment mapping)
orderId: order._id?.toString(),
invoiceNumber: `INV-${order._id?.toString().slice(-6)}`,
createdAt: order.createdAt || new Date(),
orderStatus: order.orderStatus || 'Pending',

paymentMethod: order.payment?.method?.toUpperCase() || 'COD',

paymentStatus:
  order.payment?.method === 'razorpay'
    ? 'Paid'
    : order.payment?.status?.toLowerCase() === 'paid'
      ? 'Paid'
      : 'Pending',
      
      // Customer details (from User model - guaranteed to exist)
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.mobile,
      
      // Delivery details (from Order shippingAddress with correct field mapping)
      deliveryName: addressDoc.name || 'Home',
      deliveryHouse: addressDoc.addressLine ? addressDoc.addressLine.split(',')[0] || '' : '',
      deliveryFloor: '',
      deliveryArea: addressDoc.addressLine ? addressDoc.addressLine.split(',').slice(1).join(',').trim() : '',
      deliveryLandmark: '',
      deliveryCity: addressDoc.city,
      deliveryState: addressDoc.state || 'Gujarat',
      deliveryPincode: addressDoc.pincode,
      deliveryPhone: addressDoc.mobile || user.mobile,
      
      // Order items and pricing
      items: order.items || [],
      priceBreakup: order.priceBreakup || {}
    };
    
    // TASK 3️⃣ – VALIDATION: Ensure all mandatory fields are present
    const mandatoryFields = [
      'customerName',
      'customerEmail', 
      'customerPhone',
      'deliveryCity',
      'deliveryPincode'
    ];
    
    const missingFields = mandatoryFields.filter(field => !consolidatedData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Cannot generate invoice: Missing mandatory fields - ${missingFields.join(', ')}`);
    }
    
    // Build complete address string (no N/A)
    const addressParts = [
      consolidatedData.deliveryHouse,
      consolidatedData.deliveryFloor,
      consolidatedData.deliveryArea,
      consolidatedData.deliveryLandmark
    ].filter(Boolean);
    
    const cityStatePincode = [
      consolidatedData.deliveryCity,
      consolidatedData.deliveryState,
      consolidatedData.deliveryPincode
    ].filter(Boolean).join(', ');
    
    const fullAddress = addressParts.length > 0 ? 
      addressParts.join(', ') + ', ' + cityStatePincode :
      cityStatePincode;
    
    // Add phone if available
    const addressWithPhone = consolidatedData.deliveryPhone ? 
      fullAddress + '\nPhone: ' + consolidatedData.deliveryPhone :
      fullAddress;
    
    console.log('✅ Invoice data validation passed');
    
    // Launch Puppeteer
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    let executablePath = null;
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        executablePath = chromePath;
        break;
      }
    }
    
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    };
    
    if (executablePath) {
      launchOptions.executablePath = executablePath;
      console.log('🌐 Using system Chrome:', executablePath);
    } else {
      console.log('🌐 Using bundled Chrome (may need installation)');
    }
    
    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Generate unique filename
    const filename = `invoice_${order._id}_${Date.now()}.pdf`;
    const filepath = path.resolve(invoicesDir, filename);
    
    // Calculate estimated delivery days
    const estimatedDeliveryDays = Math.max(3, Math.ceil((order.items?.length || 0) * 2));
    
    // Create HTML template for invoice
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Invoice - PARIVA Jewellery</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            font-size: 12px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #d4af37;
          }
          
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #d4af37;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .invoice-info {
            flex: 1;
          }
          
          .invoice-info h3 {
            margin: 0 0 15px 0;
            color: #d4af37;
            font-size: 16px;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 5px;
          }
          
          .invoice-info p {
            margin: 8px 0;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .invoice-info strong {
            color: #d4af37;
            font-weight: 600;
          }
          
          .order-items {
            margin: 30px 0;
          }
          
          .order-items h3 {
            color: #d4af37;
            margin-bottom: 20px;
            font-size: 18px;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 8px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
          }
          
          .items-table th {
            background: #d4af37;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            border: 1px solid #d4af37;
          }
          
          .items-table td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          
          .items-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .total-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 14px;
            align-items: center;
          }
          
          .total-row.grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #d4af37;
            border-top: 2px solid #d4af37;
            padding-top: 15px;
            margin-top: 20px;
          }
          
          .delivery-info {
            margin: 30px 0;
            padding: 20px;
            background: #fff9e6;
            border-radius: 8px;
            border-left: 4px solid #d4af37;
            border: 1px solid #f0e6d2;
          }
          
          .delivery-info h3 {
            color: #d4af37;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .delivery-info p {
            margin: 8px 0;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .tracking-info {
            margin: 20px 0;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
            border: 1px solid #c3e6cb;
          }
          
          .tracking-info h3 {
            color: #2e7d32;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .tracking-info p {
            margin: 5px 0;
            font-size: 11px;
            line-height: 1.4;
          }
          
          .tracking-id {
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
            border: 1px solid #dee2e6;
            display: inline-block;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            background: #ffc107;
            color: #000;
            border: 1px solid #e0a800;
          }
          
          .status-badge.paid {
            background: #4caf50;
            color: white;
            border: 1px solid #45a049;
          }
          
          .status-badge.pending {
            background: #ff9800;
            color: white;
            border: 1px solid #f57c00;
          }
          
          .status-badge.confirmed {
            background: #2196f3;
            color: white;
            border: 1px solid #1976d2;
          }
          
          .status-badge.delivered {
            background: #4caf50;
            color: white;
            border: 1px solid #45a049;
          }
          
          .status-badge.cancelled {
            background: #f44336;
            color: white;
            border: 1px solid #d32f2f;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(212, 175, 55, 0.05);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
          }
          
          @media print {
            body { margin: 0; }
            .container { box-shadow: none; border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">PARIVA JEWELLERY</div>
        <div class="container">
          <div class="header">
            <div class="logo">
              💎 PARIVA JEWELLERY
            </div>
            <div class="invoice-title">Order Invoice</div>
          </div>
          
          <div class="invoice-header">
            <div class="invoice-info">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${consolidatedData.invoiceNumber}</p>
              <p><strong>Order ID:</strong> ${consolidatedData.orderId}</p>
              <p><strong>Date:</strong> ${new Date(consolidatedData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Status:</strong> <span class="status-badge ${consolidatedData.orderStatus?.toLowerCase()}">${consolidatedData.orderStatus}</span></p>
            </div>
            <div class="invoice-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${consolidatedData.customerName}</p>
              <p><strong>Email:</strong> ${consolidatedData.customerEmail}</p>
              <p><strong>Phone:</strong> ${consolidatedData.customerPhone}</p>
            </div>
            <div class="invoice-info">
              <h3>📍 Delivery Address</h3>
              <p><strong>Type:</strong> ${consolidatedData.deliveryName}</p>
              <p><strong>Address:</strong> ${addressWithPhone.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div class="order-items">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%">Product Name</th>
                  <th style="width: 15%">Quantity</th>
                  <th style="width: 15%">Unit Price</th>
                  <th style="width: 15%">Metal</th>
                  <th style="width: 15%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${consolidatedData.items.map(item => `
                  <tr>
                    <td>${item?.name || 'Premium Jewellery Product'}</td>
                    <td>${item?.qty || 0}</td>
                    <td>₹${(item?.price || 0).toLocaleString('en-IN')}</td>
                    <td>${item?.metal || 'Gold'}</td>
                    <td>₹${((item?.price || 0) * (item?.qty || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Gold Value:</span>
                <span>₹${(consolidatedData.priceBreakup?.goldValue || 0).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span>Making Charges:</span>
                <span>₹${(consolidatedData.priceBreakup?.makingCharge || 0).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span>Stone Charges:</span>
                <span>₹${(consolidatedData.priceBreakup?.stoneCharge || 0).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <span>GST:</span>
                <span>₹${(consolidatedData.priceBreakup?.gst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount:</span>
                <span>₹${(consolidatedData.priceBreakup?.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div class="delivery-info">
            <h3>📦 Order Information</h3>
            <p><strong>Estimated Delivery:</strong> ${estimatedDeliveryDays} business days</p>
            <p><strong>Payment Method:</strong> ${consolidatedData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p><strong>Payment Status:</strong> <span class="status-badge ${consolidatedData.paymentStatus?.toLowerCase()}">${consolidatedData.paymentStatus}</span></p>
            <p><strong>Order Status:</strong> <span class="status-badge ${consolidatedData.orderStatus?.toLowerCase()}">${consolidatedData.orderStatus}</span></p>
          </div>
          
          <div class="tracking-info">
            <h3>📍 Order Tracking</h3>
            <p><strong>Tracking ID:</strong> <span class="tracking-id">${consolidatedData.orderId}</span></p>
            <p>You can track your order status using this tracking ID on our website or mobile app.</p>
            <p><strong>Customer Support:</strong> senjaliyaprince009@gmail.com | +91 97149 07350</p>
          </div>
          
          <div class="footer">
            <p>© 2024 PARIVA Jewellery. All rights reserved.</p>
            <p>Thank you for choosing PARIVA Jewellery for your fine jewellery needs!</p>
            <p>This is an automated invoice. Please keep it for your records.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Set content and wait for page to load
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log('📄 Generating PDF with Puppeteer...');
    
    // Wait for PDF to be fully generated and written to disk
    const generatedPdfBuffer = await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
          PARIVA Jewellery - Order Invoice
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; color: #666; text-align: center; width: 100%;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: true
    });
    
    console.log(`✅ PDF buffer generated: ${generatedPdfBuffer.length} bytes`);
    
    // Wait a moment to ensure file is fully written to disk
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify file exists and has content
    let fileExists = false;
    let fileSize = 0;
    let retries = 0;
    const maxRetries = 10;
    
    while (!fileExists && retries < maxRetries) {
      try {
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          fileSize = stats.size;
          if (fileSize > 0) {
            fileExists = true;
            console.log(`✅ PDF file verified: ${filename} (${fileSize} bytes)`);
          } else {
            console.log(`⏳ File exists but empty, retrying... (${retries + 1}/${maxRetries})`);
          }
        } else {
          console.log(`⏳ File not yet created, retrying... (${retries + 1}/${maxRetries})`);
        }
      } catch (error) {
        console.log(`⏳ Error checking file, retrying... (${retries + 1}/${maxRetries}): ${error.message}`);
      }
      
      if (!fileExists) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    if (!fileExists) {
      throw new Error(`PDF file could not be verified after ${maxRetries} attempts`);
    }
    
    console.log(`✅ Puppeteer PDF generated: ${filename}`);
    
    // Read the generated file and return buffer
    const pdfBuffer = fs.readFileSync(filepath);
    console.log(`📄 PDF file read: ${pdfBuffer.length} bytes`);
    
    // Close page before browser
    await page.close();
    console.log('📄 Puppeteer page closed');
    
    // Return the buffer instead of filepath
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Puppeteer PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Puppeteer browser closed');
    }
  }
};

export { generateInvoice };
