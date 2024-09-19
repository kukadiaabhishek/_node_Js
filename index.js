const express = require('express');
const cors = require('cors');
const escpos = require('escpos');
escpos.Network = require('escpos-network'); // Ensure this is required if not already done
const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies
app.use(cors()); // Allow all origins
// Mock Order Data
const orderData = {
  kot: "KOT Order: Table 5 1x Chicken Curry 1x Rice",
  saveAndPrint: "Receipt Table 5 Total: 25.00"
};
// Fetch KOT Print Data
app.get('/api/kot', (req, res) => {
  const printData = orderData.kot;
  res.json({ printData });
});
// Fetch Save & Print Data
app.get('/api/receipt', (req, res) => {
  const printData = orderData.saveAndPrint;
  console.log('Data to be printed:', printData)
  res.json({ printData });
});
// Print to Thermal Printer (ESC/POS)
app.post('/api/print', async (req, res) => {
  console.log('Received print job:', req.body);
  const { printerIp, printData } = req.body;
  if (!printerIp || !printData) {
    return res.status(400).json({ error: 'Printer IP and print data are required' });
  }
  // const device = new escpos.Network(printerIp);
  // const printer = new escpos.Printer(device);
  const device = new escpos.Network(printerIp); // Create a Network device
  const printer = new escpos.Printer(device); // Create a Printer instance
  try {
    device.open(() => {
      console.log('Device opened, sending print job...');
      printer
        .align('ct')
        .text(printData)
        .cut()
        .close();
      console.log('Print job sent successfully');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Print error:', error);
    res.status(500).json({ error: 'Failed to print' });
  }
});
// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});