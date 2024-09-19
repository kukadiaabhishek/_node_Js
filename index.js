const express = require('express');
const cors = require('cors');
const escpos = require('escpos');
const { Network, Printer } = escpos; // Destructure to use Network and Printer
const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies
app.use(cors()); // Allow all origins
// Mock Order Data
const orderData = {
  kot: "KOT Order: Table 5\n1x Chicken Curry\n1x Rice",
  saveAndPrint: "Receipt\nTable 5\nTotal: $25.00"
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
  const device = new Network(printerIp); // Use the correct constructor
  const printer = new Printer(device);
  try {
    device.open(() => {
      printer
        .align('ct')
        .text(printData)
        .cut()
        .close();
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